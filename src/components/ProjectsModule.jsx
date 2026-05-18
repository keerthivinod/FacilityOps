import { useState, useMemo } from "react";
import { cd, SB, Badge } from "@/lib/data";
import { Modal } from "./Modal";

const PC = { critical: "#dc2626", high: "#ea580c", medium: "#d97706", low: "#2563eb" };
const PB = { critical: "#fef2f2", high: "#fff7ed", medium: "#fffbeb", low: "#eff6ff" };

export default function Prj({ projects, setProjects, showToast, staff }) {
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState(null);
    const [filter, setFilter] = useState("all");

    const handleAdd = () => {
        setForm({ name: "", lead: "", start: new Date().toISOString().split("T")[0], end: "", budget: 0, spent: 0, progress: 0, priority: "medium", status: "planned" });
        setShowAdd(true);
    };

    const handleEdit = (p) => {
        setForm({ ...p });
        setShowAdd(true);
    };

    const saveForm = () => {
        if (!form.name) { showToast("Project name required", "error"); return; }
        if (form.id) {
            setProjects(p => p.map(x => x.id === form.id ? { ...form, budget: Number(form.budget), spent: Number(form.spent), progress: Number(form.progress) } : x));
            showToast("Project updated");
        } else {
            const id = `P${String(projects.length + 1).padStart(3, "0")}`;
            setProjects(p => [...p, { ...form, id, budget: Number(form.budget), spent: Number(form.spent), progress: Number(form.progress) }]);
            showToast("Project added");
        }
        setShowAdd(false);
    };

    const handleDelete = () => {
        if (!window.confirm(`Delete project "${form.name}"?`)) return;
        setProjects(p => p.filter(x => x.id !== form.id));
        setShowAdd(false);
        showToast("Project deleted");
    };

    const counts = useMemo(() => {
        const c = { all: projects.length, planned: 0, "in-progress": 0, completed: 0, "on-hold": 0 };
        for (let i = 0; i < projects.length; i++) {
            const s = projects[i].status;
            if (c[s] !== undefined) {
                c[s]++;
            } else {
                c[s] = 1;
            }
        }
        return c;
    }, [projects]);

    const flt = filter === "all" ? projects : projects.filter(p => p.status === filter);

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Projects</div>
                <button onClick={handleAdd} style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 10, padding: "7px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    + Add Project
                </button>
            </div>

            <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 12 }}>
                {[["all", "All"], ["planned", "Planned"], ["in-progress", "Active"], ["completed", "Done"], ["on-hold", "On Hold"]].map(([v, l]) => (
                    <button key={v} onClick={() => setFilter(v)} style={{ padding: "5px 12px", borderRadius: 999, border: `1px solid ${filter === v ? "#7c3aed" : "#e5e7eb"}`, background: filter === v ? "#7c3aed" : "#fff", color: filter === v ? "#fff" : "#64748b", fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                        {l} ({counts[v] || 0})
                    </button>
                ))}
            </div>

            {flt.map(p => {
                const budgetPct = p.budget > 0 ? Math.min(100, Math.round((p.spent / p.budget) * 100)) : 0;
                const overBudget = p.spent > p.budget;
                return (
                    <div key={p.id} style={{ ...cd({ marginBottom: 10, position: "relative" }), borderLeft: `4px solid ${PC[p.priority] || "#6b7280"}` }}>
                        <button onClick={() => handleEdit(p)} style={{ position: "absolute", top: 10, right: 10, background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#4f46e5" }}>✏️ Edit</button>
                        <div style={{ paddingRight: 50, marginBottom: 8 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{p.name}</div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                <SB s={p.status} />
                                <Badge label={p.priority.toUpperCase()} color={PC[p.priority]} bg={PB[p.priority]} />
                            </div>
                        </div>
                        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>
                            👤 {p.lead} &nbsp;·&nbsp; 📅 {p.start} → {p.end || "TBD"}
                        </div>

                        <div style={{ marginBottom: 6 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94a3b8", marginBottom: 3 }}>
                                <span>Progress</span>
                                <span>{p.progress}%</span>
                            </div>
                            <div style={{ height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                                <div style={{ height: "100%", background: p.status === "completed" ? "#16a34a" : "#7c3aed", borderRadius: 3, width: `${p.progress}%`, transition: "width .3s" }} />
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                            {[["Budget", `₹${(p.budget / 1000).toFixed(0)}K`], ["Spent", `₹${(p.spent / 1000).toFixed(0)}K`], ["Used", `${budgetPct}%`]].map(([k, v]) => (
                                <div key={k} style={{ background: "#f8fafc", borderRadius: 8, padding: "5px 8px", textAlign: "center" }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: k === "Spent" && overBudget ? "#dc2626" : "#0f172a" }}>{v}</div>
                                    <div style={{ fontSize: 9, color: "#94a3b8" }}>{k}</div>
                                </div>
                            ))}
                        </div>
                        {overBudget && <div style={{ marginTop: 6, fontSize: 11, color: "#dc2626", fontWeight: 700 }}>⚠️ Over Budget</div>}
                    </div>
                );
            })}

            {showAdd && form && (
                <Modal title={form.id ? "Edit Project" : "Add Project"} onClose={() => setShowAdd(false)} onSave={saveForm} isDelete={!!form.id} onDelete={handleDelete}>
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Project Name *</div>
                        <input value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Project Lead</div>
                        <select value={form.lead || ""} onChange={e => setForm(f => ({ ...f, lead: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, background: "#fff" }}>
                            <option value="">-- Select Lead --</option>
                            {staff?.map(s => <option key={s.id} value={s.name}>{s.name} ({s.role})</option>)}
                        </select>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                        {[["Start Date", "start", "date"], ["End Date", "end", "date"]].map(([l, k, type]) => (
                            <div key={k}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>{l}</div>
                                <input type={type} value={form[k] || ""} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                            </div>
                        ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                        {[["Budget (₹)", "budget", "number"], ["Spent (₹)", "spent", "number"]].map(([l, k, type]) => (
                            <div key={k}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>{l}</div>
                                <input type={type} value={form[k] ?? ""} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                            </div>
                        ))}
                    </div>
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Progress % (0-100)</div>
                        <input type="number" min="0" max="100" value={form.progress ?? 0} onChange={e => setForm(f => ({ ...f, progress: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Priority</div>
                            <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, background: "#fff" }}>
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Status</div>
                            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, background: "#fff" }}>
                                <option value="planned">Planned</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="on-hold">On Hold</option>
                            </select>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
