import { getYoutubeVideoId, isYoutubeUrl } from "@/lib/youtube";

export default function YoutubeEmbed({ url }) {
  const videoId = getYoutubeVideoId(url);
  if (!videoId) return null;

  return (
    <span className="flex justify-center w-full my-6 not-prose block">
      <span className="relative block w-full max-w-3xl aspect-video">
        <iframe
          className="absolute top-0 left-0 w-full h-full rounded-lg border-none"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </span>
    </span>
  );
}

YoutubeEmbed.isYoutubeUrl = isYoutubeUrl;
