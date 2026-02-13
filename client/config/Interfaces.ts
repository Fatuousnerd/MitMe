export interface ThemeType {
  theme: string;
  toggleTheme: () => void;
}

export interface FormatStore {
  format: string;
  setFormat: (f: string) => void;
}

export interface MediaState {
  videoEnabled: boolean;
  audioEnabled: boolean;
  stream: MediaStream | null;
  setVideo: (enabled: boolean) => void;
  setAudio: (enabled: boolean) => void;
  setStream: (stream: MediaStream | null) => void;
}

export type User = {
  id: string;
  role: "host" | "participant";
  socket: WebSocket;
};

export type PeerUser = {
  id: string;
  stream?: MediaStream;
  role: "host" | "participant";
};

export interface RoomState {
  selfId: string | null;
  users: PeerUser[];
  setSelfId: (id: string) => void;
  addUser: (user: PeerUser) => void;
  removeUser: (id: string) => void;
  setUserStream: (id: string, stream: MediaStream) => void;
  clearRoom: () => void;
}
