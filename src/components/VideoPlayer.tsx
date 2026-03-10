import React, { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

interface VideoPlayerProps {
  src: string;
  onReady?: (player: any) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, onReady }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!playerRef.current && videoRef.current) {
      const player = videojs(videoRef.current, {
           autoplay: true,
           controls: true,
           fluid: true,
           html5: {
           vhs: {
           overrideNative: true
    }
  },
  sources: [{
    src: "http://tvn1.chowdhury-shaheb.com/gazitv/index.m3u8",
    type: "application/x-mpegURL"
  }]
});

      playerRef.current = player;

      if (onReady) {
        player.ready(() => {
          onReady(player);
        });
      }
    } else if (playerRef.current) {
      playerRef.current.src({
        src,
        type: src.includes(".m3u8")
          ? "application/x-mpegURL"
          : "video/mp4",
      });
    }
  }, [src]);

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl">
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered w-full h-full"
      />
    </div>
  );
};
