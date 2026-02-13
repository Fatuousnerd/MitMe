"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardFooter, CardTitle } from "./ui/card";
import { Mic } from "lucide-react";
import { useMediaStore } from "@/lib/zustand/stores";
import { useMediaSync } from "@/hooks/useMediaSync";
import { PeerUser } from "@/config/Interfaces";

type Props = { user: PeerUser; className?: string };

const VideoCard = ({ user, className }: Props) => {
  useMediaSync();
  const vidRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (vidRef.current && user.stream) {
      vidRef.current.srcObject = user.stream;
      vidRef.current.play();
    }
  }, [user.stream]);
  return (
    <>
      <Card className={`relative flex-1 ${className} p-0 overflow-hidden`}>
        <CardContent className="p-0 overflow-hidden">
          <video
            ref={vidRef}
            autoPlay
            playsInline
            muted
            className="w-full h- object-cover"
          ></video>
        </CardContent>
        <CardFooter className="absolute bottom-2 flex items-center justify-between w-full">
          <CardTitle>Janette Doe</CardTitle>
          <Mic />
        </CardFooter>
      </Card>
    </>
  );
};

export default VideoCard;
