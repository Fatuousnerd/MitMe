import { Media } from "./media";
import { RoomManager } from "./rooms";
import { Peers } from "./peers";
import { Signaling } from "./signaling";
import type { EventCallback, MitMeConfig, RoomConfig, User } from "../Types";

/**
 * Entry point for the MitMe SDK. Initializes and exposes all other methods.
 */
export class MitMe {
  localStream: Promise<MediaStream>;
  media = new Media();
  rooms = new RoomManager();
  peers: Peers | null = null;
  signaling: Signaling | null = null;

  private events: Record<string, EventCallback[]> = {};
  private resolvedLocalStream: MediaStream | null = null;

  /**
   * Initializes the SDK, gets the local stream, handles room & peer logic, and connects to the signaling server.
   * @param config User details, Room ID, Peer ID, media constraints, signaling URL
   */
  constructor(private config: MitMeConfig) {
    this.localStream = this.media.getLocalStream(config.constraints);

    this.localStream
      .then((stream) => {
        this.resolvedLocalStream = stream;
        this.emit("local-stream", stream);

        this.init({
          user: config.user,
          roomId: config.roomId,
          peerId: config.peerId,
        });
      })
      .catch((err) => {
        this.emit("error", err);
      });
  }

  on(event: string, callback: EventCallback) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  }

  off(event: string, callback: EventCallback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter((cb) => cb !== callback);
  }

  emit(event: string, ...args: any[]) {
    if (!this.events[event]) return;
    for (const cb of this.events[event]) {
      cb(...args);
    }
  }

  /**
   * Handles all the initial logic, from joining/creating rooms, managing peer connections, then listens for events.
   * @param payload User details, Room ID, Peer ID
   */
  async init(payload: RoomConfig) {
    await this.rooms.join(payload);
    this.peers = new Peers({ peerId: payload.peerId });

    this.peers.on("call-received", (call: any) => {
      console.log(
        `[MitMe Client] Incoming call received from peer: ${call.peer}`,
      );
      if (this.resolvedLocalStream) {
        console.log(
          `[MitMe Client] Answering call from ${call.peer} with local stream`,
        );
        call.answer(this.resolvedLocalStream);

        call.on("stream", (remoteStream: MediaStream) => {
          console.log(
            `[MitMe Client] Stream event fired on answered call from peer: ${call.peer}`,
          );
          this.rooms.updateUserStream(payload.roomId, call.peer, remoteStream);
          this.emit("stream-added", call.peer, remoteStream);
        });
      } else {
        console.warn(
          `[MitMe Client] Could not answer call from ${call.peer} because resolvedLocalStream is missing`,
        );
      }
    });

    this.peers.on("error", (err) => {
      this.emit("error", err);
    });

    this.peers.on("open", (peerId) => {
      console.log(
        `[MitMe Client] PeerJS open with ID: ${peerId}. Connecting to signaling server...`,
      );
      const wsUrl = this.config.signalingUrl;
      this.signaling = new Signaling(wsUrl);

      this.signaling.on("connected", () => {
        this.signaling?.join();
      });

      this.signaling.on(
        "chat-message",
        (data: { peerId: string; sender: string; text: string }) => {
          this.emit(
            "chat-message-received",
            data.peerId,
            data.sender,
            data.text,
          );
        },
      );

      this.signaling.on(
        "room-details",
        (data: { peers: { peerId: string; name: string }[] }) => {
          for (const peerInfo of data.peers) {
            const newUser: User = {
              id: peerInfo.peerId,
              name: peerInfo.name,
              stream: null,
              audio: true,
              video: true,
            };
            this.rooms.addUser(payload.roomId, newUser);
            this.emit("peer-joined", peerInfo.peerId, peerInfo.name);

            console.log(
              `[MitMe Client] Initiating outgoing call to peer: ${peerInfo.peerId}`,
            );
            if (this.resolvedLocalStream) {
              const call = this.peers?.call(
                peerInfo.peerId,
                this.resolvedLocalStream,
              );
              call?.on("stream", (remoteStream: MediaStream) => {
                console.log(
                  `[MitMe Client] Stream event fired on outgoing call to peer: ${peerInfo.peerId}`,
                );
                this.rooms.updateUserStream(
                  payload.roomId,
                  peerInfo.peerId,
                  remoteStream,
                );
                this.emit("stream-added", peerInfo.peerId, remoteStream);
              });
            } else {
              console.warn(
                `[MitMe Client] Could not call peer ${peerInfo.peerId} because resolvedLocalStream is missing`,
              );
            }
          }
        },
      );

      this.signaling.on(
        "peer-joined",
        (data: { peerId: string; name: string }) => {
          const newUser: User = {
            id: data.peerId,
            name: data.name,
            stream: null,
            audio: true,
            video: true,
          };
          this.rooms.addUser(payload.roomId, newUser);
          this.emit("peer-joined", data.peerId, data.name);
        },
      );

      this.signaling.on("peer-left", (data: { peerId: string }) => {
        this.rooms.removeUser(payload.roomId, data.peerId);
        this.peers?.closeConnection(data.peerId);
        this.emit("peer-left", data.peerId);
      });

      this.signaling.on(
        "toggle-media",
        (data: { peerId: string; audio: boolean; video: boolean }) => {
          this.rooms.updateUserMedia(
            payload.roomId,
            data.peerId,
            data.audio,
            data.video,
          );
          this.emit("peer-toggled-media", data.peerId, data.audio, data.video);
        },
      );

      this.signaling.on("error", (err) => {
        this.emit("error", err);
      });

      this.signaling.connect(
        payload.roomId,
        payload.peerId,
        payload.user.name || "Anonymous",
      );
    });
  }

  /**
   * Toggles the audio in `MediaConstraints`.
   * @returns Boolean
   */
  toggleAudio(): boolean {
    if (this.resolvedLocalStream) {
      const track = this.resolvedLocalStream.getAudioTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        this.signaling?.toggleMedia(track.enabled, this.isVideoEnabled());
        this.emit("local-toggled-media", track.enabled, this.isVideoEnabled());
        return track.enabled;
      }
    }
    return false;
  }

  /**
   * Toggles the video in `MediaConstraints`.
   * @returns Boolean
   */
  toggleVideo(): boolean {
    if (this.resolvedLocalStream) {
      const track = this.resolvedLocalStream.getVideoTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        this.signaling?.toggleMedia(this.isAudioEnabled(), track.enabled);
        this.emit("local-toggled-media", this.isAudioEnabled(), track.enabled);
        return track.enabled;
      }
    }
    return false;
  }

  /**
   * Checks whether the `Local Stream` has audio tracks in it. Basically whether the `mic` is on or not.
   * @returns Boolean
   */
  isAudioEnabled(): boolean {
    if (this.resolvedLocalStream) {
      const track = this.resolvedLocalStream.getAudioTracks()[0];
      return track ? track.enabled : false;
    }
    return false;
  }

  /**
   * Checks whether the `Local Stream` has video tracks in it. Basically whether the `cam` is on or not.
   * @returns Boolean
   */
  isVideoEnabled(): boolean {
    if (this.resolvedLocalStream) {
      const track = this.resolvedLocalStream.getVideoTracks()[0];
      return track ? track.enabled : false;
    }
    return false;
  }

  /**
   * Gets the users `Screen Stream`
   * @returns boolean
   */
  async startScreenShare() {
    try {
      const screenStream = await this.media.getScreenStream({
        video: true,
        audio: true,
        screen: { video: true, audio: true },
      });
      if (screenStream) {
        const videoTrack = screenStream.getVideoTracks()[0];
        if (videoTrack && this.peers) {
          const oldVideoTrack = this.resolvedLocalStream?.getVideoTracks()[0];
          if (oldVideoTrack && this.resolvedLocalStream) {
            this.resolvedLocalStream.removeTrack(oldVideoTrack);
            oldVideoTrack.stop();
            this.resolvedLocalStream.addTrack(videoTrack);

            const calls = (this.peers as any).calls;
            if (calls) {
              for (const call of calls.values()) {
                const peerConnection = call.peerConnection as RTCPeerConnection;
                if (peerConnection) {
                  const senders = peerConnection.getSenders();
                  const videoSender = senders.find(
                    (sender) => sender.track?.kind === "video",
                  );
                  if (videoSender) {
                    videoSender.replaceTrack(videoTrack);
                  }
                }
              }
            }
          }

          videoTrack.onended = () => {
            this.stopScreenShare();
          };

          this.emit("local-stream", this.resolvedLocalStream!);
          return true;
        }
      }
    } catch (err) {
      console.error("Screen share failed:", err);
    }
    return false;
  }

  /**
   * Stops screen-sharing and switches to `Local Stream` with the current `MediaConstraints`.
   */
  async stopScreenShare() {
    try {
      const camStream = await this.media.getLocalStream(
        this.config.constraints,
      );
      const newVideoTrack = camStream.getVideoTracks()[0];

      if (newVideoTrack && this.resolvedLocalStream && this.peers) {
        const oldVideoTrack = this.resolvedLocalStream.getVideoTracks()[0];
        if (oldVideoTrack) {
          this.resolvedLocalStream.removeTrack(oldVideoTrack);
          oldVideoTrack.stop();
        }
        this.resolvedLocalStream.addTrack(newVideoTrack);

        const calls = (this.peers as any).calls;
        if (calls) {
          for (const call of calls.values()) {
            const peerConnection = call.peerConnection as RTCPeerConnection;
            if (peerConnection) {
              const senders = peerConnection.getSenders();
              const videoSender = senders.find(
                (sender) => sender.track?.kind === "video",
              );
              if (videoSender) {
                videoSender.replaceTrack(newVideoTrack);
              }
            }
          }
        }
      }

      this.emit("local-stream", this.resolvedLocalStream!);
    } catch (err) {
      console.error("Failed to recover camera stream:", err);
    }
  }

  /**
   * Method to send text message in a room.
   * @param text Text message to be sent. `string`
   */
  sendChatMessage(text: string) {
    this.signaling?.sendChatMessage(text);
  }

  /**
   * Cleans up everything by disconnecting the WeSocket, destroys all peer connections, stops all media collection and cleans up the rooms.
   */
  async leave() {
    this.signaling?.disconnect();

    this.peers?.destroy();

    this.media.stopAll();
    this.resolvedLocalStream = null;

    if (this.rooms.currentRoomId) this.rooms.leave(this.rooms.currentRoomId);

    this.emit("left");
  }
}
