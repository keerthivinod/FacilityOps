import { useState } from "react";
import { cd, SB, Badge } from "@/lib/data";
import { Modal } from "./Modal";
import { api } from "@/lib/api";

export default function Tkt({ tickets, setTickets, showToast, staff }) {
    const [showForm, setShowForm] = useState(false);
    const [detail, setDetail] = useState(null);
    const [filter, setFilter] = useState("all");
    const [form, setForm] = useState(null);

    const PC = { critical: "#dc2626", high: "#ea580c", medium: "#d97706", low: "#2563eb" };
    const PB = { critical: "#fef2f2", high: "#fff7ed", medium: "#fffbeb", low: "#eff6ff" };

    const handleEdit = (ticket) => {
        setForm({ ...ticket });
        setShowForm(true);
    };

    const handleAdd = () => {
        setForm({ asset: "", loc: "", problem: "", priority: "high", by: "", category: "General", status: "open", assignee: "" });
        setShowForm(true);
    };

    const submit = async () => {
        if (!form.problem) {
            showToast("Describe problem", "error");
            return;
        }
        const now = new Date();
        if (form.id) {
            setTickets((p) => p.map((t) => (t.id === form.id ? form : t)));
            // Persist update to DB (fire-and-forget)
            api.put("tickets", form.id, { status: form.status, cost: form.cost, resolution: form.resolution }).catch(() => {});
            showToast("Ticket updated");
        } else {
            const newTicket = {
                ...form,
                asset: form.asset || "General Issue",
                date: now.toISOString().split("T")[0],
                cost: null,
                createdAt: now.toISOString(),
                startedAt: null,
                resolvedAt: null,
                escLevel: 1,
                escLog: [now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) + " Manual creation"],
                source: "app",
                tatMins: null,
            };
            // Persist to DB; use returned UUID so subsequent updates reference the correct row
            try {
                const saved = await api.post("tickets", { problem: form.problem, priority: form.priority, loc: form.loc });
                newTicket.id = saved.id;
            } catch {
                newTicket.id = "T" + String(tickets.length + 1).padStart(3, "0");
            }
            setTickets((p) => [newTicket, ...p]);
            showToast("Ticket created");
        }
        setShowForm(false);
        if (detail && form.id === detail) setDetail(null);
    };

    const handleDelete = () => {
        if (!window.confirm("Delete this ticket?")) return;
        setTickets((p) => p.filter((t) => t.id !== form.id));
        api.del("tickets", form.id).catch(() => {});
        setShowForm(false);
        if (detail && form.id === detail) setDetail(null);
        showToast("Ticket deleted");
    };

    const upd = (id, status) => {
        const now = new Date();
        setTickets((p) =>
            p.map((t) => {
                if (t.id !== id) return t;
                const u = { ...t, status };
                if (status === "in-progress" && !u.startedAt) u.startedAt = now.toISOString();
                if (status === "resolved" && !u.resolvedAt) {
                    u.resolvedAt = now.toISOString();
                    if (t.createdAt) u.tatMins = Math.round((now.getTime() - new Date(t.createdAt).getTime()) / 60000);
                }
                u.escLog = [...t.escLog, `${now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} → ${status}${u.tatMins ? ` (TAT:${u.tatMins}m)` : ""}`];
                return u;
            })
        );
        api.put("tickets", id, { status }).catch(() => {});
        showToast(`→ ${status}`);
    };

    const flt = filter === "all" ? tickets : tickets.filter((t) => t.status === filter);
    const t = detail ? tickets.find((x) => x.id === detail) : null;

    if (detail && t)
        return (
            <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <button onClick={() => setDetail(null)} style={{ fontSize: 13, color: "#4f46e5", background: "none", border: "none", cursor: "pointer", fontWeight: 600, padding: 0 }}>← Back</button>
                    <button onClick={() => handleEdit(t)} style={{ fontSize: 12, background: "#f1f5f9", color: "#475569", border: "none", padding: "4px 12px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>✏️ Edit Ticket</button>
                </div>
                <div style={cd({ borderLeft: `4px solid ${PC[t.priority]}` })}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, color: PC[t.priority], background: PB[t.priority], border: `1px solid ${PC[t.priority]}22` }}>{t.priority.toUpperCase()}</span>
                        <SB s={t.status} />
                        <Badge label={`L${t.escLevel}`} color={t.escLevel >= 3 ? "#dc2626" : "#16a34a"} bg={t.escLevel >= 3 ? "#fef2f2" : "#f0fdf4"} />
                        {t.source === "whatsapp" && <Badge label="WhatsApp" color="#16a34a" bg="#f0fdf4" />}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>{t.asset}</div>
                    {t.loc && <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>📍 {t.loc}</div>}
                    <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, marginBottom: 12 }}>{t.problem}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                        {[["Reported", t.date], ["By", t.by], ["Assigned", t.assignee || ""], ["Category", t.category || ""], ["TAT", t.tatMins ? `${t.tatMins}m` : "Ongoing"], ["Cost", t.cost ? `₹${t.cost}` : ""]].map(([k, v]) => (
                            <div key={k} style={{ background: "#f8fafc", borderRadius: 10, padding: "8px 10px" }}>
                                <div style={{ fontSize: 10, color: "#94a3b8" }}>{k}</div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>{v}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ background: "#f8fafc", borderRadius: 12, padding: 10, marginBottom: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 4 }}>⏫ Timeline</div>
                        {t.escLog.map((l, i) => (
                            <div key={i} style={{ fontSize: 10, color: "#64748b", paddingLeft: 12, borderLeft: `2px solid ${i === t.escLog.length - 1 ? "#4f46e5" : "#e5e7eb"}`, marginBottom: 2 }}>
                                ⏱ {l}
                            </div>
                        ))}
                    </div>
                    {t.resolution && (
                        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 12px", marginBottom: 12 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#15803d" }}>Resolution</div>
                            <div style={{ fontSize: 12, color: "#166534" }}>{t.resolution}</div>
                        </div>
                    )}
                    {t.status !== "resolved" && t.status !== "closed" && (
                        <div style={{ display: "flex", gap: 8 }}>
                            {t.status === "open" && (
                                <button onClick={() => upd(t.id, "in-progress")} style={{ padding: "8px 14px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, color: "#d97706", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                                    ▶ Start
                                </button>
                            )}
                            {t.status === "in-progress" && (
                                <button onClick={() => upd(t.id, "resolved")} style={{ padding: "8px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, color: "#16a34a", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                                    ✓ Resolve
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Tickets</div>
                <button onClick={handleAdd} style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: 10, padding: "7px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    + Report
                </button>
            </div>

            <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto" }}>
                {[["all", "All", tickets.length], ["open", "Open", tickets.filter((t) => t.status === "open").length], ["in-progress", "Active", tickets.filter((t) => t.status === "in-progress").length], ["resolved", "Done", tickets.filter((t) => t.status === "resolved").length]].map(([v, l, c]) => (
                    <button key={v} onClick={() => setFilter(v)} style={{ padding: "5px 12px", borderRadius: 999, border: `1px solid ${filter === v ? "#4f46e5" : "#e5e7eb"}`, background: filter === v ? "#4f46e5" : "#fff", color: filter === v ? "#fff" : "#64748b", fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                        {l}({c})
                    </button>
                ))}
            </div>

            {flt.map((t) => (
                <div key={t.id} className="card-hover" onClick={() => setDetail(t.id)} style={{ ...cd({ cursor: "pointer", marginBottom: 8 }), borderLeft: `4px solid ${PC[t.priority] || "#6b7280"}` }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, color: PC[t.priority], background: PB[t.priority], border: `1px solid ${PC[t.priority]}22` }}>{t.priority.toUpperCase()}</span>
                        <SB s={t.status} />
                        <Badge label={`L${t.escLevel}`} color={t.escLevel >= 3 ? "#dc2626" : t.escLevel >= 2 ? "#d97706" : "#16a34a"} bg={t.escLevel >= 3 ? "#fef2f2" : t.escLevel >= 2 ? "#fffbeb" : "#f0fdf4"} />
                        {t.source === "whatsapp" && <span style={{ fontSize: 10, color: "#16a34a" }}>💬</span>}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>{t.asset}</div>
                    <div style={{ fontSize: 11, color: "#64748b", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{t.problem}</div>
                    <div style={{ marginTop: 6, fontSize: 10, color: "#94a3b8" }}>
                        {t.assignee || ""} · {t.date}
                        {t.tatMins && <span style={{ color: "#16a34a", fontWeight: 600 }}> TAT:{t.tatMins}m</span>}
                    </div>
                </div>
            ))}

            {showForm && form && (
                <Modal title={form.id ? "Edit Ticket" : "Report Issue"} onClose={() => setShowForm(false)} onSave={submit} isDelete={!!form.id} onDelete={handleDelete}>
                    {[["Asset/Area", "asset", "text"], ["Location", "loc", "text"], ["Reported By", "by", "text"]].map(([l, k, type]) => (
                        <div key={k} style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>{l}</div>
                            <input type={type} value={form[k] || ""} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                        </div>
                    ))}
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Problem *</div>
                        <textarea value={form.problem || ""} onChange={(e) => setForm((f) => ({ ...f, problem: e.target.value }))} placeholder="Describe..." style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", resize: "none", height: 60, boxSizing: "border-box" }} />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Assignee</div>
                        <select value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, background: "#fff" }}>
                            <option value="">-- Auto Assign via AI --</option>
                            {staff?.map((s) => (
                                <option key={s.id} value={s.name}>{s.name} ({s.role})</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>Priority</div>
                            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, background: "#fff" }}>
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>Status</div>
                            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, background: "#fff" }}>
                                <option value="open">Open</option>
                                <option value="in-progress">In-Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
