import type { Room, RoomConfig, User } from "../Types";

export const rooms = new Map<string, Room>();

export class RoomManager {
  currentRoomId: string | null = null;

  async join(config: RoomConfig) {
    this.currentRoomId = config.roomId;
    let room = rooms.get(config.roomId);
    if (!room) {
      rooms.set(config.roomId, { roomId: config.roomId, users: [config.user] });
      return;
    }

    if (!room.users.some((user) => user.id === config.user.id)) {
      room.users.push(config.user);
    }
  }

  addUser(roomId: string, user: User) {
    const room = rooms.get(roomId);
    if (room) {
      if (!room.users.some((u) => u.id === user.id)) {
        room.users.push(user);
      }
    }
  }

  removeUser(roomId: string, userId: string) {
    const room = rooms.get(roomId);
    if (room) {
      room.users = room.users.filter((u) => u.id !== userId);
    }
  }

  updateUserStream(roomId: string, userId: string, stream: MediaStream | null) {
    const room = rooms.get(roomId);
    if (room) {
      const user = room.users.find((u) => u.id === userId);
      if (user) {
        user.stream = stream;
      }
    }
  }

  updateUserMedia(
    roomId: string,
    userId: string,
    audio: boolean,
    video: boolean,
  ) {
    const room = rooms.get(roomId);
    if (room) {
      const user = room.users.find((u) => u.id === userId);
      if (user) {
        user.audio = audio;
        user.video = video;
      }
    }
  }

  getRoom(roomId: string): Room | undefined {
    return rooms.get(roomId);
  }

  leave(roomId: string) {
    rooms.delete(roomId);
    if (this.currentRoomId === roomId) {
      this.currentRoomId = null;
    }
  }
}
