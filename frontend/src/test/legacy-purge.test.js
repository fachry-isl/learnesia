import { describe, it, expect } from "vitest";
import { execSync } from "child_process";
import path from "path";

describe("legacy purge gate", () => {
  it("has no react-router-dom, import.meta.env, or VITE_ references in src/", () => {
    const frontendSrc = path.resolve(__dirname, "..");
    const result = execSync(
      `grep -rE "react-router-dom|import\\.meta\\.env|VITE_" "${frontendSrc}" --include="*.jsx" --include="*.js" --include="*.ts" --include="*.tsx" --exclude="*.test.*" || true`,
      { encoding: "utf8" },
    ).trim();

    expect(result).toBe("");
  });
});
