const YOUTUBE_REGEX =
  /(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([\w-]+)/;

function getVideoId(url) {
  const match = url?.match(YOUTUBE_REGEX);
  return match?.[1] ?? null;
}

export default function YoutubeEmbed({ url }) {
  const videoId = getVideoId(url);
  if (!videoId) return null;

  return (
    <div className="flex justify-center w-full my-6">
      <div className="relative w-full max-w-3xl aspect-video">
        <iframe
          className="absolute top-0 left-0 w-full h-full rounded-lg border-none"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}

YoutubeEmbed.isYoutubeUrl = (url) => YOUTUBE_REGEX.test(url ?? "");
