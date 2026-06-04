import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import YoutubePlayer from "@/components/public/YoutubePlayer";

describe("YoutubePlayer", () => {
  let playerInstances;
  let PlayerMock;

  beforeEach(() => {
    playerInstances = [];
    PlayerMock = vi.fn(function MockPlayer(_el, config) {
      this.config = config;
      this.destroy = vi.fn();
      playerInstances.push(this);
      config.events?.onReady?.({ target: this });
    });
    PlayerMock.ready = false;

    window.YT = { Player: PlayerMock };
    document.querySelector('script[src*="youtube.com/iframe_api"]')?.remove();
  });

  afterEach(() => {
    delete window.YT;
    vi.restoreAllMocks();
  });

  it("creates a player with start time in playerVars", async () => {
    render(
      <YoutubePlayer
        url="https://www.youtube.com/watch?v=abc123xyz12"
        start={30}
        end={90}
      />,
    );

    window.onYouTubeIframeAPIReady?.();

    await waitFor(() => {
      expect(PlayerMock).toHaveBeenCalled();
    });

    const config = PlayerMock.mock.calls[0][1];
    expect(config.videoId).toBe("abc123xyz12");
    expect(config.playerVars.start).toBe(30);
  });

  it("omits start from playerVars when not provided", async () => {
    render(
      <YoutubePlayer url="https://www.youtube.com/watch?v=abc123xyz12" />,
    );

    window.onYouTubeIframeAPIReady?.();

    await waitFor(() => {
      expect(PlayerMock).toHaveBeenCalled();
    });

    const config = PlayerMock.mock.calls[0][1];
    expect(config.playerVars.start).toBeUndefined();
  });
});
