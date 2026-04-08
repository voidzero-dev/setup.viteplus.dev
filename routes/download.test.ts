import { describe, expect, it } from "vite-plus/test";
import { detectArch, parseRelease } from "./download";

describe("detectArch", () => {
  it("defaults to x64 when no query param or user-agent", () => {
    expect(detectArch(undefined, undefined)).toBe("x64");
  });

  it("returns x64 for explicit ?arch=x64", () => {
    expect(detectArch("x64", undefined)).toBe("x64");
  });

  it("returns x64 for ?arch=x86_64", () => {
    expect(detectArch("x86_64", undefined)).toBe("x64");
  });

  it("returns arm64 for ?arch=arm64", () => {
    expect(detectArch("arm64", undefined)).toBe("arm64");
  });

  it("returns arm64 for ?arch=aarch64", () => {
    expect(detectArch("aarch64", undefined)).toBe("arm64");
  });

  it("is case-insensitive for query param", () => {
    expect(detectArch("ARM64", undefined)).toBe("arm64");
    expect(detectArch("X64", undefined)).toBe("x64");
  });

  it("returns null for invalid arch", () => {
    expect(detectArch("x86", undefined)).toBeNull();
    expect(detectArch("mips", undefined)).toBeNull();
  });

  it("detects ARM64 from User-Agent", () => {
    expect(detectArch(undefined, "Mozilla/5.0 (Windows NT 10.0; ARM64) AppleWebKit/537.36")).toBe(
      "arm64",
    );
  });

  it("detects aarch64 from User-Agent", () => {
    expect(detectArch(undefined, "SomeClient/1.0 (aarch64)")).toBe("arm64");
  });

  it("defaults to x64 for typical Windows User-Agent", () => {
    expect(
      detectArch(undefined, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"),
    ).toBe("x64");
  });

  it("defaults to x64 for Windows Edge User-Agent", () => {
    expect(
      detectArch(
        undefined,
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0",
      ),
    ).toBe("x64");
  });

  it("query param takes precedence over User-Agent", () => {
    expect(detectArch("x64", "Mozilla/5.0 (Windows NT 10.0; ARM64) AppleWebKit/537.36")).toBe(
      "x64",
    );
  });
});

describe("parseRelease", () => {
  it("parses both x64 and arm64 assets", () => {
    const result = parseRelease({
      tag_name: "v0.1.17-alpha.0",
      assets: [
        {
          name: "vp-setup-x86_64-pc-windows-msvc.exe",
          browser_download_url:
            "https://github.com/voidzero-dev/vite-plus/releases/download/v0.1.17-alpha.0/vp-setup-x86_64-pc-windows-msvc.exe",
        },
        {
          name: "vp-setup-aarch64-pc-windows-msvc.exe",
          browser_download_url:
            "https://github.com/voidzero-dev/vite-plus/releases/download/v0.1.17-alpha.0/vp-setup-aarch64-pc-windows-msvc.exe",
        },
      ],
    });
    expect(result).toEqual({
      tag: "v0.1.17-alpha.0",
      assets: {
        x64: "https://github.com/voidzero-dev/vite-plus/releases/download/v0.1.17-alpha.0/vp-setup-x86_64-pc-windows-msvc.exe",
        arm64:
          "https://github.com/voidzero-dev/vite-plus/releases/download/v0.1.17-alpha.0/vp-setup-aarch64-pc-windows-msvc.exe",
      },
    });
  });

  it("returns null when no matching assets exist", () => {
    const result = parseRelease({
      tag_name: "v1.0.0",
      assets: [
        {
          name: "some-other-file.tar.gz",
          browser_download_url: "https://example.com/other.tar.gz",
        },
      ],
    });
    expect(result).toBeNull();
  });

  it("handles release with only x64 asset", () => {
    const result = parseRelease({
      tag_name: "v0.1.0",
      assets: [
        {
          name: "vp-setup-x86_64-pc-windows-msvc.exe",
          browser_download_url: "https://example.com/x64.exe",
        },
      ],
    });
    expect(result).not.toBeNull();
    expect(result!.assets.x64).toBe("https://example.com/x64.exe");
    expect(result!.assets.arm64).toBeUndefined();
  });
});
