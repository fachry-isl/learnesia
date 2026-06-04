import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CourseSyllabus from "@/components/public/CourseSyllabus";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("CourseSyllabus", () => {
  const modules = [
    {
      id: 1,
      name: "Foundations",
      order: 0,
      description: "Core concepts",
      lessons: [
        {
          id: 10,
          lesson_name: "Intro",
          lesson_slug: "intro",
          estimated_time: 5,
          order: 0,
          lesson_learning_objectives: ["Learn basics"],
        },
      ],
    },
    {
      id: 2,
      name: "Advanced",
      order: 1,
      lessons: [
        {
          id: 20,
          lesson_name: "Deep Dive",
          lesson_slug: "deep-dive",
          estimated_time: 12,
          order: 0,
          lesson_learning_objectives: [],
        },
      ],
    },
  ];

  it("renders modules as collapsible groups with lesson links", () => {
    render(
      <CourseSyllabus
        courseSlug="test-course"
        modules={modules}
        defaultExpandedModuleId={1}
      />,
    );

    expect(screen.getByRole("heading", { name: "Foundations" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Advanced" })).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /Intro/i })).toHaveAttribute(
      "href",
      "/course/test-course/lesson/intro",
    );

    fireEvent.click(screen.getByRole("button", { name: /Advanced/i }));
    expect(screen.getByRole("link", { name: /Deep Dive/i })).toBeInTheDocument();
  });
});
