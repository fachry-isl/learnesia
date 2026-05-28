import { describe, it, expect } from "vitest";

describe("api module SSR safety", () => {
  it("loads without throwing when localStorage is unavailable", async () => {
    const originalLocalStorage = globalThis.localStorage;
    // @ts-expect-error simulate SSR
    delete globalThis.localStorage;

    await expect(import("@/services/api")).resolves.toBeDefined();

    globalThis.localStorage = originalLocalStorage;
  });
});
