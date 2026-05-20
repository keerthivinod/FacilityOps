"use client";
import { useMemo } from "react";
import { cd } from "@/lib/data";

export default function Rpt({ P }) {
  // Memoize top level ticket/task computations to avoid O(N) operations on every render
  // ⚡ Bolt Optimization: Replace multiple .filter() passes with a single loop
  const stats = useMemo(() => {
    let resolved = 0;
    let tatSum = 0;
    let tatCount = 0;

    for (let i = 0; i < P.tickets.length; i++) {
        const t = P.tickets[i];
        if (t.status === "resolved" || t.status === "closed") resolved++;
        if (t.tatMins) {
            tatSum += t.tatMins;
            tatCount++;
        }
    }
    const avgTAT = tatSum / (tatCount || 1);

    let overdueCount = 0;
    for (let i = 0; i < P.tasks.length; i++) {
        if (P.tasks[i].status === "overdue") overdueCount++;
    }

    return { totalTickets: P.tickets.length, resolved, avgTAT, overdueCount };
  }, [P.tickets, P.tasks]);

  // Memoize priority distributions
  // ⚡ Bolt Optimization: Replace O(N * Priorities) filtering with O(N) hash map accumulation
  const priorityDist = useMemo(() => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    for (let i = 0; i < P.tickets.length; i++) {
        if (counts[P.tickets[i].priority] !== undefined) {
            counts[P.tickets[i].priority]++;
        }
    }
    const priorities = ["critical", "high", "medium", "low"];
    const colors = { critical: "#dc2626", high: "#ea580c", medium: "#d97706", low: "#2563eb" };
    return priorities.map(p => {
      const cnt = counts[p];
      const pct = stats.totalTickets > 0 ? Math.round((cnt / stats.totalTickets) * 100) : 0;
      return { p, cnt, pct, color: colors[p] };
    });
  }, [P.tickets, stats.totalTickets]);

  // Memoize staff performance filtering
  const activeStaff = useMemo(() => P.staff.filter(s => s.tasksCompleted > 0), [P.staff]);

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 14 }}>Reports</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[
          ["Total Tickets", stats.totalTickets, "#4f46e5", "#eff6ff"],
          ["Resolved", stats.resolved, "#16a34a", "#f0fdf4"],
          ["Avg TAT", `${Math.round(stats.avgTAT)}m`, "#d97706", "#fffbeb"],
          ["Overdue Tasks", stats.overdueCount, "#dc2626", "#fef2f2"],
        ].map(([l, v, c, bg]) => (
          <div key={l} style={{ ...cd({ padding: 16 }), background: bg, border: `1px solid ${c}33` }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: c }}>{v}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: c }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={cd({ marginBottom: 10 })}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Tickets by Priority</div>
        {priorityDist.map(({ p, cnt, pct, color }) => (
          <div key={p} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
              <span style={{ textTransform: "capitalize", color: "#475569" }}>{p}</span>
              <span style={{ fontWeight: 700, color: color }}>{cnt} ({pct}%)</span>
            </div>
            <div style={{ height: 5, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", background: color, width: `${pct}%`, borderRadius: 3 }} />
            </div>
          </div>
        ))}
      </div>

      <div style={cd()}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Staff Performance</div>
        {activeStaff.map(s => (
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
