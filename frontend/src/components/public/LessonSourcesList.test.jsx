import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LessonSourcesList from "@/components/public/LessonSourcesList";

describe("LessonSourcesList", () => {
  it("renders citations and supplementary references under separate headings", () => {
    render(
      <LessonSourcesList
        citations={[
          {
            id: 1,
            order: 0,
            reference: {
              title: "Primary Paper",
              url: "https://example.com/paper",
            },
          },
        ]}
        supplementary={[
          {
            id: 2,
            order: 0,
            reference: {
              title: "Extra Reading",
              url: "https://example.com/extra",
            },
          },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Sources" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Further Reading" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Primary Paper" })).toHaveAttribute(
      "href",
      "https://example.com/paper",
    );
    expect(screen.getByRole("link", { name: "Extra Reading" })).toHaveAttribute(
      "href",
      "https://example.com/extra",
    );
  });

  it("renders nothing when both lists are empty", () => {
    const { container } = render(
      <LessonSourcesList citations={[]} supplementary={[]} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
