let currentAudio = null;

export async function speakWithPiper(text) {
    if (!text || !text.trim()) return;

    // Stop any existing speech
    stopPiper();

    const response = await fetch("http://localhost:5002/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
    });

    if (!response.ok) {
        throw new Error("Piper TTS failed");
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    currentAudio = new Audio(audioUrl);

    return new Promise((resolve) => {
        currentAudio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            currentAudio = null;
            resolve();
        };

        currentAudio.play();
    });
}

export function stopPiper() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
}
