import React, { useState } from "react";
import VoiceOrb from "./VoiceOrb";
import ChatUI from "./ChatUI";

export default function IntegratedApp() {
    const [micOn, setMicOn] = useState(false);
    const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
    const [voiceText, setVoiceText] = useState("");

    return (
        <div style={styles.container}>
            <VoiceOrb
                micOn={micOn}
                setMicOn={setMicOn}
                isWaitingForResponse={isWaitingForResponse}
                setIsWaitingForResponse={setIsWaitingForResponse}
                onTranscript={setVoiceText}
            />


            <div style={{ display: "none" }}>
                <ChatUI
                    setMicOn={setMicOn}
                    setIsWaitingForResponse={setIsWaitingForResponse}
                    externalInput={voiceText}
                    clearExternalInput={() => setVoiceText("")}
                />
            </div>

            {/*<ChatUI
                setMicOn={setMicOn}
                setIsWaitingForResponse={setIsWaitingForResponse}
                externalInput={voiceText}
                clearExternalInput={() => setVoiceText("")}
            />*/}
        </div>
    );
}


const styles = {
    container: {
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "40px",
        background: "#050508",
    }
};