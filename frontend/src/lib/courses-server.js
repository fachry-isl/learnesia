import { PRIVATE_API_BASE_URL, PUBLIC_API_BASE_URL } from "@/utils/env";
import { SITE_URL } from "@/utils/seo";

function resolveApiBaseUrl() {
  const base = process.env.API_URL || PRIVATE_API_BASE_URL || PUBLIC_API_BASE_URL;

  if (base.startsWith("http://") || base.startsWith("https://")) {
    return base.replace(/\/$/, "");
  }

  const site = SITE_URL.replace(/\/$/, "");
  const path = base.startsWith("/") ? base : `/${base}`;
  return `${site}${path}`.replace(/\/$/, "");
}

export async function fetchPublishedCourses() {
  const response = await fetch(`${resolveApiBaseUrl()}/courses/`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) return [];

  const courses = await response.json();
  return courses.filter((course) => course.status === "published");
}

export async function fetchCourseBySlug(slug) {
  const response = await fetch(`${resolveApiBaseUrl()}/courses/${slug}/`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) return null;
  return response.json();
}
