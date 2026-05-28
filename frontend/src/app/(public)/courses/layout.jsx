import { buildPageMetadata } from "@/utils/seo";

export const metadata = buildPageMetadata({
  title: "Courses — Learnesia: Microlearning with AI",
  description:
    "Browse bite-sized microlearning courses curated with AI. Leadership, productivity, design thinking, and more.",
  path: "/courses",
});

export default function CoursesLayout({ children }) {
  return children;
}
