import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("static logo assets", () => {
  it("serves logos from public/", () => {
    const publicDir = path.resolve(__dirname, "../../public");
    expect(fs.existsSync(path.join(publicDir, "li_logo_full.png"))).toBe(true);
    expect(fs.existsSync(path.join(publicDir, "li_logo_lite_white.png"))).toBe(true);
  });
});
