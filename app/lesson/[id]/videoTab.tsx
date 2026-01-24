"use client";

import type { Lesson } from "../../../content/types";
import { cn, theme } from "../../lib/theme";

export default function VideoTab({ lesson }: { lesson: Lesson }) {
  const url = lesson.videoUrl;

  if (!url) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Video</h2>
        <p className={cn("leading-relaxed", theme.page.text)}>
          No video has been added for this lesson yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Video</h2>
      <div className="mx-auto w-full md:w-[85%] lg:w-[80%]">
      <video
          className="
                w-full
                max-h-[360px]
                rounded-2xl
                border
                bg-black
            "
        controls
        playsInline
        preload="metadata"
        poster={lesson.videoPosterUrl}
      >
        
        <source src={url} type="video/mp4" />
        Your browser can’t play this video.{" "}
        <a className="underline" href={url} target="_blank" rel="noreferrer">
          Open video
        </a>
        .
      </video>
      </div>

      <p className={theme.input.helper}>
        Watch the walkthrough, then use Syntax and Examples as reference.
      </p>
    </div>
  );
}
