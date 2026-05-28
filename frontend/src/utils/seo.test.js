import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  absoluteUrl,
  buildCourseJsonLd,
  buildPageMetadata,
  courseOverviewPath,
} from "./seo";

describe("seo utils", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://learnesia.co.id");
  });

  it("builds absolute URLs", () => {
    expect(absoluteUrl("/courses")).toBe("https://learnesia.co.id/courses");
    expect(courseOverviewPath("habit")).toBe("/course/habit/overview");
  });

  it("includes canonical and openGraph in page metadata", () => {
    const meta = buildPageMetadata({
      title: "Test — Learnesia",
      description: "Test description",
      path: "/courses",
    });

    expect(meta.alternates.canonical).toBe("https://learnesia.co.id/courses");
    expect(meta.openGraph.url).toBe("https://learnesia.co.id/courses");
    expect(meta.openGraph.title).toBe("Test — Learnesia");
    expect(meta.twitter.card).toBe("summary_large_image");
  });

  it("builds Course JSON-LD", () => {
    const jsonLd = buildCourseJsonLd({
      course_slug: "the-power-of-habit",
      course_name: "The Power of Habit",
      course_description: "Build better habits.",
      lessons: [{ id: 1 }],
    });

    expect(jsonLd["@type"]).toBe("Course");
    expect(jsonLd.url).toBe(
      "https://learnesia.co.id/course/the-power-of-habit/overview",
    );
    expect(jsonLd.numberOfLessons).toBe(1);
  });
});
