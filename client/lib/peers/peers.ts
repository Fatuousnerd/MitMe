import { useRoomStore } from "../zustand/stores";

export const createPeerConnection = (
  peerId: string,
  ws: WebSocket,
  localStream: MediaStream,
) => {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

  pc.ontrack = (event) => {
    const [stream] = event.streams;
    useRoomStore.getState().setUserStream(peerId, stream);
  };

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      ws.send(
        JSON.stringify({
          type: "ice-candidate",
          target: peerId,
          payload: event.candidate,
        }),
      );
    }
  };

  return pc;
};
