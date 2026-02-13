import { createPeerConnection } from "@/lib/peers/peers";
import { useRoomStore } from "@/lib/zustand/stores";
import { useEffect, useRef } from "react";

export const usePeers = (ws: WebSocket, localStream: MediaStream) => {
  const { selfId, addUser, setUserStream, users } = useRoomStore();
  const peersRef = useRef<Record<string, RTCPeerConnection>>({});

  useEffect(() => {
    if (!ws || !localStream) return;

    ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);

      const { type, from, target, payload } = message;

      if (type === "user-joined" && selfId) {
        const pc = createPeerConnection(from, ws, localStream);
        peersRef.current[from] = pc;

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        ws.send(
          JSON.stringify({ type: "offer", target: from, payload: offer }),
        );
      }

      if (type == "offer" && target === selfId) {
        const pc = createPeerConnection(from, ws, localStream);
        peersRef.current[from] = pc;

        await pc.setLocalDescription(payload);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        ws.send(
          JSON.stringify({ type: "answer", target: from, payload: answer }),
        );
      }

      if (type === "answer" && target === selfId) {
        const pc = peersRef.current[from];
        if (pc) await pc.setRemoteDescription(payload);
      }

      if (type === "user-left") {
        const pc = peersRef.current[from];
        if (pc) pc.close();
        delete peersRef.current[from];
      }
    };
  }, [ws, localStream, selfId]);
};
