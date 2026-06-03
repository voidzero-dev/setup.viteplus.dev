import { defineMiddleware } from "void";

// The vite.plus vanity domain exists purely as an installer entry point:
//   curl https://vite.plus     | sh   -> shell installer
//   irm  https://vite.plus/ps1 | iex  -> PowerShell installer
const INSTALL_HOST = "vite.plus";
const INSTALL_SH = "https://viteplus.dev/install.sh";
const INSTALL_PS1 = "https://viteplus.dev/install.ps1";

export function buildViteplusRedirect(host: string | undefined, requestUrl: string): string | null {
  if (host !== INSTALL_HOST) return null;
  const path = new URL(requestUrl).pathname.replace(/\/+$/, "");
  return path === "/ps1" ? INSTALL_PS1 : INSTALL_SH;
}

export default defineMiddleware(async (c, next) => {
  const target = buildViteplusRedirect(c.req.header("host"), c.req.url);
  if (target) return c.redirect(target, 302);
  await next();
});
