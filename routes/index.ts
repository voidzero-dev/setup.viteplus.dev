import { defineHandler } from "void";
import { kv } from "void/kv";

declare const __DEPLOY_COMMIT__: string;
declare const __DEPLOY_TIME__: string;

const GITHUB_OWNER = "voidzero-dev";
const GITHUB_REPO = "vite-plus";
const ASSET_NAMES: Record<Arch, string> = {
  x64: "vp-setup-x86_64-pc-windows-msvc.exe",
  arm64: "vp-setup-aarch64-pc-windows-msvc.exe",
};
const LATEST_CACHE_TTL = 300; // 5 minutes
const DEFAULT_DIST_TAG = "latest";

type Arch = "x64" | "arm64";

interface CachedRelease {
  tag: string;
  assets: Partial<Record<Arch, string>>;
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

export function buildReleaseFromTag(tag: string): CachedRelease {
  const base = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/download/${tag}`;
  return {
    tag,
    assets: {
      x64: `${base}/${ASSET_NAMES.x64}`,
      arm64: `${base}/${ASSET_NAMES.arm64}`,
    },
  };
}

async function fetchNpmDistTagVersion(distTag: string): Promise<string | null> {
  try {
    const res = await fetch("https://registry.npmjs.com/vite-plus", {
      headers: { Accept: "application/vnd.npm.install-v1+json" },
    });
    if (!res.ok) {
      console.error(`npm registry error: ${res.status} ${res.statusText}`);
      return null;
    }
    const data = (await res.json()) as { "dist-tags"?: Record<string, string> };
    return data["dist-tags"]?.[distTag] ?? null;
  } catch (err) {
    console.error("Failed to fetch version from npm registry:", err);
    return null;
  }
}

const LATEST_CACHE_KEY = "release:latest";
const LATEST_STALE_KEY = "release:latest:stale";

async function getRelease(tag: string | undefined): Promise<CachedRelease | null> {
  // Tags are immutable — construct the download URL directly, no network or cache needed
  if (tag) return buildReleaseFromTag(tag);

  // "Latest" path: use KV cache to avoid hitting npm on every request
  const cached = await kv.get<CachedRelease>(LATEST_CACHE_KEY);
  if (cached) return cached;

  const version = await fetchNpmDistTagVersion(DEFAULT_DIST_TAG);
  if (version) {
    const release = buildReleaseFromTag(`v${version}`);
    await Promise.all([
      kv.put(LATEST_CACHE_KEY, release, { ttl: LATEST_CACHE_TTL }),
      kv.put(LATEST_STALE_KEY, release, { ttl: LATEST_CACHE_TTL + 3600 }),
    ]);
    return release;
  }

  // npm unreachable — fall back to stale cache
  return kv.get<CachedRelease>(LATEST_STALE_KEY);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderDownloadPage(release: CachedRelease): string {
  const tag = escapeHtml(release.tag);
  const x64Url = release.assets.x64 ? escapeHtml(release.assets.x64) : "";
  const arm64Url = release.assets.arm64 ? escapeHtml(release.assets.arm64) : "";
  const hasX64 = !!x64Url;
  const hasArm64 = !!arm64Url;
  const hasBoth = hasX64 && hasArm64;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Download Vite+ ${tag}</title>
<link rel="icon" href="https://viteplus.dev/favicon.svg">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#fafafa;color:#1a1a1a}
.container{text-align:center;max-width:480px;padding:40px 24px}
.logo{width:48px;height:48px;margin-bottom:20px}
h1{font-size:1.5rem;font-weight:700;margin-bottom:6px}
.version{color:#666;font-size:.95rem;margin-bottom:28px}
.btn{display:inline-block;padding:14px 36px;border-radius:8px;font-weight:600;font-size:1rem;text-decoration:none;transition:opacity .15s}
.btn-primary{background:#18181b;color:#fff}
.btn-primary:hover{opacity:.85}
.alt{margin-top:14px;font-size:.875rem;color:#666}
.alt a{color:#2563eb;text-decoration:none}
.alt a:hover{text-decoration:underline}
.divider{margin:24px auto;width:40px;border:none;border-top:1px solid #e5e5e5}
.note{color:#999;font-size:.85rem;line-height:1.6}
.note a{color:#2563eb;text-decoration:none}
.note a:hover{text-decoration:underline}
.deploy-info{color:#fafafa;font-size:.7rem;margin-top:24px;user-select:all}
.deploy-info::selection{color:#999;background:#e5e5e5}
</style>
</head>
<body>
<div class="container">
  <img class="logo" src="https://viteplus.dev/favicon.svg" alt="Vite+">
  <h1>Download Vite+ Setup</h1>
  <p class="version">${tag}</p>

  <a id="download-main" class="btn btn-primary"
     href="${hasX64 ? x64Url : arm64Url}"${
       hasBoth
         ? `
     data-x64-url="${x64Url}"
     data-arm64-url="${arm64Url}"`
         : ""
     }>
    Download for Windows ${hasX64 ? "(x64)" : "(ARM64)"}
  </a>

${
  hasBoth
    ? `  <p class="alt" id="alt-download">
    Also available: <a href="${arm64Url}" download>Windows ARM64</a>
  </p>`
    : ""
}

  <hr class="divider">
  <p class="note">
    Windows installer for <a href="https://viteplus.dev">Vite+</a>, the unified toolchain for the web.
  </p>
  <p class="deploy-info">deploy: ${escapeHtml(__DEPLOY_COMMIT__)} · ${escapeHtml(__DEPLOY_TIME__)}</p>
</div>
${
  hasBoth
    ? `
<script>
// Detect Windows ARM64 using the UA Client Hints API (navigator.userAgentData).
// The legacy navigator.userAgent string is unreliable for distinguishing ARM64
// from x64 on Windows — Chrome and Edge on ARM64 report "x64" because they
// run x86-emulated, so the UA string says "Win64; x64" on both architectures.
// getHighEntropyValues() provides the real hardware architecture.

async function detectWindowsTarget() {
  try {
    if (navigator.userAgentData) {
      var hints = await navigator.userAgentData.getHighEntropyValues(
        ["platform", "architecture", "bitness"]
      );
      if (hints.platform === "Windows"
          && hints.architecture === "arm"
          && hints.bitness === "64") {
        return "aarch64-pc-windows-msvc";
      }
    }
  } catch (_) {
    // userAgentData unavailable, denied, or threw — fall through to default
  }
  return "x86_64-pc-windows-msvc";
}

async function setupDownloadLink() {
  var mainBtn = document.getElementById("download-main");
  var altEl = document.getElementById("alt-download");
  if (!mainBtn) return;

  var target = await detectWindowsTarget();
  if (target !== "aarch64-pc-windows-msvc") return; // x64 is already the default

  // Swap: main button → ARM64, secondary link → x64
  var arm64Url = mainBtn.getAttribute("data-arm64-url");
  var x64Url = mainBtn.getAttribute("data-x64-url");
  if (!arm64Url) return;

  mainBtn.href = arm64Url;
  mainBtn.textContent = "Download for Windows (ARM64)";

  if (altEl && x64Url) {
    altEl.innerHTML = 'Also available: <a href="' + x64Url + '" download>Windows x64</a>';
  }
}

setupDownloadLink();
</script>`
    : ""
}
</body>
</html>`;
}

export const GET = defineHandler(async (c) => {
  const queryArch = c.req.query("arch");
  const tag = c.req.query("tag");

  // When ?arch= is specified, redirect directly (backward-compatible for CLI/curl)
  if (queryArch) {
    const arch = detectArch(queryArch, c.req.header("user-agent"));
    if (arch === null) {
      return c.json({ error: "Invalid architecture. Use 'x64' or 'arm64'" }, 400);
    }
    const release = await getRelease(tag || undefined);
    if (!release) {
      return c.json({ error: tag ? `Release '${tag}' not found` : "No release found" }, 404);
    }
    const downloadUrl = release.assets[arch];
    if (!downloadUrl) {
      return c.json({ error: `No installer found for architecture: ${arch}` }, 404);
    }
    return c.redirect(downloadUrl, 302);
  }

  // Serve the download page with client-side architecture detection
  const release = await getRelease(tag || undefined);
  if (!release) {
    return c.json({ error: tag ? `Release '${tag}' not found` : "No release found" }, 404);
  }
  return c.html(renderDownloadPage(release), { headers: { "Cache-Control": "no-store" } });
});
