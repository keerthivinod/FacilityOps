"use client";
import { cd } from "@/lib/data";
import { useMemo } from "react";

export default function Rpt({ P }) {
  const totalTickets = P.tickets.length;

  const { resolved, avgTAT, priorityCounts } = useMemo(() => {
    let resolvedCount = 0;
    let tatSum = 0;
    let tatCount = 0;
    const prioCounts = { critical: 0, high: 0, medium: 0, low: 0 };

    for (const t of P.tickets) {
      if (t.status === "resolved" || t.status === "closed") resolvedCount++;
      if (t.tatMins) {
        tatSum += t.tatMins;
        tatCount++;
      }
      if (prioCounts[t.priority] !== undefined) {
        prioCounts[t.priority]++;
      }
    }

    return {
      resolved: resolvedCount,
      avgTAT: tatCount > 0 ? tatSum / tatCount : 0,
      priorityCounts: prioCounts
    };
  }, [P.tickets]);

  const overdueCount = useMemo(() => {
    let count = 0;
    for (const t of P.tasks) {
      if (t.status === "overdue") count++;
    }
    return count;
  }, [P.tasks]);

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 14 }}>Reports</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[
          ["Total Tickets", totalTickets, "#4f46e5", "#eff6ff"],
          ["Resolved", resolved, "#16a34a", "#f0fdf4"],
          ["Avg TAT", `${Math.round(avgTAT)}m`, "#d97706", "#fffbeb"],
          ["Overdue Tasks", overdueCount, "#dc2626", "#fef2f2"],
        ].map(([l, v, c, bg]) => (
          <div key={l} style={{ ...cd({ padding: 16 }), background: bg, border: `1px solid ${c}33` }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: c }}>{v}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: c }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={cd({ marginBottom: 10 })}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Tickets by Priority</div>
        {["critical", "high", "medium", "low"].map(p => {
          const cnt = priorityCounts[p];
          const pct = totalTickets > 0 ? Math.round((cnt / totalTickets) * 100) : 0;
          const colors = { critical: "#dc2626", high: "#ea580c", medium: "#d97706", low: "#2563eb" };
          return (
            <div key={p} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                <span style={{ textTransform: "capitalize", color: "#475569" }}>{p}</span>
                <span style={{ fontWeight: 700, color: colors[p] }}>{cnt} ({pct}%)</span>
              </div>
              <div style={{ height: 5, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", background: colors[p], width: `${pct}%`, borderRadius: 3 }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={cd()}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Staff Performance</div>
        {P.staff.filter(s => s.tasksCompleted > 0).map(s => (
          <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 6, marginBottom: 6, borderBottom: "1px solid #f1f5f9" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{s.name}</div>
              <div style={{ fontSize: 10, color: "#94a3b8" }}>{s.role}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#4f46e5" }}>{s.tasksCompleted} tasks</div>
              <div style={{ fontSize: 10, color: "#94a3b8" }}>TAT: {s.avgTAT}m {"\u00B7"} {"\u2B50"}{s.rating}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
