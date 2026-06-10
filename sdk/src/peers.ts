import Peer, { type MediaConnection } from "peerjs";
import type { PeerConfig } from "../Types";

type EventCallback = (...args: any[]) => void;

/**
 * Automatically handles all the peer & WebRTC logic. This is the back-bone of the SDK.
 */
export class Peers {
  peer: Peer;
  private calls = new Map<string, MediaConnection>();
  private events: Record<string, EventCallback[]> = {};

  /**
   * Initializes a new Peer, with the specified Peer ID, and listens for peer-related events.
   * @param config Peer ID to be used.
   */
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

  /**
   * Listens for peer events.
   * @param event String name for the event.
   * @param callback Callback for the said event
   */
  on(event: string, callback: EventCallback) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  }

  /**
   * 
   * @param event 
   * @param args 
   * @returns 
   */
  emit(event: string, ...args: any[]) {
    if (!this.events[event]) return;
    for (const cb of this.events[event]) {
      cb(...args);
    }
  }

  /**
   * Gracefully calls the remote peer specified by the `id` and returns a `MediaConnection`.
   * @param peerId ID of the peer
   * @param stream MediaStream used in the call
   * @returns MediaConnection
   */
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

  /**
   * Closes the peer connection and cleans up. Different from the `destroy` method, as this only closes the specified peer.
   * @param peerId ID of the peer
   */
  closeConnection(peerId: string) {
    const call = this.calls.get(peerId);
    if (call) {
      call.close();
      this.calls.delete(peerId);
    }
  }

  /**
   * Destroys & cleans up all peer connections gracefully.
   */
  destroy() {
    for (const call of this.calls.values()) {
      call.close();
    }
    this.calls.clear();
    this.peer.destroy();
  }
}
