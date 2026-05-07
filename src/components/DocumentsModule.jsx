import { useState } from "react";
import { cd, Badge } from "@/lib/data";
import { Modal } from "./Modal";

const TYPE_COLORS = {
    policy: ["#4f46e5", "#eff6ff"],
    amc: ["#d97706", "#fffbeb"],
    certificate: ["#dc2626", "#fef2f2"],
    inspection: ["#16a34a", "#f0fdf4"],
    log: ["#6b7280", "#f9fafb"],
};

function daysUntil(dateStr) {
    if (!dateStr) return null;
    const diff = Math.round((new Date(dateStr) - new Date()) / 86400000);
    return diff;
}

export default function Doc({ docs, setDocs, showToast }) {
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState(null);
    const [filter, setFilter] = useState("all");

    const expired = docs.filter(d => d.expired || (d.expiry && daysUntil(d.expiry) < 0));
    const expiring = docs.filter(d => !d.expired && d.expiry && daysUntil(d.expiry) >= 0 && daysUntil(d.expiry) <= 30);

    const handleAdd = () => {
        setForm({ name: "", type: "policy", expiry: "", size: "", expired: false });
        setShowAdd(true);
    };

    const handleEdit = (doc) => {
        setForm({ ...doc });
        setShowAdd(true);
    };

    const saveForm = () => {
        if (!form.name) { showToast("Document name required", "error"); return; }
        const isExpired = form.expired || (form.expiry && daysUntil(form.expiry) < 0);
        if (form.id) {
            setDocs(p => p.map(d => d.id === form.id ? { ...form, expired: isExpired } : d));
            showToast("Document updated");
        } else {
            const id = `D${String(docs.length + 1).padStart(3, "0")}`;
            const today = new Date().toISOString().split("T")[0];
            setDocs(p => [...p, { ...form, id, uploaded: today, expired: isExpired }]);
            showToast("Document added");
        }
        setShowAdd(false);
    };

    const handleDelete = () => {
        if (!window.confirm(`Delete document "${form.name}"?`)) return;
        setDocs(p => p.filter(d => d.id !== form.id));
        setShowAdd(false);
        showToast("Document deleted");
    };

    const flt = filter === "all" ? docs
        : filter === "expired" ? docs.filter(d => d.expired || (d.expiry && daysUntil(d.expiry) < 0))
        : filter === "expiring" ? docs.filter(d => !d.expired && d.expiry && daysUntil(d.expiry) >= 0 && daysUntil(d.expiry) <= 30)
        : docs.filter(d => d.type === filter);

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Documents</div>
                <button onClick={handleAdd} style={{ background: "#0891b2", color: "#fff", border: "none", borderRadius: 10, padding: "7px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    + Add Doc
                </button>
            </div>

            {expired.length > 0 && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "10px 14px", marginBottom: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#dc2626" }}>🚨 {expired.length} Expired Certificate{expired.length > 1 ? "s" : ""}</div>
                    {expired.map(d => <div key={d.id} style={{ fontSize: 11, color: "#991b1b" }}> {d.name}</div>)}
                </div>
            )}
            {expiring.length > 0 && (
                <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "10px 14px", marginBottom: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#d97706" }}>⚠️ {expiring.length} Expiring within 30 days</div>
                    {expiring.map(d => <div key={d.id} style={{ fontSize: 11, color: "#92400e" }}> {d.name}  {daysUntil(d.expiry)}d left</div>)}
                </div>
            )}

            <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 12 }}>
                {[["all", "All"], ["expired", "Expired"], ["expiring", "Expiring"], ["certificate", "Certs"], ["amc", "AMC"], ["policy", "Policy"]].map(([v, l]) => (
                    <button key={v} onClick={() => setFilter(v)} style={{ padding: "5px 12px", borderRadius: 999, border: `1px solid ${filter === v ? "#0891b2" : "#e5e7eb"}`, background: filter === v ? "#0891b2" : "#fff", color: filter === v ? "#fff" : "#64748b", fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                        {l}
                    </button>
                ))}
            </div>

            {flt.map(d => {
                const days = daysUntil(d.expiry);
                const isExpired = d.expired || (d.expiry && days < 0);
                const isExpiring = !isExpired && d.expiry && days <= 30;
                const [tc, tbg] = TYPE_COLORS[d.type] || ["#6b7280", "#f9fafb"];
                return (
                    <div key={d.id} style={{ ...cd({ marginBottom: 8, position: "relative" }), borderLeft: `4px solid ${isExpired ? "#dc2626" : isExpiring ? "#d97706" : "#e5e7eb"}` }}>
                        <button onClick={() => handleEdit(d)} style={{ position: "absolute", top: 10, right: 10, background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#4f46e5" }}>✏️ Edit</button>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6, paddingRight: 50 }}>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{d.name}</div>
                                <Badge label={d.type.toUpperCase()} color={tc} bg={tbg} />
                            </div>
                            {isExpired && <Badge label="EXPIRED" color="#dc2626" bg="#fef2f2" />}
                            {isExpiring && <Badge label={`${days}d left`} color="#d97706" bg="#fffbeb" />}
                        </div>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>
                            📁 {d.size || ""} &nbsp;·&nbsp; Uploaded: {d.uploaded}
                            {d.expiry && <> &nbsp;·&nbsp; Expires: {d.expiry}</>}
                        </div>
                    </div>
                );
            })}

            {showAdd && form && (
                <Modal title={form.id ? "Edit Document" : "Add Document"} onClose={() => setShowAdd(false)} onSave={saveForm} isDelete={!!form.id} onDelete={handleDelete}>
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Document Name *</div>
                        <input value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Type</div>
                        <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, background: "#fff" }}>
                            <option value="policy">Policy</option>
                            <option value="amc">AMC Contract</option>
                            <option value="certificate">Certificate</option>
                            <option value="inspection">Inspection Report</option>
                            <option value="log">Log / Report</option>
                        </select>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Expiry Date</div>
                            <input type="date" value={form.expiry || ""} onChange={e => setForm(f => ({ ...f, expiry: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                        </div>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>File Size</div>
                            <input value={form.size || ""} placeholder="e.g. 1.2 MB" onChange={e => setForm(f => ({ ...f, size: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <input type="checkbox" id="expiredChk" checked={!!form.expired} onChange={e => setForm(f => ({ ...f, expired: e.target.checked }))} style={{ width: 16, height: 16 }} />
                        <label htmlFor="expiredChk" style={{ fontSize: 12, color: "#64748b" }}>Mark as Expired</label>
                    </div>
                </Modal>
            )}
        </div>
    );
}
