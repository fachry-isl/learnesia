export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://learnesia.co.id";

const SITE_NAME = "Learnesia";
const DEFAULT_OG_IMAGE = "/li_logo_full.png";

export function absoluteUrl(path = "") {
  const base = SITE_URL.replace(/\/$/, "");
  if (!path) return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function courseOverviewPath(slug) {
  return `/course/${slug}/overview`;
}

function resolveOgImage(image) {
  if (!image) return absoluteUrl(DEFAULT_OG_IMAGE);
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return absoluteUrl(image);
}

/**
 * @param {{ title: string; description: string; path?: string; image?: string; type?: string }} options
 */
export function buildPageMetadata({
  title,
  description,
  path = "/",
  image = undefined,
  type = "website",
}) {
  const url = absoluteUrl(path);
  const ogImage = resolveOgImage(image);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en",
      type,
      images: [{ url: ogImage, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export function buildCourseJsonLd(course) {
  const url = absoluteUrl(courseOverviewPath(course.course_slug));
  const image = course.course_thumbnail
    ? resolveOgImage(course.course_thumbnail)
    : absoluteUrl(DEFAULT_OG_IMAGE);

  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.course_name,
    description: course.course_description,
    url,
    image,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    numberOfLessons:
      course.modules?.reduce((n, m) => n + (m.lessons?.length ?? 0), 0) ??
      course.lessons?.length ??
      undefined,
    educationalLevel: "Beginner",
    inLanguage: "en",
    isAccessibleForFree: true,
  };
}
