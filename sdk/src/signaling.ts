type EventCallback = (...args: any[]) => void;

export class Signaling {
  private ws: WebSocket | null = null;
  private events: Record<string, EventCallback[]> = {};
  private reconnectTimer: any = null;
  private isIntentionallyClosed = false;

  constructor(private url: string) {}

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
          this.reconnectTimer = setTimeout(() => this.connect(roomId, peerId, name), 3000);
        }
      };

      this.ws.onerror = (err) => {
        this.emit("error", err);
      };
    } catch (err) {
      this.emit("error", err);
    }
  }

  join() {
    this.send({
      type: "join",
    });
  }

  toggleMedia(audio: boolean, video: boolean) {
    this.send({
      type: "toggle-media",
      audio,
      video,
    });
  }

  sendChatMessage(text: string) {
    this.send({
      type: "chat-message",
      text,
    });
  }

  private send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

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