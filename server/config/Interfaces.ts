import { WSContext } from "hono/ws";

export type User = {
  id: string;
  role: "host" | "participant";
  ws: WSContext<any>;
};
