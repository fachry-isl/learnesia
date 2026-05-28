import { PRIVATE_API_BASE_URL } from "@/utils/env";
import { buildPageMetadata } from "@/utils/seo";

export async function generateMetadata({ params }) {
  const { course_slug, lesson_slug } = await params;
  const lesson = await fetch(`${PRIVATE_API_BASE_URL}/lessons/${lesson_slug}/`, {
    next: { revalidate: 60 },
  }).then((r) => (r.ok ? r.json() : null));

  const path = `/course/${course_slug}/lesson/${lesson_slug}`;

  if (!lesson) {
    return buildPageMetadata({
      title: "Lesson — Learnesia",
      description: "Learn with bite-sized lessons on Learnesia.",
      path,
    });
  }

  return buildPageMetadata({
    title: `${lesson.lesson_name} — Learnesia`,
    description: lesson.lesson_name,
    path,
  });
}

export default function LessonLayout({ children }) {
  return children;
}
