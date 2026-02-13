"use client";

import { Button } from "./ui/button";
import {
  Mic,
  MicOff,
  OctagonX,
  ScreenShare,
  Trash,
  User2,
  Video,
  VideoOff,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { useMediaStore, useRoomStore } from "@/lib/zustand/stores";

const BottomBar = () => {
  const { videoEnabled, audioEnabled, setVideo, setAudio } = useMediaStore();
  const numUsers = useRoomStore((s) => s.users).length;
  return (
    <>
      <div className="w-full h-15 p-5 flex items-center justify-between bg-card border-t border-border">
        <Button variant={"outline"} onClick={() => setAudio(!audioEnabled)}>
          {audioEnabled ? <Mic /> : <MicOff />}
        </Button>
        <Button variant={"outline"} onClick={() => setVideo(!videoEnabled)}>
          {videoEnabled ? <Video /> : <VideoOff />}
        </Button>
        <Button variant={"outline"}>
          <User2 /> <Badge>{numUsers ?? "--"}</Badge>
        </Button>
        <Button variant={"outline"}>
          <ScreenShare />
        </Button>
        <Button variant={"destructive"}>
          <OctagonX /> Leave Meeting
        </Button>
      </div>
    </>
  );
};

export default BottomBar;
