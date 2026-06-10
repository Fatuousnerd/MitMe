type EventCallback = (...args: any[]) => void;

/**
 * Handles all signaling logic. Can be summarised as the bridge between users and other related logic.
 */
export class Signaling {
  private ws: WebSocket | null = null;
  private events: Record<string, EventCallback[]> = {};
  private reconnectTimer: any = null;
  private isIntentionallyClosed = false;

  /**
   *
   * @param url The address of the signaling URL. This is what will be the bridge of communication between users in a room.
   */
  constructor(private url: string) {}

  /**
   * Listens for signaling events.
   * @param event String name for the event.
   * @param callback Callback for the said event
   */
  on(event: string, callback: EventCallback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
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
   * Opens a WebSocket, using the `Signaling URL`, and listens for events between peers & rooms.
   * @param roomId ID of the room
   * @param peerId ID of the peer
   * @param name
   */
  connect(roomId: string, peerId: string, name: string) {
    try {
      this.isIntentionallyClosed = false;

      let wsUrl = this.url;
      if (!wsUrl.startsWith("ws://") && !wsUrl.startsWith("wss://")) {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        wsUrl = `${protocol}//${window.location.host}${wsUrl}`;
      }

      const parsedUrl = new URL(wsUrl);
      parsedUrl.searchParams.set("roomId", roomId);
      parsedUrl.searchParams.set("peerId", peerId);
      parsedUrl.searchParams.set("name", name);

      this.ws = new WebSocket(parsedUrl.toString());

      this.ws.onopen = () => {
        this.emit("connected");
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit(data.type, data);
        } catch (err) {
          console.error("Signaling message parse error:", err);
        }
      };

      this.ws.onclose = () => {
        this.emit("disconnected");
        if (!this.isIntentionallyClosed) {
          if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
          this.reconnectTimer = setTimeout(
            () => this.connect(roomId, peerId, name),
            3000,
          );
        }
      };

      this.ws.onerror = (err) => {
        this.emit("error", err);
      };
    } catch (err) {
      this.emit("error", err);
    }
  }

  /**
   * Signals whenever a new user joins the room.
   */
  join() {
    this.send({
      type: "join",
    });
  }

  /**
   * Signals whenever MediaConstraints have changed.
   * @param audio boolean
   * @param video boolean
   */
  toggleMedia(audio: boolean, video: boolean) {
    this.send({
      type: "toggle-media",
      audio,
      video,
    });
  }

  /**
   * Signals whenever a text message is sent.
   * @param text Text Message to be sent `string`
   */
  sendChatMessage(text: string) {
    this.send({
      type: "chat-message",
      text,
    });
  }

  /**
   * Checks if the WebSocket is open & sends passed data through the WebSocket
   * @param data Data to be sent/emited `any`
   */
  private send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN)
      this.ws.send(JSON.stringify(data));
  }

  /**
   * Closes the WebSocket connection, and marks it as intentionally closed.
   */
  disconnect() {
    this.isIntentionallyClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    if (this.ws) {
      this.ws.close();
    }
  }
}
