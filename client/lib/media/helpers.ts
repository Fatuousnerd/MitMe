export async function createMediaStream(
  video: boolean,
  audio: boolean,
): Promise<MediaStream | null> {
  if (!video && !audio) return null;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video, audio });

    return stream;
  } catch (err) {
    console.error("Failed to access media devices...", err);
    return null;
  }
}

export function stopMediaStream(stream: MediaStream | null) {
  if (!stream) return;

  stream.getTracks().forEach((track) => track.stop());
}
