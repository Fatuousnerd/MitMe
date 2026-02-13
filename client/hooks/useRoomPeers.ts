import { PeerUser } from "@/config/Interfaces";
import { createPeerConnection } from "@/lib/peers/peers";
import { useRoomStore } from "@/lib/zustand/stores";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export const useRoomPeers = (roomId: string, localStream: MediaStream) => {
  if (!roomId) return;

  const selfId = useRoomStore((s) => s.selfId);
  const setSelfId = useRoomStore((s) => s.setSelfId);
  const addUser = useRoomStore((s) => s.addUser);
  const removeUser = useRoomStore((s) => s.removeUser);
  const setUserStream = useRoomStore((s) => s.setUserStream);

  const peersRef = useRef<Record<string, RTCPeerConnection>>({});
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!roomId) return;
    const ws = new WebSocket(`ws://localhost:3535/ws/${roomId}`);
    wsRef.current = ws;

    ws.onopen = () => console.log("WebSocket connected");
    ws.onclose = () => console.log("WebSocket disconnected");

    ws.onmessage = async (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      const {
        type,
        userId: incomingId,
        id: peerId,
        role,
        payload,
        target,
        from,
      } = data;

      switch (type) {
        case "joined":
          setSelfId(incomingId);
          //   (data.users as PeerUser[])
          //     .filter((u) => u.id !== incomingId)
          //     .forEach((u) => addUser(u));
          addUser({ id: incomingId, role });
          if (localStream) setUserStream(incomingId, localStream);
          console.log("localStream at join: ", localStream);
          toast.success("Meeting has started");
          break;

        case "user-joined":
          addUser({ id: peerId, role });
          toast.success("A new user has joined");
          if (localStream) {
            const pc = createPeerConnection(peerId, ws, localStream);
            peersRef.current[peerId] = pc;

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            ws.send(
              JSON.stringify({ type: "offer", target: peerId, payload: offer }),
            );
          }
          break;

        case "offer":
          if (target === selfId && localStream) {
            const pc = createPeerConnection(from, ws, localStream);
            peersRef.current[from] = pc;
            await pc.setRemoteDescription(payload);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            ws.send(
              JSON.stringify({ type: "answer", target: from, payload: answer }),
            );
          }
          break;

        case "answer":
          if (target === selfId) {
            const pc = peersRef.current[from];
            if (pc) await pc.setRemoteDescription(payload);
          }
          break;

        case "ice-candidate":
          if (target === selfId) {
            const pc = peersRef.current[from];
            if (pc) await pc.addIceCandidate(payload);
          }
          break;

        case "user-left":
          removeUser(peerId);
          const pc = peersRef.current[peerId];
          if (pc) pc.close();
          delete peersRef.current[peerId];
          toast.info("Someone left the meeting");
      }
    };

    return () => {
      ws.close();
      Object.values(peersRef.current).forEach((pc) => pc.close());
      peersRef.current = {};
    };
  }, [roomId]);

  return { ws: wsRef.current, peers: peersRef.current };
};
