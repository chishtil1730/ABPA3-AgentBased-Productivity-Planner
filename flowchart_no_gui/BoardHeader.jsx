export default function BoardHeader({
                                        title,
                                        onPrev,
                                        onNext,
                                        onAdd,
                                        onTitleChange,
                                    }) {
    return (
        <div
            style={{
                height: 56,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "0 16px",
                background: "rgba(120,120,120,0.25)",
                backdropFilter: "blur(8px)",
                borderBottom: "1px solid rgba(255,255,255,0.2)",
                color: "white",
            }}
        >
            <button onClick={onPrev}>⟵</button>

            <input
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    color: "white",
                    fontSize: 18,
                    fontWeight: 600,
                    outline: "none",
                }}
            />

            <button onClick={onAdd}>＋</button>
            <button onClick={onNext}>⟶</button>
        </div>
    );
}
