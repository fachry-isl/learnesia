import { fetchCourseBySlug } from "@/lib/courses-server";
import {
  buildCourseJsonLd,
  buildPageMetadata,
  courseOverviewPath,
} from "@/utils/seo";

export async function generateMetadata({ params }) {
  const { course_slug } = await params;
  const course = await fetchCourseBySlug(course_slug);

  if (!course) {
    return buildPageMetadata({
      title: "Course — Learnesia",
      description: "Explore microlearning courses on Learnesia.",
      path: courseOverviewPath(course_slug),
    });
  }

  return buildPageMetadata({
    title: `${course.course_name} — Learnesia`,
    description: course.course_description,
    path: courseOverviewPath(course_slug),
    image: course.course_thumbnail,
    type: "website",
  });
}

export default async function CourseLayout({ children, params }) {
  const { course_slug } = await params;
  const course = await fetchCourseBySlug(course_slug);

  return (
    <>
      {course ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildCourseJsonLd(course)),
          }}
        />
      ) : null}
      {children}
    </>
  );
}
