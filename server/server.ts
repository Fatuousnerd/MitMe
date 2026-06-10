import { serve } from "bun";
import type { UserConnection, WSData } from "./Types";

/**
 * A `Map` that keeps records of all the currently available rooms and their details.
 */
const rooms = new Map<string, Map<string, UserConnection>>();

/**
 * Starts up & manages the `Signaling Server` using `Bun's Server`.
 */
const server = serve<WSData>({
  port: Number(process.env.PORT) || 4005,
  fetch(req, server) {
    const url = new URL(req.url);
    const roomId = url.searchParams.get("roomId");
    const peerId = url.searchParams.get("peerId");
    const name = url.searchParams.get("name") || "Anonymous";

    if (roomId && peerId) {
      if (
        server.upgrade(req, {
          data: { roomId, peerId, name },
        })
      ) {
        return;
      }
    }
    return new Response("Invalid upgrade request", { status: 400 });
  },
  websocket: {
    open() {
      console.log("🟢 Signaling client connected");
    },

    message(ws, message) {
      try {
        const data = JSON.parse(message as string);
        switch (data.type) {
          case "join": {
            const { roomId, peerId, name } = ws.data;

            let room = rooms.get(roomId);
            if (!room) {
              room = new Map();
              rooms.set(roomId, room);
            }

            // 1. Send details of existing peers to the joiner
            const peers = Array.from(room.entries()).map(([pId, info]) => ({
              peerId: pId,
              name: info.name,
            }));
            ws.send(JSON.stringify({ type: "room-details", peers }));

            // 2. Add joiner to the room map
            room.set(peerId, { ws, name });

            // 3. Broadcast joiner to all other peers in the room
            for (const [pId, info] of room.entries()) {
              if (pId !== peerId) {
                info.ws.send(
                  JSON.stringify({
                    type: "peer-joined",
                    peerId,
                    name,
                  }),
                );
              }
            }

            console.log(
              `👤 Peer "${name}" (${peerId}) joined room "${roomId}"`,
            );
            break;
          }

          case "toggle-media": {
            if (!ws.data) return;
            const { roomId, peerId } = ws.data;
            const room = rooms.get(roomId);
            if (room) {
              for (const [pId, info] of room.entries()) {
                if (pId !== peerId) {
                  info.ws.send(
                    JSON.stringify({
                      type: "toggle-media",
                      peerId,
                      audio: data.audio,
                      video: data.video,
                    }),
                  );
                }
              }
            }
            break;
          }

          case "chat-message": {
            if (!ws.data) return;
            const { roomId, peerId, name } = ws.data;
            const room = rooms.get(roomId);
            if (room) {
              for (const [pId, info] of room.entries()) {
                if (pId !== peerId) {
                  info.ws.send(
                    JSON.stringify({
                      type: "chat-message",
                      peerId,
                      sender: name,
                      text: data.text,
                    }),
                  );
                }
              }
            }
            break;
          }
        }
      } catch (err) {
        console.error("❌ Signaling server message error:", err);
      }
    },
    close(ws) {
      if (ws.data) {
        const { roomId, peerId, name } = ws.data;
        const room = rooms.get(roomId);
        if (room) {
          room.delete(peerId);
          console.log(`👤 Peer "${name}" (${peerId}) left room "${roomId}"`);

          if (room.size === 0) {
            rooms.delete(roomId);
            console.log(`🏚️ Room "${roomId}" is now empty and cleaned up`);
          } else {
            // Notify others
            for (const info of room.values()) {
              info.ws.send(
                JSON.stringify({
                  type: "peer-left",
                  peerId,
                }),
              );
            }
          }
        }
      }
    },
  },
});

console.log(
  `🚀 MitMe Signaling Server running at ws://localhost:${server.port}`,
);
export default server;
