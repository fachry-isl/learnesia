import { fetchPublishedCourses } from "@/lib/courses-server";
import { absoluteUrl, courseOverviewPath } from "@/utils/seo";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const courses = await fetchPublishedCourses();
  const now = new Date();

  const staticRoutes = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: absoluteUrl("/courses"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const courseRoutes = courses.map((course) => ({
    url: absoluteUrl(courseOverviewPath(course.course_slug)),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...courseRoutes];
}
