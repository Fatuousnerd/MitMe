"use client";

import { createMediaStream, stopMediaStream } from "@/lib/media/helpers";
import { useMediaStore } from "@/lib/zustand/stores";
import { useEffect } from "react";

export function useMediaSync() {
  const { videoEnabled, audioEnabled, stream, setStream } = useMediaStore();

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    async function updateStream() {
      if (stream) {
        stopMediaStream(stream);
        setStream(null);
      }

      if (!videoEnabled && !audioEnabled) return;

      activeStream = await createMediaStream(videoEnabled, audioEnabled);

      if (activeStream) setStream(activeStream);
    }
    updateStream();

    return () => {
      if (activeStream) stopMediaStream(activeStream);
    };
  }, [videoEnabled, audioEnabled]);
}
