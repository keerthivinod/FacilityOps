import { useState } from "react";
import { cd, SB } from "@/lib/data";
import { Modal } from "./Modal";

export default function Tm({ staff, setStaff, showToast }) {
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState(null);

    const TAT_BENCHMARKS = { plumber: 30, carpenter: 45, electrician: 25, it: 20, helper: 15 };

    const handleEdit = (member) => {
        setForm({ ...member, skills: member.skills.join(", ") });
        setShowAdd(true);
    };

    const handleAdd = () => {
        setForm({ name: "", role: "General", level: 1, phone: "", skills: "", icon: "👤", status: "available", tasksCompleted: 0, avgTAT: 0, rating: 0 });
        setShowAdd(true);
    };

    const saveForm = () => {
        if (!form.name || !form.role) {
            showToast("Name and Role required", "error");
            return;
        }
        const update = { ...form, skills: typeof form.skills === "string" ? form.skills.split(",").map((s) => s.trim()).filter(Boolean) : form.skills };
        if (form.id) {
            setStaff((p) => p.map((m) => (m.id === form.id ? update : m)));
            showToast(`${form.name} updated`);
        } else {
            const id = `S${String(staff.length + 1).padStart(2, "0")}`;
            setStaff((p) => [...p, { ...update, id }]);
            showToast(`${form.name} added`);
        }
        setShowAdd(false);
    };

    const handleDelete = () => {
        if (!window.confirm(`Delete staff member ${form.name}?`)) return;
        setStaff((p) => p.filter((m) => m.id !== form.id));
        setShowAdd(false);
        showToast("Staff deleted");
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Team & KRA</div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>{staff.length}-person team · TAT benchmarks</div>
                </div>
                <button onClick={handleAdd} style={{ background: "#4f46e5", color: "#fff", border: "none", borderRadius: 10, padding: "7px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    + Add Staff
                </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                {[["Available", staff.filter((s) => s.status === "available").length, "#16a34a"], ["Busy", staff.filter((s) => s.status === "busy").length, "#d97706"], ["Leave", staff.filter((s) => s.status === "on-leave").length, "#6b7280"]].map(([l, v, c]) => (
                    <div key={l} style={cd({ textAlign: "center" })}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: c }}>{v}</div>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>{l}</div>
                    </div>
                ))}
            </div>

            {staff.map((s) => {
                const bm = TAT_BENCHMARKS[s.role.toLowerCase().split(" ")[0]] || 30;
                const pct = s.avgTAT > 0 ? Math.min(100, Math.round((bm / s.avgTAT) * 100)) : 0;
                const perf = pct >= 90 ? "Excellent" : pct >= 70 ? "Good" : pct >= 50 ? "Average" : "Needs Work";
                const pc = pct >= 90 ? "#16a34a" : pct >= 70 ? "#2563eb" : pct >= 50 ? "#d97706" : "#dc2626";
                return (
                    <div key={s.id} style={cd({ marginBottom: 8, position: "relative" })}>
                        <button onClick={() => handleEdit(s)} style={{ position: "absolute", top: 10, right: 10, background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#4f46e5" }}>✏️ Edit</button>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: s.level === 1 && s.tasksCompleted > 0 ? 8 : 0 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: s.level === 1 ? "#eff6ff" : s.level === 2 ? "#fffbeb" : "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{s.icon}</div>
                            <div style={{ flex: 1, paddingRight: 40 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{s.name}</span>
                                    <SB s={s.status} />
                                </div>
                                <div style={{ fontSize: 11, color: "#64748b" }}>{s.role} · L{s.level} · {s.phone}</div>
                            </div>
                        </div>
                        {s.level === 1 && s.tasksCompleted > 0 && (
                            <div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
                                    {[["Tasks", s.tasksCompleted], ["TAT", `${s.avgTAT}m`], ["Bench", `${bm}m`], ["Rate", `${s.rating}/5`]].map(([k, v]) => (
                                        <div key={k} style={{ background: "#f8fafc", borderRadius: 8, padding: "5px 6px", textAlign: "center" }}>
                                            <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>{v}</div>
                                            <div style={{ fontSize: 8, color: "#94a3b8" }}>{k}</div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ flex: 1, height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                                        <div style={{ height: "100%", background: pc, borderRadius: 3, width: `${pct}%` }} />
                                    </div>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: pc }}>{perf}</span>
                                </div>
                            </div>
                        )}
                        {s.skills && s.skills.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 6 }}>
                                {s.skills.slice(0, 5).map((sk) => (
                                    <span key={sk} style={{ fontSize: 9, padding: "2px 6px", background: "#f1f5f9", borderRadius: 6, color: "#64748b" }}>{sk}</span>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}

            {showAdd && form && (
                <Modal title={form.id ? "Edit Staff" : "Add Staff"} onClose={() => setShowAdd(false)} onSave={saveForm} isDelete={!!form.id} onDelete={handleDelete}>
                    {[["Name *", "name", "text"], ["Role *", "role", "text"], ["Phone", "phone", "text"], ["Level (1=Tech, 2=Admin, 3=Manager)", "level", "number"], ["Icon (Emoji)", "icon", "text"], ["Skills (comma separated)", "skills", "text"]].map(([l, k, type]) => (
                        <div key={k} style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>{l}</div>
                            <input type={type} value={form[k] || ""} onChange={(e) => setForm((f) => ({ ...f, [k]: type === "number" ? Number(e.target.value) : e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                        </div>
                    ))}
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Status</div>
                        <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, background: "#fff" }}>
                            <option value="available">Available</option>
                            <option value="busy">Busy</option>
                            <option value="on-leave">On Leave</option>
                        </select>
                    </div>
                </Modal>
            )}
        </div>
    );
}
