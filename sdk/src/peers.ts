import Peer, { type MediaConnection } from "peerjs";
import type { PeerConfig } from "../Types";

type EventCallback = (...args: any[]) => void;

export class Peers {
  peer: Peer;
  private calls = new Map<string, MediaConnection>();
  private events: Record<string, EventCallback[]> = {};

  constructor(config: PeerConfig) {
    this.peer = new Peer(config.peerId, {
      debug: 1,
    });

    this.peer.on("call", (call) => {
      this.calls.set(call.peer, call);
      this.emit("call-received", call);

      call.on("close", () => {
        this.calls.delete(call.peer);
      });

      call.on("error", (err) => {
        console.error(`Call error with peer ${call.peer}:`, err);
      });
    });

    this.peer.on("open", (id) => {
      console.log(
        `[Peers] PeerJS connection opened successfully with ID: ${id}`,
      );
      this.emit("open", id);
    });

    this.peer.on("error", (err) => {
      console.error("[Peers] PeerJS error:", err);
      this.emit("error", err);
    });
  }

  on(event: string, callback: EventCallback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  emit(event: string, ...args: any[]) {
    if (!this.events[event]) return;
    for (const cb of this.events[event]) {
      cb(...args);
    }
  }

  call(peerId: string, stream: MediaStream): MediaConnection {
    this.closeConnection(peerId);

    const call = this.peer.call(peerId, stream);
    this.calls.set(peerId, call);

    call.on("close", () => {
      this.calls.delete(peerId);
    });

    call.on("error", (err) => {
      console.error(`Call error with peer ${peerId}:`, err);
    });

    return call;
  }

  closeConnection(peerId: string) {
    const call = this.calls.get(peerId);
    if (call) {
      call.close();
      this.calls.delete(peerId);
    }
  }

  destroy() {
    for (const call of this.calls.values()) {
      call.close();
    }
    this.calls.clear();
    this.peer.destroy();
  }
}
