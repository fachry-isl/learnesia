import { describe, it, expect } from "vitest";
import {
  getSortedLessons,
  getSortedModules,
  getFlattenedLessons,
} from "@/utils/courseHelpers";

describe("courseHelpers", () => {
  it("orders modules and lessons by order field", () => {
    const course = {
      modules: [
        {
          id: 2,
          name: "Second",
          order: 1,
          lessons: [
            { id: 20, lesson_name: "B", order: 1 },
            { id: 10, lesson_name: "A", order: 0 },
          ],
        },
        { id: 1, name: "First", order: 0, lessons: [] },
      ],
    };

    expect(getSortedModules(course.modules).map((m) => m.name)).toEqual([
      "First",
      "Second",
    ]);
    expect(
      getSortedModules(course.modules)[1].lessons.map((l) => l.lesson_name),
    ).toEqual(["A", "B"]);
  });

  it("flattens lessons from all modules in module order", () => {
    const course = {
      modules: [
        {
          order: 0,
          lessons: [{ lesson_slug: "a", order: 0 }],
        },
        {
          order: 1,
          lessons: [
            { lesson_slug: "b", order: 1 },
            { lesson_slug: "c", order: 0 },
          ],
        },
      ],
    };

    expect(getFlattenedLessons(course).map((l) => l.lesson_slug)).toEqual([
      "a",
      "c",
      "b",
    ]);
  });

  it("getSortedLessons still sorts a flat lessons array", () => {
    const lessons = [
      { lesson_slug: "z", order: 2 },
      { lesson_slug: "a", order: 0 },
    ];
    expect(getSortedLessons(lessons).map((l) => l.lesson_slug)).toEqual([
      "a",
      "z",
    ]);
  });
});
