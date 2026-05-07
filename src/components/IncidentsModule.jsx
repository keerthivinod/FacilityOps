import { useState } from "react";
import { cd, Badge } from "@/lib/data";
import { Modal } from "./Modal";

export default function Inc({ incidents, setIncidents, showToast }) {
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState(null);

    const S = { critical: "#dc2626", high: "#ea580c", medium: "#d97706", low: "#2563eb" };
    const SB2 = { critical: "#fef2f2", high: "#fff7ed", medium: "#fffbeb", low: "#eff6ff" };

    const handleEdit = (inc) => {
        setForm({ ...inc });
        setShowAdd(true);
    };

    const handleAdd = () => {
        setForm({ type: "", loc: "", sev: "medium", desc: "", by: "", rca: "", preventive: "" });
        setShowAdd(true);
    };

    const sub = () => {
        if (!form.type || !form.desc) {
            showToast("Fill type & desc", "error");
            return;
        }
        if (form.id) {
            setIncidents((p) => p.map((i) => (i.id === form.id ? form : i)));
            showToast("Incident updated");
        } else {
            setIncidents((p) => [{ id: `INC${String(p.length + 1).padStart(3, "0")}`, ...form, date: new Date().toISOString().split("T")[0], status: "open", rca: form.rca || "Pending investigation.", preventive: form.preventive }, ...p]);
            showToast("Incident Reported!");
        }
        setShowAdd(false);
    };

    const handleDelete = () => {
        if (!window.confirm(`Delete Incident ${form.id}?`)) return;
        setIncidents((p) => p.filter((i) => i.id !== form.id));
        setShowAdd(false);
        showToast("Incident deleted");
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 18, fontWeight: 800 }}>Incidents</div>
                <button onClick={handleAdd} style={{ background: "#ea580c", color: "#fff", border: "none", borderRadius: 10, padding: "7px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    + Report
                </button>
            </div>

            {incidents.map((i) => (
                <div key={i.id} style={{ ...cd({ marginBottom: 8, position: "relative" }), borderLeft: `4px solid ${S[i.sev]}` }}>
                    <button onClick={() => handleEdit(i)} style={{ position: "absolute", top: 10, right: 10, background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#4f46e5" }}>✏️ Edit</button>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, paddingRight: 40 }}>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>{i.type}</div>
                            <div style={{ fontSize: 11, color: "#94a3b8" }}>
                                📍 {i.loc} · {i.date}
                            </div>
                        </div>
                        <Badge label={i.sev.toUpperCase()} color={S[i.sev]} bg={SB2[i.sev]} />
                    </div>
                    <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.6, marginBottom: 6 }}>{i.desc}</div>
                    {i.rca && i.rca !== "Pending investigation." && (
                        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "8px 10px", marginBottom: 6 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "#2563eb" }}>Root Cause</div>
                            <div style={{ fontSize: 11, color: "#1e40af" }}>{i.rca}</div>
                        </div>
                    )}
                    {i.preventive && (
                        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "8px 10px" }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "#16a34a" }}>Preventive Measures</div>
                            <div style={{ fontSize: 11, color: "#166534" }}>{i.preventive}</div>
                        </div>
                    )}
                    {(!i.rca || i.rca === "Pending investigation.") && <div style={{ fontSize: 11, color: "#ea580c", fontWeight: 700 }}>⏳ RCA Pending</div>}
                </div>
            ))}

            {showAdd && form && (
                <Modal title={form.id ? "Edit Incident" : "Report Incident"} onClose={() => setShowAdd(false)} onSave={sub} isDelete={!!form.id} onDelete={handleDelete}>
                    {[["Type *", "type"], ["Location", "loc"], ["Reported By", "by"]].map(([l, k]) => (
                        <div key={k} style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 3 }}>{l}</div>
                            <input value={form[k] || ""} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                        </div>
                    ))}
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 3 }}>Description *</div>
                        <textarea value={form.desc || ""} onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", resize: "none", height: 70, boxSizing: "border-box" }} />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>Severity</div>
                        <select value={form.sev} onChange={(e) => setForm({ ...form, sev: e.target.value })} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, background: "#fff" }}>
                            <option value="critical">Critical</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>
                    {form.id && (
                        <>
                            <div style={{ marginBottom: 8 }}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 3 }}>Root Cause Analysis (RCA)</div>
                                <textarea value={form.rca || ""} onChange={(e) => setForm((f) => ({ ...f, rca: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", resize: "none", height: 50, boxSizing: "border-box", background: "#f8fafc" }} />
                            </div>
                            <div style={{ marginBottom: 8 }}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 3 }}>Preventive Measures</div>
                                <textarea value={form.preventive || ""} onChange={(e) => setForm((f) => ({ ...f, preventive: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", resize: "none", height: 50, boxSizing: "border-box", background: "#f8fafc" }} />
                            </div>
                        </>
                    )}
                </Modal>
            )}
        </div>
    );
}
