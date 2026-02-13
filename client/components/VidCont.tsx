"use client";

import { useMediaStore, useRoomStore } from "@/lib/zustand/stores";
import VideoCard from "./VideoCard";
import { useEffect } from "react";
import { PeerUser, User } from "@/config/Interfaces";
import { toast } from "sonner";
import { useRoomPeers } from "@/hooks/useRoomPeers";

const VidCont = ({ roomId }: { roomId: string }) => {
  const { selfId, setSelfId, users, addUser, removeUser, setUserStream } =
    useRoomStore();

  const localStream = useMediaStore((s) => s.stream);
  useEffect(() => {
    if (!selfId || !localStream) return;
    setUserStream(selfId, localStream);
  }, [selfId, localStream]);
  useRoomPeers(roomId, localStream!);

  const orderedUsers = [
    ...users.filter((u) => u.id === selfId),
    ...users.filter((u) => u.id !== selfId),
  ];
  const mainSpeaker = orderedUsers[0] ?? null;
  const others = orderedUsers.slice(1, 4);

  return (
    <>
      <div className="flex flex-col items-stretch gap-3 h-full flex-1 p-5">
        {mainSpeaker ? (
          <VideoCard key={mainSpeaker.id} user={mainSpeaker} />
        ) : (
          <div className="flex-1 bg-muted rounded-xl flex items-center justify-center">
            Waiting for participants...
          </div>
        )}
        <div className="grid grid-cols-3 gap-2 flex-1">
          {others.map((user) => (
            <VideoCard key={user.id} user={user} />
          ))}
        </div>
      </div>
    </>
  );
};

export default VidCont;
