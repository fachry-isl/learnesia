import { describe, expect, it } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { remarkYoutubeParagraph } from "./remarkYoutubeParagraph";

function parseMarkdown(markdown) {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkYoutubeParagraph);
  return processor.runSync(processor.parse(markdown));
}

describe("remarkYoutubeParagraph", () => {
  it("converts paragraphs with YouTube links to div via hName", () => {
    const tree = parseMarkdown(
      "[video](https://www.youtube.com/watch?v=dQw4w9WgXcQ)",
    );
    const paragraph = tree.children.find((node) => node.type === "paragraph");
    expect(paragraph?.data?.hName).toBe("div");
    expect(paragraph?.data?.hProperties?.className).toBe(
      "mb-4 leading-relaxed",
    );
  });

  it("leaves normal paragraphs unchanged", () => {
    const tree = parseMarkdown("Hello world.");
    const paragraph = tree.children.find((node) => node.type === "paragraph");
    expect(paragraph?.data?.hName).toBeUndefined();
  });
});
