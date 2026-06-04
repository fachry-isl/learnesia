import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import LessonSidebarNav from "@/components/public/LessonSidebarNav";

vi.mock("next/link", () => ({
  default: ({ href, children, className }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe("LessonSidebarNav", () => {
  afterEach(() => cleanup());

  const modules = [
    {
      id: 1,
      name: "Module 1: Getting Started",
      order: 0,
      lessons: [
        {
          id: 10,
          lesson_name: "Welcome",
          lesson_slug: "welcome",
          estimated_time: 5,
          order: 0,
        },
        {
          id: 11,
          lesson_name: "Setup",
          lesson_slug: "setup",
          estimated_time: 5,
          order: 1,
        },
      ],
    },
    {
      id: 2,
      name: "Module 2: Core Concepts",
      order: 1,
      lessons: [
        {
          id: 20,
          lesson_name: "Key Ideas",
          lesson_slug: "key-ideas",
          estimated_time: 8,
          order: 0,
        },
      ],
    },
  ];

  const sortedLessons = [
    modules[0].lessons[0],
    modules[0].lessons[1],
    modules[1].lessons[0],
  ];

  it("groups lessons under module headings when modules are provided", () => {
    render(
      <LessonSidebarNav
        courseSlug="demo-course"
        modules={modules}
        sortedLessons={sortedLessons}
        activeLessonSlug="welcome"
        currentLessonIndex={2}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Module 1: Getting Started" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Module 2: Core Concepts" }),
    ).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /Welcome/i })).toHaveAttribute(
      "href",
      "/course/demo-course/lesson/welcome",
    );
    expect(screen.getByRole("link", { name: /Setup/i })).toHaveAttribute(
      "href",
      "/course/demo-course/lesson/setup",
    );
    expect(screen.getByRole("link", { name: /Key Ideas/i })).toHaveAttribute(
      "href",
      "/course/demo-course/lesson/key-ideas",
    );
  });

  it("renders a flat lesson list when no modules are provided", () => {
    const flatLessons = [
      {
        id: 1,
        lesson_name: "Only Lesson",
        lesson_slug: "only-lesson",
        estimated_time: 3,
        order: 0,
      },
    ];

    render(
      <LessonSidebarNav
        courseSlug="legacy-course"
        modules={[]}
        sortedLessons={flatLessons}
        activeLessonSlug="only-lesson"
        currentLessonIndex={0}
      />,
    );

    expect(
      screen.queryByRole("heading", { name: "Module 1: Getting Started" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Only Lesson/i })).toHaveAttribute(
      "href",
      "/course/legacy-course/lesson/only-lesson",
    );
  });
});
