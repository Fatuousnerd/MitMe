import { MediaState, RoomState } from "@/config/Interfaces";
import { create } from "zustand";

export const useMediaStore = create<MediaState>((set) => ({
  videoEnabled: false,
  audioEnabled: false,
  stream: null,
  setVideo: (videoEnabled) => set({ videoEnabled }),
  setAudio: (audioEnabled) => set({ audioEnabled }),
  setStream: (stream) => set({ stream }),
}));

export const useRoomStore = create<RoomState>((set, get) => ({
  selfId: null,
  users: [],
  setSelfId: (id) => set({ selfId: id }),
  addUser: (user) =>
    set((state) => {
      const exists = state.users.some((u) => u.id === user.id);
      if (exists) return state;

      return { users: [...state.users, user] };
    }),
  removeUser: (id) =>
    set((state) => ({ users: state.users.filter((u) => u.id !== id) })),
  setUserStream: (id, stream) =>
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, stream } : u)),
    })),
  clearRoom: () => set({ selfId: null, users: [] }),
}));
