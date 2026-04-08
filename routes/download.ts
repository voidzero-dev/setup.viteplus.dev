import { defineHandler } from "void";
import { kv } from "void/kv";

const GITHUB_OWNER = "voidzero-dev";
const GITHUB_REPO = "vite-plus";
const ASSET_NAMES: Record<Arch, string> = {
  x64: "vp-setup-x86_64-pc-windows-msvc.exe",
  arm64: "vp-setup-aarch64-pc-windows-msvc.exe",
};
const LATEST_CACHE_TTL = 300; // 5 minutes
const TAGGED_CACHE_TTL = 86400; // 24 hours

type Arch = "x64" | "arm64";

interface CachedRelease {
  tag: string;
  assets: Partial<Record<Arch, string>>;
}

interface GitHubRelease {
  tag_name: string;
  assets: Array<{ name: string; browser_download_url: string }>;
}

export function detectArch(
  queryArch: string | undefined,
  userAgent: string | undefined,
): Arch | null {
  if (queryArch) {
    const normalized = queryArch.toLowerCase();
    if (normalized === "arm64" || normalized === "aarch64") return "arm64";
    if (normalized === "x64" || normalized === "x86_64") return "x64";
    return null;
  }
  if (userAgent && /arm64|aarch64/i.test(userAgent)) return "arm64";
  return "x64";
}

export function parseRelease(release: GitHubRelease): CachedRelease | null {
  const assets: Partial<Record<Arch, string>> = {};
  for (const asset of release.assets) {
    if (asset.name === ASSET_NAMES.x64) assets.x64 = asset.browser_download_url;
    if (asset.name === ASSET_NAMES.arm64) assets.arm64 = asset.browser_download_url;
  }
  if (!assets.x64 && !assets.arm64) return null;
  return { tag: release.tag_name, assets };
}

async function fetchGitHub(path: string, githubToken: string | undefined): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "vp-setup-exe-downloader",
  };
  if (githubToken) headers.Authorization = `Bearer ${githubToken}`;
  return fetch(`https://api.github.com${path}`, { headers });
}

async function fetchRelease(
  tag: string | undefined,
  githubToken: string | undefined,
): Promise<GitHubRelease | null> {
  if (tag) {
    const res = await fetchGitHub(
      `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/tags/${tag}`,
      githubToken,
    );
    if (!res.ok) {
      console.error(`GitHub API error: ${res.status} ${res.statusText} for tag ${tag}`);
      return null;
    }
    return (await res.json()) as GitHubRelease;
  }

  // Includes pre-releases, unlike /releases/latest
  const res = await fetchGitHub(
    `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases?per_page=10`,
    githubToken,
  );
  if (!res.ok) {
    console.error(`GitHub API error: ${res.status} ${res.statusText} for releases list`);
    return null;
  }
  const releases = (await res.json()) as GitHubRelease[];
  return (
    releases.find((r) =>
      r.assets.some((a) => a.name === ASSET_NAMES.x64 || a.name === ASSET_NAMES.arm64),
    ) ?? null
  );
}

function cacheKey(tag: string | undefined): string {
  return tag ? `release:tag:${tag}` : "release:latest";
}

function staleCacheKey(tag: string | undefined): string {
  return `${cacheKey(tag)}:stale`;
}

async function getRelease(
  tag: string | undefined,
  githubToken: string | undefined,
): Promise<CachedRelease | null> {
  const key = cacheKey(tag);
  const cached = await kv.get<CachedRelease>(key);
  if (cached) return cached;

  try {
    const release = await fetchRelease(tag, githubToken);
    if (!release) return null;
    const parsed = parseRelease(release);
    if (parsed) {
      const ttl = tag ? TAGGED_CACHE_TTL : LATEST_CACHE_TTL;
      const staleTtl = ttl + 3600;
      await Promise.all([
        kv.put(key, parsed, { ttl }),
        kv.put(staleCacheKey(tag), parsed, { ttl: staleTtl }),
      ]);
    }
    return parsed;
  } catch (err) {
    console.error("Failed to fetch release from GitHub:", err);
    return await kv.get<CachedRelease>(staleCacheKey(tag));
  }
}

export const GET = defineHandler(async (c) => {
  const queryArch = c.req.query("arch");
  const tag = c.req.query("tag");
  const userAgent = c.req.header("user-agent");

  const arch = detectArch(queryArch, userAgent);
  if (arch === null) {
    return c.json({ error: "Invalid architecture. Use 'x64' or 'arm64'" }, 400);
  }

  const githubToken = c.env.GITHUB_TOKEN as string | undefined;
  const release = await getRelease(tag || undefined, githubToken);

  if (!release) {
    return c.json({ error: tag ? `Release '${tag}' not found` : "No release found" }, 404);
  }

  const downloadUrl = release.assets[arch];
  if (!downloadUrl) {
    return c.json({ error: `No installer found for architecture: ${arch}` }, 404);
  }

  return c.redirect(downloadUrl, 302);
});
