import { MediaConstraintsSchema, type MediaConstraints } from "./Types";

export class Media {
  localStream: MediaStream | null = null;
  screenStream: MediaStream | null = null;

  constructor() {}

  /**
   * 
   * This functions gets the local stream of the device, i.e., video, audio.
   * @param constraints Media Constraints object. 
   * @returns Local Stream Promise.
   */
  async getLocalStream(constraints: MediaConstraints) {
    const validated = MediaConstraintsSchema.parse(constraints);
    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: validated.video,
      audio: validated.audio,
    });

    return this.localStream;
  }

  /**
   * 
   * This functions gets the local stream of the device's screen, i.e., what's being displayed in the user's screen.
   * @param constraints Media Constraints object. 
   * @returns Screen Stream Promise.
   */
  async getScreenStream(constraints: MediaConstraints) {
    const validated = MediaConstraintsSchema.parse(constraints);
    if (validated.screen && (validated.screen.video || validated.screen.audio)) {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: validated.screen.video,
        audio: validated.screen.audio,
      });
      return this.screenStream;
    }
    return null;
  }

  /**
   * This function stops all streams if any. Both Local Stream as well as Screen Stream.
   */
  stopAll() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((track) => track.stop());
      this.screenStream = null;
    }
  }
}
