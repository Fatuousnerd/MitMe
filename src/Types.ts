import type { ServerWebSocket } from "bun";
import z from "zod";

export const UserSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  stream: z.nullable(z.custom<MediaStream>()).optional(),
  audio: z.boolean().default(true).optional(),
  video: z.boolean().default(true).optional(),
});
export type User = z.infer<typeof UserSchema>;

export const MediaConstraintsSchema = z.object({
  video: z.boolean().default(true),
  audio: z.boolean().default(true),
  screen: z
    .object({
      video: z.boolean().default(false),
      audio: z.boolean().default(false),
    })
    .optional(),
});
export type MediaConstraints = z.infer<typeof MediaConstraintsSchema>;

export const MitMeConfigSchema = z.object({
  user: UserSchema,
  roomId: z.string(),
  peerId: z.string(),
  constraints: MediaConstraintsSchema,
  signalingUrl: z.string().optional(),
});
export type MitMeConfig = z.infer<typeof MitMeConfigSchema>;

export const RoomConfigSchema = z.object({
  user: UserSchema,
  roomId: z.string(),
  peerId: z.string(),
});
export type RoomConfig = z.infer<typeof RoomConfigSchema>;

export const RoomSchema = z.object({
  roomId: z.string(),
  users: z.array(UserSchema),
});
export type Room = z.infer<typeof RoomSchema>;

export const PeerConfigSchema = z.object({ peerId: z.string() });
export type PeerConfig = z.infer<typeof PeerConfigSchema>;

export type EventCallback = (...args: any[]) => void;

export interface UserConnection {
  ws: ServerWebSocket<WSData>;
  name: string;
}

export interface WSData {
  roomId: string;
  peerId: string;
  name: string;
}