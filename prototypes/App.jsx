import ChatUI from "./ChatUI";

export default function App() {
    return (
        <div style={styles.app}>
            <h1 style={styles.title}>My AI Chat</h1>
            <ChatUI />
        </div>
    );
}

const styles = {
    app: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "system-ui",
        marginTop: "20px"
    },
    title: {
        marginBottom: "10px",
        fontWeight: 600
    }
};
