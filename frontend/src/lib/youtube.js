export const YOUTUBE_REGEX =
  /(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([\w-]+)/;

export function getYoutubeVideoId(url) {
  const match = url?.match(YOUTUBE_REGEX);
  return match?.[1] ?? null;
}

export function isYoutubeUrl(url) {
  return YOUTUBE_REGEX.test(url ?? "");
}
