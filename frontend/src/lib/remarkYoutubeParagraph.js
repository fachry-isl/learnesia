import { visit } from "unist-util-visit";
import { isYoutubeUrl } from "@/lib/youtube";

/**
 * Paragraphs that contain YouTube links must not render as <p>, because the
 * embed component uses block-level layout and invalid <div>-in-<p> breaks hydration.
 */
export function remarkYoutubeParagraph() {
  return (tree) => {
    visit(tree, "paragraph", (node) => {
      const hasYoutube = node.children?.some(
        (child) =>
          child.type === "link" && isYoutubeUrl(child.url),
      );
      if (!hasYoutube) return;

      node.data = node.data || {};
      node.data.hName = "div";
      node.data.hProperties = {
        ...(node.data.hProperties || {}),
        className: "mb-4 leading-relaxed",
      };
    });
  };
}
