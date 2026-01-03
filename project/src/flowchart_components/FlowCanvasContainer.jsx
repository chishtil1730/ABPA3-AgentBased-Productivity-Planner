import FlowCanvas from "./FlowCanvas";

export default function FlowCanvasContainer({ width = "93.3%", height = "680px" }) {
    return (
        <div
            style={{
                width,
                height,
                position: "relative",
                overflow: "hidden",
                borderRadius: 18,
                left:-18,
                zIndex:"auto",
                background: "rgba(11,11,11,0)",
                flexShrink: 0,
            }}
        >
        <FlowCanvas/>
        </div>
    );
}
