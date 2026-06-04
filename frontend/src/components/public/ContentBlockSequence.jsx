"use client";

import MarkdownRenderer from "@/components/admin/MarkdownRenderer";
import LessonQuizWidget from "@/components/public/LessonQuizWidget";
import YoutubePlayer from "@/components/public/YoutubePlayer";
import ExerciseBlock from "@/components/public/blocks/ExerciseBlock";

function sortBlocks(blocks) {
  return [...(blocks ?? [])].sort((a, b) => a.order - b.order);
}

function renderBlock(block, { onQuizComplete }) {
  switch (block.block_type) {
    case "text":
      return (
        <MarkdownRenderer content={block.payload?.markdown || ""} />
      );
    case "video":
      return (
        <YoutubePlayer
          url={block.payload?.url}
          title={block.payload?.title}
          start={block.payload?.start}
          end={block.payload?.end}
        />
      );
    case "exercise":
      return (
        <ExerciseBlock
          prompt={block.payload?.prompt}
          sampleSolution={block.payload?.sample_solution}
          hints={block.payload?.hints}
        />
      );
    case "quiz":
      if (!block.quiz?.questions?.length) return null;
      return (
        <LessonQuizWidget
          quiz={block.quiz}
          onComplete={() => onQuizComplete?.(block.id)}
          inline
        />
      );
    default:
      return null;
  }
}

export default function ContentBlockSequence({
  blocks,
  legacyMarkdown,
  onQuizComplete,
}) {
  const sorted = sortBlocks(blocks);

  if (!sorted.length) {
    if (!legacyMarkdown) return null;
    return (
      <section className="prose prose-lg max-w-none">
        <MarkdownRenderer content={legacyMarkdown} />
      </section>
    );
  }

  return (
    <div className="space-y-8">
      {sorted.map((block) => {
        const content = renderBlock(block, { onQuizComplete });
        if (!content) return null;
        return (
          <section
            key={block.id}
            data-block-type={block.block_type}
            className="prose prose-lg max-w-none"
          >
            {content}
          </section>
        );
      })}
    </div>
  );
}

export function lessonHasQuizBlocks(blocks) {
  return sortBlocks(blocks).some(
    (block) =>
      block.block_type === "quiz" && block.quiz?.questions?.length > 0,
  );
}
