let mediaRecorder = null;
let audioChunks = [];
let audioStream = null;

/**
 * Start microphone recording.
 * Returns MediaStream for VoiceOrb animation.
 */
export async function startWhisperRecording() {
    if (mediaRecorder) return audioStream;

    audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    audioChunks = [];
    mediaRecorder = new MediaRecorder(audioStream, {
        mimeType: "audio/webm",
    });

    mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
            audioChunks.push(e.data);
        }
    };

    mediaRecorder.start();

    return audioStream; // used by VoiceOrb analyser
}

/**
 * Stop recording, send audio to Whisper backend,
 * return transcribed text.
 */
export async function stopWhisperRecording() {
    if (!mediaRecorder) return "";

    return new Promise((resolve, reject) => {
        mediaRecorder.onstop = async () => {
            try {
                const audioBlob = new Blob(audioChunks, { type: "audio/webm" });

                const formData = new FormData();
                formData.append("audio", audioBlob, "speech.webm");

                const response = await fetch("http://localhost:5002/stt", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error("Whisper STT failed");
                }

                const data = await response.json();
                cleanup();
                resolve(data.text?.trim() || "");
            } catch (err) {
                cleanup();
                reject(err);
            }
        };

        mediaRecorder.stop();
    });
}

/**
 * Cancel recording immediately.
 */
export function cancelWhisperRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
    }
    cleanup();
}

function cleanup() {
    if (audioStream) {
        audioStream.getTracks().forEach((t) => t.stop());
        audioStream = null;
    }
    mediaRecorder = null;
    audioChunks = [];
}
