export function Modal({ title, onClose, onSave, children, isDelete, onDelete }) {
    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 50, display: "flex", alignItems: "flex-end" }}>
            <div style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: 20, width: "100%", maxWidth: 480, margin: "0 auto", maxHeight: "85vh", overflowY: "auto", animation: "slideUp 0.3s ease" }}>
                <div style={{ width: 40, height: 4, background: "#e5e7eb", borderRadius: 2, margin: "0 auto 16px" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ fontSize: 16, fontWeight: 800 }}>{title}</div>
                    {isDelete && (
                        <button onClick={onDelete} style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                            🗑️ Delete
                        </button>
                    )}
                </div>
                {children}
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                    <button onClick={onClose} style={{ flex: 1, padding: "11px", border: "1px solid #e5e7eb", borderRadius: 12, background: "#fff", fontSize: 13, cursor: "pointer", color: "#64748b", fontWeight: 600 }}>
                        Cancel
                    </button>
                    <button onClick={onSave} style={{ flex: 2, padding: "11px", border: "none", borderRadius: 12, background: "#4f46e5", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
