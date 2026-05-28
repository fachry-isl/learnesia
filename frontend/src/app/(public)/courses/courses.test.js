import { describe, it, expect } from "vitest";

describe("courses route metadata", () => {
  it("exports SEO title and description", async () => {
    const layout = await import("@/app/(public)/courses/layout.jsx");
    expect(layout.metadata.title).toBeTruthy();
    expect(layout.metadata.description).toBeTruthy();
  });
});
