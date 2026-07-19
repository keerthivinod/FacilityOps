"use client";
import { useMemo } from "react";
import { cd } from "@/lib/data";

export default function Rpt({ P }) {
  // ⚡ Bolt Optimization: Consolidate multiple O(N) .filter() passes into a single .reduce()
  const { stats, priorityDist } = useMemo(() => {
    const totalTickets = P.tickets.length;

    // Calculate all ticket aggregates in one pass instead of 6 separate filter traversals
    const tStats = P.tickets.reduce((acc, t) => {
        if (t.status === "resolved" || t.status === "closed") acc.resolved++;
        if (t.tatMins) {
            acc.tatSum += t.tatMins;
            acc.tatCount++;
        }
        if (acc.priority[t.priority] !== undefined) {
            acc.priority[t.priority]++;
        }
        return acc;
    }, { resolved: 0, tatSum: 0, tatCount: 0, priority: { critical: 0, high: 0, medium: 0, low: 0 } });

    const avgTAT = tStats.tatCount > 0 ? tStats.tatSum / tStats.tatCount : 0;

    // Calculate tasks in one pass
    const overdueCount = P.tasks.reduce((acc, t) => t.status === "overdue" ? acc + 1 : acc, 0);

    const stats = { totalTickets, resolved: tStats.resolved, avgTAT, overdueCount };

    const priorities = ["critical", "high", "medium", "low"];
    const colors = { critical: "#dc2626", high: "#ea580c", medium: "#d97706", low: "#2563eb" };

    const priorityDist = priorities.map(p => {
      const cnt = tStats.priority[p];
      const pct = totalTickets > 0 ? Math.round((cnt / totalTickets) * 100) : 0;
      return { p, cnt, pct, color: colors[p] };
    });

    return { stats, priorityDist };
  }, [P.tickets, P.tasks]);

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
