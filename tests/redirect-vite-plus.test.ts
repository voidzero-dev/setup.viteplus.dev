import { describe, expect, it } from "vite-plus/test";
import { buildViteplusRedirect } from "../middleware/02.redirect-vite-plus";

describe("buildViteplusRedirect", () => {
  it("redirects the bare domain to the shell installer", () => {
    expect(buildViteplusRedirect("vite.plus", "https://vite.plus/")).toBe(
      "https://viteplus.dev/install.sh",
    );
  });

  it("redirects /ps1 to the PowerShell installer", () => {
    expect(buildViteplusRedirect("vite.plus", "https://vite.plus/ps1")).toBe(
      "https://viteplus.dev/install.ps1",
    );
  });

  it("tolerates a trailing slash on /ps1", () => {
    expect(buildViteplusRedirect("vite.plus", "https://vite.plus/ps1/")).toBe(
      "https://viteplus.dev/install.ps1",
    );
  });

  it("redirects any other path to the shell installer", () => {
    expect(buildViteplusRedirect("vite.plus", "https://vite.plus/anything")).toBe(
      "https://viteplus.dev/install.sh",
    );
  });

  it("ignores query strings when picking the target", () => {
    expect(buildViteplusRedirect("vite.plus", "https://vite.plus/?ref=docs")).toBe(
      "https://viteplus.dev/install.sh",
    );
  });

  it("returns null for the canonical download host", () => {
    expect(buildViteplusRedirect("setup.viteplus.dev", "https://setup.viteplus.dev/")).toBeNull();
  });

  it("returns null for the legacy host (handled by its own middleware)", () => {
    expect(buildViteplusRedirect("vp-setup.void.app", "https://vp-setup.void.app/")).toBeNull();
  });

  it("returns null for localhost during dev", () => {
    expect(buildViteplusRedirect("localhost:5173", "http://localhost:5173/ps1")).toBeNull();
  });

  it("returns null when the host header is missing", () => {
    expect(buildViteplusRedirect(undefined, "https://vite.plus/")).toBeNull();
  });
});
