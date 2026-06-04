import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import ContentBlockSequence from "@/components/public/ContentBlockSequence";

vi.mock("@/components/admin/MarkdownRenderer", () => ({
  default: ({ content }) => <div data-testid="markdown">{content}</div>,
}));

vi.mock("@/components/public/YoutubePlayer", () => ({
  default: ({ url, start, end }) => (
    <div
      data-testid="youtube-player"
      data-url={url}
      data-start={start ?? ""}
      data-end={end ?? ""}
    />
  ),
}));

vi.mock("@/components/public/LessonQuizWidget", () => ({
  default: ({ quiz }) => (
    <div data-testid="quiz-widget">{quiz?.quiz_title}</div>
  ),
}));

describe("ContentBlockSequence", () => {
  afterEach(() => cleanup());

  it("renders blocks in order by type", () => {
    const blocks = [
      {
        id: 1,
        order: 0,
        block_type: "text",
        payload: { markdown: "Intro text" },
      },
      {
        id: 2,
        order: 1,
        block_type: "video",
        payload: {
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          title: "Demo",
          start: 10,
          end: 60,
        },
      },
      {
        id: 3,
        order: 2,
        block_type: "exercise",
        payload: {
          prompt: "Write a function",
          sample_solution: "function fn() {}",
          hints: ["Think about inputs"],
        },
      },
      {
        id: 4,
        order: 3,
        block_type: "quiz",
        payload: {},
        quiz: {
          quiz_title: "Check knowledge",
          questions: [
            {
              id: 1,
              question_text: "Q?",
              options: [{ id: 1, option_text: "A", is_correct: true }],
            },
          ],
        },
      },
    ];

    const { container } = render(<ContentBlockSequence blocks={blocks} />);

    const sections = container.querySelectorAll("[data-block-type]");
    expect([...sections].map((el) => el.dataset.blockType)).toEqual([
      "text",
      "video",
      "exercise",
      "quiz",
    ]);

    expect(screen.getByTestId("markdown")).toHaveTextContent("Intro text");
    expect(screen.getByTestId("youtube-player")).toHaveAttribute(
      "data-start",
      "10",
    );
    expect(screen.getByTestId("youtube-player")).toHaveAttribute("data-end", "60");
    expect(screen.getByText("Write a function")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /show solution/i }));
    expect(screen.getByText("function fn() {}")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /show hints/i }));
    expect(screen.getByText("Think about inputs")).toBeInTheDocument();
    expect(screen.getByTestId("quiz-widget")).toHaveTextContent("Check knowledge");
  });

  it("falls back to legacy lesson markdown when no blocks", () => {
    render(
      <ContentBlockSequence blocks={[]} legacyMarkdown="# Legacy body" />,
    );
    expect(screen.getByText("# Legacy body")).toBeInTheDocument();
  });
});
