"use client";

import { useEffect, useId, useRef } from "react";
import { getYoutubeVideoId } from "@/lib/youtube";

const IFRAME_API_SRC = "https://www.youtube.com/iframe_api";

function loadYoutubeIframeApi() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();

  return new Promise((resolve) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      resolve();
    };

    if (document.querySelector(`script[src="${IFRAME_API_SRC}"]`)) {
      if (window.YT?.Player) resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = IFRAME_API_SRC;
    script.async = true;
    document.body.appendChild(script);
  });
}

export default function YoutubePlayer({ url, title, start, end }) {
  const containerId = useId().replace(/:/g, "");
  const playerRef = useRef(null);
  const endIntervalRef = useRef(null);
  const videoId = getYoutubeVideoId(url);

  useEffect(() => {
    if (!videoId) return undefined;

    let cancelled = false;

    loadYoutubeIframeApi().then(() => {
      if (cancelled || !window.YT?.Player) return;

      const playerVars = {};
      if (start != null) playerVars.start = start;

      playerRef.current = new window.YT.Player(containerId, {
        videoId,
        playerVars,
        events: {
          onReady: (event) => {
            if (end == null) return;
            endIntervalRef.current = window.setInterval(() => {
              const current = event.target.getCurrentTime?.();
              if (typeof current === "number" && current >= end) {
                event.target.pauseVideo?.();
                window.clearInterval(endIntervalRef.current);
                endIntervalRef.current = null;
              }
            }, 500);
          },
        },
      });
    });

    return () => {
      cancelled = true;
      if (endIntervalRef.current) {
        window.clearInterval(endIntervalRef.current);
        endIntervalRef.current = null;
      }
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  }, [videoId, containerId, start, end]);

  if (!videoId) return null;

  return (
    <figure className="my-8 not-prose">
      {title ? (
        <figcaption className="text-sm font-bold text-gray-600 mb-3">{title}</figcaption>
      ) : null}
      <div className="relative w-full max-w-3xl mx-auto aspect-video rounded-lg overflow-hidden bg-black">
        <div id={containerId} className="absolute inset-0 w-full h-full" />
      </div>
    </figure>
  );
}
