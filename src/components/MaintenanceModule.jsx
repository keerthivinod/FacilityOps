import { useState } from "react";
import { cd, statusColor, SB, PD } from "@/lib/data";
import { Modal } from "./Modal";
import { api } from "@/lib/api";

export default function Mnt({ tasks, setTasks, showToast, staff, assets }) {
    const [tab, setTab] = useState("all");
    const [comp, setComp] = useState(null);
    const [remark, setRemark] = useState("");
    const [search, setSearch] = useState("");
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState(null);

    const tabs = [
        { k: "all", l: "All" },
        { k: "overdue", l: "Overdue" },
        { k: "due-soon", l: "Due Soon" },
        { k: "upcoming", l: "Upcoming" },
        { k: "completed", l: "Done" },
    ];

    const flt = tasks.filter((t) => {
        if (tab !== "all" && t.status !== tab) return false;
        if (search && !t.asset.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const done = (id) => {
        setTasks((p) => p.map((t) => (t.id === id ? { ...t, status: "completed", completedAt: new Date().toISOString().split("T")[0], remark } : t)));
        api.put("maintenance", id, { status: "completed", remarks: remark }).catch(() => {});
        showToast("Completed!");
        setComp(null);
        setRemark("");
    };

    const handleEdit = (task) => {
        setForm({ ...task });
        setShowAdd(true);
    };

    const handleAdd = () => {
        setForm({ asset: "", task: "", assignee: "", due: new Date().toISOString().split("T")[0], freq: "Monthly", priority: "medium", status: "upcoming", cat: "General", assetId: "" });
        setShowAdd(true);
    };

    const saveForm = async () => {
        if (!form.asset || !form.task) {
            showToast("Asset and Task description required", "error");
            return;
        }
        if (form.id) {
            setTasks((p) => p.map((t) => (t.id === form.id ? form : t)));
            api.put("maintenance", form.id, { status: form.status }).catch(() => {});
            showToast("Task updated");
        } else {
            const newTask = { ...form };
            try {
                const saved = await api.post("maintenance", { asset_id: form.assetId, task_description: form.task, due_date: form.due, priority: form.priority });
                newTask.id = saved.id;
            } catch {
                newTask.id = "M" + String(tasks.length + 1).padStart(3, "0");
            }
            setTasks((p) => [...p, newTask]);
            showToast("Task added");
        }
        setShowAdd(false);
    };

    const handleDelete = () => {
        if (!window.confirm("Delete this maintenance task?")) return;
        setTasks((p) => p.filter((t) => t.id !== form.id));
        api.del("maintenance", form.id).catch(() => {});
        setShowAdd(false);
        showToast("Task deleted");
    };

    const taskForComp = comp ? tasks.find((t) => t.id === comp) : null;

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Maintenance</div>
                <button onClick={handleAdd} style={{ background: "#4f46e5", color: "#fff", border: "none", borderRadius: 10, padding: "7px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    + Add Task
                </button>
            </div>

            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Search tasks/assets..." style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 12, padding: "10px 14px", fontSize: 13, outline: "none", marginBottom: 10, boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 12 }}>
                {tabs.map((t) => {
                    const c = t.k === "all" ? tasks.length : tasks.filter((x) => x.status === t.k).length;
                    return (
                        <button key={t.k} onClick={() => setTab(t.k)} style={{ padding: "5px 12px", borderRadius: 999, border: `1px solid ${tab === t.k ? "#4f46e5" : "#e5e7eb"}`, background: tab === t.k ? "#4f46e5" : "#fff", color: tab === t.k ? "#fff" : "#64748b", fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
                            {t.l} ({c})
                        </button>
                    );
                })}
            </div>

            {flt.map((t) => (
                <div key={t.id} style={{ ...cd({ marginBottom: 8, position: "relative" }), borderLeft: `4px solid ${statusColor(t.status)}`, background: t.status === "overdue" ? "#fffbfb" : t.status === "completed" ? "#f0fdf4" : "#fff" }}>
                    <button onClick={() => handleEdit(t)} style={{ position: "absolute", top: 10, right: 10, background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#4f46e5" }}>✏️ Edit</button>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 6, marginBottom: 4, paddingRight: 40 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", flex: 1 }}>{t.asset}</span>
                        <SB s={t.status} />
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>{t.task}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", fontSize: 10, color: "#94a3b8" }}>
                        <span>👤 {t.assignee}</span>
                        <span>📅 {t.due}</span>
                        <span>🔁 {t.freq}</span>
                        <span><PD p={t.priority} />{t.priority}</span>
                    </div>
                    {t.status !== "completed" && (
                        <button onClick={() => setComp(t.id)} style={{ marginTop: 8, padding: "6px 12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, color: "#16a34a", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                            ✓ Complete Task
                        </button>
                    )}
                    {t.completedAt && (
                        <div style={{ marginTop: 6, fontSize: 11, color: "#16a34a" }}>
                            ✅ {t.completedAt}
                            {t.remark && ` · "${t.remark}"`}
                        </div>
                    )}
                </div>
            ))}

            {showAdd && form && (
                <Modal title={form.id ? "Edit Task" : "Add Task"} onClose={() => setShowAdd(false)} onSave={saveForm} isDelete={!!form.id} onDelete={handleDelete}>
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Select Asset *</div>
                        <select value={form.asset} onChange={(e) => setForm({ ...form, asset: e.target.value })} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, background: "#fff" }}>
                            <option value="">-- Select Asset --</option>
                            {assets?.map((a) => (
                                <option key={a.id} value={a.name}>{a.name} ({a.code})</option>
                            ))}
                        </select>
                    </div>
                    {[["Task Description *", "task", "text"], ["Due Date", "due", "date"]].map(([l, k, type]) => (
                        <div key={k} style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>{l}</div>
                            <input type={type} value={form[k] || ""} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                        </div>
                    ))}
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Assignee</div>
                        <select value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, background: "#fff" }}>
                            <option value="">-- Select Staff --</option>
                            {staff?.filter(s => s.role !== "Facility Manager" && s.role !== "Facility Admin").map((s) => (
                                <option key={s.id} value={s.name}>{s.name} ({s.role})</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Frequency</div>
                            <select value={form.freq} onChange={(e) => setForm({ ...form, freq: e.target.value })} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, background: "#fff" }}>
                                <option value="Daily">Daily</option>
                                <option value="Weekly">Weekly</option>
                                <option value="Monthly">Monthly</option>
                                <option value="Quarterly">Quarterly</option>
                                <option value="Half-Yearly">Half-Yearly</option>
                                <option value="Yearly">Yearly</option>
                            </select>
                        </div>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Status</div>
                            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, background: "#fff" }}>
                                <option value="scheduled">Scheduled</option>
                                <option value="upcoming">Upcoming</option>
                                <option value="due-soon">Due Soon</option>
                                <option value="overdue">Overdue</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>
                </Modal>
            )}

            {comp && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 50, display: "flex", alignItems: "flex-end" }}>
                    <div style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: 20, width: "100%", maxWidth: 480, margin: "0 auto", animation: "slideUp .3s ease" }}>
                        <div style={{ width: 40, height: 4, background: "#e5e7eb", borderRadius: 2, margin: "0 auto 16px" }} />
                        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Complete Task</div>
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 14 }}>{taskForComp?.asset}</div>
                        <textarea value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Notes, parts used..." style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 12, padding: "10px 12px", fontSize: 12, height: 80, outline: "none", resize: "none", boxSizing: "border-box", marginBottom: 14 }} />
                        <div style={{ display: "flex", gap: 10 }}>
                            <button onClick={() => setComp(null)} style={{ flex: 1, padding: "11px", border: "1px solid #e5e7eb", borderRadius: 12, background: "#fff", fontSize: 13, cursor: "pointer", color: "#64748b" }}>Cancel</button>
                            <button onClick={() => done(comp)} style={{ flex: 2, padding: "11px", border: "none", borderRadius: 12, background: "#16a34a", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>✓ Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
