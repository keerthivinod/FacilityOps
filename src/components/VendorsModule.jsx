import { useState } from "react";
import { cd, SB } from "@/lib/data";
import { Modal } from "./Modal";
import { api } from "@/lib/api";

export default function Ven({ vendors, setVendors, showToast }) {
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState(null);

    const handleEdit = (vendor) => {
        setForm({ ...vendor });
        setShowAdd(true);
    };

    const handleAdd = () => {
        setForm({ name: "", contact: "", phone: "", email: "", cat: "General", amcEnd: "", amcVal: 0, status: "active", lastVisit: "" });
        setShowAdd(true);
    };

    const saveForm = async () => {
        if (!form.name) {
            showToast("Vendor name required", "error");
            return;
        }
        if (form.id) {
            setVendors((p) => p.map((v) => (v.id === form.id ? form : v)));
            api.put("vendors", form.id, { name: form.name, contact_person: form.contact, phone: form.phone, email: form.email, category: form.cat }).catch(() => {});
            showToast(form.name + " updated");
        } else {
            const newVendor = { ...form };
            try {
                const saved = await api.post("vendors", { name: form.name, contact_person: form.contact, phone: form.phone, email: form.email, category: form.cat });
                newVendor.id = saved.id;
            } catch {
                newVendor.id = "V" + String(vendors.length + 1).padStart(3, "0");
            }
            setVendors((p) => [...p, newVendor]);
            showToast(form.name + " added");
        }
        setShowAdd(false);
    };

    const handleDelete = () => {
        if (!window.confirm("Delete vendor " + form.name + "?")) return;
        setVendors((p) => p.filter((v) => v.id !== form.id));
        api.del("vendors", form.id).catch(() => {});
        setShowAdd(false);
        showToast("Vendor deleted");
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Vendors & AMC</div>
                <button onClick={handleAdd} style={{ background: "#4f46e5", color: "#fff", border: "none", borderRadius: 10, padding: "7px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    + Add
                </button>
            </div>
            {vendors.filter((v) => v.status === "expiring").length > 0 && (
                <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "10px 14px", marginBottom: 12, fontSize: 12, fontWeight: 700, color: "#d97706" }}>
                    ⏰ {vendors.filter((v) => v.status === "expiring").length} AMC expiring
                </div>
            )}
            {vendors.map((v) => (
                <div key={v.id} style={cd({ marginBottom: 8, borderColor: v.status === "expiring" ? "#fde68a" : "#e5e7eb", position: "relative" })}>
                    <button onClick={() => handleEdit(v)} style={{ position: "absolute", top: 10, right: 10, background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#4f46e5" }}>✏️ Edit</button>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, paddingRight: 40 }}>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>{v.name}</div>
                            <div style={{ fontSize: 11, color: "#94a3b8" }}>
                                {v.cat} · {v.contact}
                            </div>
                        </div>
                    </div>
                    <SB s={v.status} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 8px", fontSize: 11, color: "#64748b", marginTop: 8 }}>
                        <span>📞 {v.phone}</span>
                        <span>📅 {v.amcEnd || "No AMC"}</span>
                        <span>💰 ₹{(v.amcVal || 0).toLocaleString()}/yr</span>
                        <span>🔧 {v.lastVisit || "N/A"}</span>
                    </div>
                </div>
            ))}

            {showAdd && form && (
                <Modal title={form.id ? "Edit Vendor" : "Add Vendor"} onClose={() => setShowAdd(false)} onSave={saveForm} isDelete={!!form.id} onDelete={handleDelete}>
                    {[["Company Name *", "name", "text"], ["Contact Person", "contact", "text"], ["Phone", "phone", "text"], ["Email", "email", "email"], ["Category", "cat", "text"], ["AMC Value (₹)", "amcVal", "number"], ["AMC End Date", "amcEnd", "date"], ["Last Visit Date", "lastVisit", "date"]].map(([l, k, type]) => (
                        <div key={k} style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>{l}</div>
                            <input type={type} value={form[k] || ""} onChange={(e) => setForm((f) => ({ ...f, [k]: type === "number" ? Number(e.target.value) : e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                        </div>
                    ))}
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Status</div>
                        <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, background: "#fff" }}>
                            <option value="active">Active</option>
                            <option value="expiring">Expiring Soon</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>
                </Modal>
            )}
        </div>
    );
}
