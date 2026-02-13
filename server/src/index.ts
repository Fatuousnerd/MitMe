import { Hono } from "hono";
import { User } from "../config/Interfaces";
import { upgradeWebSocket, websocket } from "hono/bun";

const app = new Hono();

const rooms: Record<string, User[]> = {};

app.get(
  `/ws/:roomId`,
  upgradeWebSocket((c) => {
    const roomId = c.req.param("roomId");
    const userId = crypto.randomUUID();

    return {
      onOpen(_, ws) {
        if (!rooms[roomId]) rooms[roomId] = [];

        const role = rooms[roomId].length === 0 ? "host" : "participant";

        const user: User = { id: userId, role, ws };
        rooms[roomId].push(user);

        ws.send(
          JSON.stringify({
            type: "joined",
            userId,
            role,
            users: rooms[roomId].map((u) => ({ id: u.id, role: u.role })),
          }),
        );

        rooms[roomId].forEach((u) => {
          if (u.id !== userId) {
            u.ws.send(
              JSON.stringify({ type: "user-joined", id: userId, role }),
            );
          }
        });
      },

      onMessage(event, ws) {
        const message = JSON.parse(event.data as string);
        const roomUsers = rooms[roomId];
        if (!roomUsers) return;

        const sender = roomUsers.find((u) => u.ws === ws);
        if (!sender) return;

        if (message.target) {
          const targetUser = roomUsers.find((u) => u.id === message.target);

          if (targetUser) {
            targetUser.ws.send(JSON.stringify({ ...message, from: sender.id }));
          }
        }
      },

      onClose(_, ws) {
        const roomUsers = rooms[roomId];
        if (!roomUsers) return;

        const leavingUser = roomUsers.find((u) => u.ws === ws);
        if (!leavingUser) return;

        rooms[roomId] = rooms[roomId]?.filter((u) => u.ws !== ws);

        rooms[roomId].forEach((u) => {
          u.ws.send(JSON.stringify({ type: "user-left", id: leavingUser.id }));
        });

        if (rooms[roomId]?.length === 0) delete rooms[roomId];
      },
    };
  }),
);

export default { port: process.env.PORT || 3535, fetch: app.fetch, websocket };
