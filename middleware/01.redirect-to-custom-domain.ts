import { defineMiddleware } from "void";

const LEGACY_HOST = "vp-setup.void.app";
const CANONICAL_ORIGIN = "https://setup.viteplus.dev";

export function buildRedirectTarget(host: string | undefined, requestUrl: string): string | null {
  if (host !== LEGACY_HOST) return null;
  const url = new URL(requestUrl);
  return `${CANONICAL_ORIGIN}${url.pathname}${url.search}`;
}

export default defineMiddleware(async (c, next) => {
  const target = buildRedirectTarget(c.req.header("host"), c.req.url);
  if (target) return c.redirect(target, 301);
  await next();
});
