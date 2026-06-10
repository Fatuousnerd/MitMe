import type { Room, RoomConfig, User } from "../Types";

export const rooms = new Map<string, Room>();

/**
 * Handles all the room-related logic, from, joining, updating, cleanup and all in between.
 */
export class RoomManager {
  currentRoomId: string | null = null;

  /**
   * Joins the user into a room, if it exists, or creates a new one. It is called automatically during SDK initialization.
   * @param config User details, room ID, and peer ID.
   * @returns void
   */
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

  /**
   * Joins a user into a room. This is meant to be called manually, unlike the `join` method.
   * @param roomId ID of the room
   * @param user User details
   */
  addUser(roomId: string, user: User) {
    const room = rooms.get(roomId);
    if (room) {
      if (!room.users.some((u) => u.id === user.id)) {
        room.users.push(user);
      }
    }
  }

  /**
   * Removes a user from the specified room. Can be used when kicking out a user. Different from the `leave` method.
   * @param roomId ID of the room
   * @param userId ID of the user
   */
  removeUser(roomId: string, userId: string) {
    const room = rooms.get(roomId);
    if (room) room.users = room.users.filter((u) => u.id !== userId);
  }

  /**
   * Recieves the user's MediaStream and updates it, keeping the stream fresh for other remote users in the room to view.
   * @param roomId ID of the room
   * @param userId ID of the user
   * @param stream MediaStream of the user
   */
  updateUserStream(roomId: string, userId: string, stream: MediaStream | null) {
    const room = rooms.get(roomId);
    if (room) {
      const user = room.users.find((u) => u.id === userId);
      if (user) {
        user.stream = stream;
      }
    }
  }

  /**
   * Recieves the user's MediaConstraints and updates it.
   * @param roomId ID of the room
   * @param userId ID of the user
   * @param audio boolean
   * @param video boolean
   */
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

  /**
   * Gets the details of the room, specified by the ID passed.
   * @param roomId ID of the room
   * @returns Room Returns an object with the Room ID and an array of current users. Will return `undefined` if the room doesn't exist.
   */
  getRoom(roomId: string): Room | undefined {
    return rooms.get(roomId);
  }

  /**
   * Cleans up a room if all users have left.
   * @param roomId ID of the room
   */
  leave(roomId: string) {
    rooms.delete(roomId);
    if (this.currentRoomId === roomId) {
      this.currentRoomId = null;
    }
  }
}
