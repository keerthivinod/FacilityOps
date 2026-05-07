import { useState } from "react";
import { cd } from "@/lib/data";
import { Modal } from "./Modal";
import { api } from "@/lib/api";

export default function Inv({ inventory, setInventory, showToast }) {
    const [adj, setAdj] = useState(null);
    const [qty, setQty] = useState(1);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState(null);

    const low = inventory.filter((i) => i.qty <= i.min);
    const go = (id, d) => {
        setInventory((p) => p.map((i) => (i.id === id ? { ...i, qty: Math.max(0, i.qty + d) } : i)));
        api.put("inventory", id, { delta: d }).catch(() => {});
        showToast(d > 0 ? "+" + d : "-" + Math.abs(d));
        setAdj(null);
    };

    const handleEdit = (item) => {
        setForm({ ...item });
        setShowAdd(true);
    };

    const handleAdd = () => {
        setForm({ name: "", qty: 1, min: 1, unit: "pcs", vendor: "", cost: 0, loc: "" });
        setShowAdd(true);
    };

    const saveForm = async () => {
        if (!form.name) {
            showToast("Item name required", "error");
            return;
        }
        if (form.id) {
            setInventory((p) => p.map((i) => (i.id === form.id ? form : i)));
            api.put("inventory", form.id, { quantity: form.qty }).catch(() => {});
            showToast(form.name + " updated");
        } else {
            const newItem = { ...form };
            try {
                const saved = await api.post("inventory", { name: form.name, quantity: form.qty, minimum_stock: form.min, unit: form.unit, unit_cost: form.cost, storage_location: form.loc });
                newItem.id = saved.id;
            } catch {
                newItem.id = "I" + String(inventory.length + 1).padStart(3, "0");
            }
            setInventory((p) => [...p, newItem]);
            showToast(form.name + " added");
        }
        setShowAdd(false);
    };

    const handleDelete = () => {
        if (!window.confirm("Delete item " + form.name + "?")) return;
        setInventory((p) => p.filter((i) => i.id !== form.id));
        api.del("inventory", form.id).catch(() => {});
        setShowAdd(false);
        showToast("Item deleted");
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Inventory</div>
                <button onClick={handleAdd} style={{ background: "#4f46e5", color: "#fff", border: "none", borderRadius: 10, padding: "7px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    + Add Item
                </button>
            </div>

            {low.length > 0 && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "10px 14px", marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#dc2626" }}>🚨 {low.length} Below Min</div>
                    {low.map((i) => (
                        <div key={i.id} style={{ fontSize: 11, color: "#991b1b" }}> {i.name}: {i.qty}/{i.min}</div>
                    ))}
                </div>
            )}

            {inventory.map((i) => {
                const ok = i.qty > i.min;
                const pct = Math.min(100, Math.round((i.qty / Math.max(i.min * 2, 1)) * 100));
                return (
                    <div key={i.id} style={cd({ marginBottom: 8, borderColor: !ok ? "#fecaca" : "#e5e7eb", position: "relative" })}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                                    {i.name}
                                    <button onClick={() => handleEdit(i)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#4f46e5", padding: 0 }}>✏️</button>
                                </div>
                                <div style={{ fontSize: 10, color: "#94a3b8" }}>{i.vendor} · ₹{i.cost}/{i.unit} · 📍{i.loc}</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <span style={{ fontSize: 22, fontWeight: 800, color: ok ? "#16a34a" : "#dc2626" }}>{i.qty}</span>
                                <span style={{ fontSize: 10, color: "#94a3b8" }}>/{i.min}</span>
                            </div>
                        </div>
                        <div style={{ height: 4, background: "#f1f5f9", borderRadius: 2, marginBottom: 8, overflow: "hidden" }}>
                            <div style={{ height: "100%", background: ok ? "#16a34a" : "#dc2626", borderRadius: 2, width: `${pct}%` }} />
                        </div>
                        {adj === i.id ? (
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 10px", fontSize: 12, outline: "none" }} />
                                <button onClick={() => go(i.id, qty)} style={{ padding: "6px 10px", background: "#16a34a", border: "none", borderRadius: 8, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>+</button>
                                <button onClick={() => go(i.id, -qty)} style={{ padding: "6px 10px", background: "#dc2626", border: "none", borderRadius: 8, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>-</button>
                                <button onClick={() => setAdj(null)} style={{ padding: "6px 10px", background: "#f1f5f9", border: "none", borderRadius: 8, fontSize: 11, cursor: "pointer" }}>✕</button>
                            </div>
                        ) : (
                            <button onClick={() => { setAdj(i.id); setQty(1); }} style={{ padding: "5px 12px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, color: "#2563eb", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>± Adjust</button>
                        )}
                    </div>
                );
            })}

            {showAdd && form && (
                <Modal title={form.id ? "Edit Item" : "Add Item"} onClose={() => setShowAdd(false)} onSave={saveForm} isDelete={!!form.id} onDelete={handleDelete}>
                    {[["Item Name *", "name", "text"], ["Vendor", "vendor", "text"], ["Location", "loc", "text"], ["Unit (e.g., pcs, L)", "unit", "text"], ["Current Qty", "qty", "number"], ["Min Alert Qty", "min", "number"], ["Cost per unit (₹)", "cost", "number"]].map(([l, k, type]) => (
                        <div key={k} style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>{l}</div>
                            <input type={type} value={form[k] || ""} onChange={(e) => setForm((f) => ({ ...f, [k]: type === "number" ? Number(e.target.value) : e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                        </div>
                    ))}
                </Modal>
            )}
        </div>
    );
}
