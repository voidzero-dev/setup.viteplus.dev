import { describe, expect, it } from "vite-plus/test";
import { buildRedirectTarget } from "../middleware/01.redirect-to-custom-domain";

describe("buildRedirectTarget", () => {
  it("redirects legacy host root to canonical origin", () => {
    expect(buildRedirectTarget("vp-setup.void.app", "https://vp-setup.void.app/")).toBe(
      "https://setup.viteplus.dev/",
    );
  });

  it("preserves path and query string", () => {
    expect(
      buildRedirectTarget("vp-setup.void.app", "https://vp-setup.void.app/?tag=v1.2.3&arch=arm64"),
    ).toBe("https://setup.viteplus.dev/?tag=v1.2.3&arch=arm64");
  });

  it("returns null for the custom domain (no redirect)", () => {
    expect(buildRedirectTarget("setup.viteplus.dev", "https://setup.viteplus.dev/")).toBeNull();
  });

  it("returns null for localhost during dev", () => {
    expect(buildRedirectTarget("localhost:5173", "http://localhost:5173/")).toBeNull();
  });

  it("returns null when host header is missing", () => {
    expect(buildRedirectTarget(undefined, "https://vp-setup.void.app/")).toBeNull();
  });

  it("does not match preview/staging subdomains", () => {
    expect(
      buildRedirectTarget("vp-setup-staging.void.app", "https://vp-setup-staging.void.app/"),
    ).toBeNull();
  });
});
