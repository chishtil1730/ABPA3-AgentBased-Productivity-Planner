import UpcomingPanel from "./UpcomingPanel";
import {get} from "../voice-assistant/VoiceOrb"

export default function UpcomingPanelContainer({
                                                   width = "455px",
                                                   height = "auto",
                                                   isWaitingForResponse,
                                               }) {
    return (
        <div
            style={{
                width,
                height,
                position: "relative",
                display: "flex",
                left:-10,
                alignItems: "center",
                justifyContent: "center",
                overflow: "visible"
            }}
        >
            <UpcomingPanel />

        </div>
    );
}
