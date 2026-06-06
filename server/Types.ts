import type { ServerWebSocket } from "bun";
export interface UserConnection {
  ws: ServerWebSocket<WSData>;
  name: string;
}

export interface WSData {
  roomId: string;
  peerId: string;
  name: string;
}
