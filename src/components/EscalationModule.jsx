"use client";
import { cd } from "@/lib/data";

export default function Esc({ P }) {
  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>SLA Escalations</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        <div style={{ background: "#fff", border: "1px solid #fca5a5", borderRadius: 12, padding: 12, textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#dc2626" }}>{P.tickets.filter(x => x.escLevel >= 3).length}</div>
          <div style={{ fontSize: 11, color: "#dc2626", fontWeight: 600 }}>Level 3 (Manager)</div>
        </div>
        <div style={{ background: "#fff", border: "1px solid #fcd34d", borderRadius: 12, padding: 12, textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#d97706" }}>{P.tickets.filter(x => x.escLevel === 2).length}</div>
          <div style={{ fontSize: 11, color: "#d97706", fontWeight: 600 }}>Level 2 (Admin)</div>
        </div>
      </div>
      {P.tickets.filter(t => t.escLevel >= 2).map(t => (
        <div key={t.id} style={{ ...cd({ marginBottom: 8 }), borderLeft: `4px solid ${t.escLevel >= 3 ? "#dc2626" : "#d97706"}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{t.asset}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: t.escLevel >= 3 ? "#dc2626" : "#d97706" }}>L{t.escLevel} Escalation</span>
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>{t.problem}</div>
          <div style={{ background: "#f8fafc", borderRadius: 8, padding: 8, fontSize: 11, color: "#475569" }}>
            Current Handler: <b>{t.assignee || "Unassigned"}</b><br />
            Elapsed: {t.tatMins || "Pending"} mins
          </div>
        </div>
      ))}
    </div>
  );
}
