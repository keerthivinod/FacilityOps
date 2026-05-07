"use client";
import { cd } from "@/lib/data";

export default function Ntf({ P }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 800 }}>Notifications</div>
        <button
          onClick={() => P.setNotifs(n => n.map(x => ({ ...x, read: true })))}
          style={{ background: "none", border: "none", color: "#4f46e5", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
        >
          Mark all read
        </button>
      </div>
      {P.notifs.map(n => (
        <div key={n.id} style={{ ...cd({ marginBottom: 8 }), background: n.read ? "#fff" : "#eff6ff", border: n.read ? "1px solid #e5e7eb" : "1px solid #bfdbfe" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{n.title}</span>
            <span style={{ fontSize: 10, color: "#94a3b8" }}>{n.time}</span>
          </div>
          <div style={{ fontSize: 12, color: "#475569" }}>{n.body}</div>
        </div>
      ))}
    </div>
  );
}
