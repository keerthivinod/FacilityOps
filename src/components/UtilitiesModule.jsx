import { useState } from "react";
import { cd } from "@/lib/data";
import { Modal } from "./Modal";

const DEFAULT_BUILDINGS = [
    { id: "B01", name: "Main Block", type: "building", icon: "\u{1F3E5}" },
    { id: "B02", name: "OPD Block", type: "building", icon: "\u{1F3E2}" },
    { id: "B03", name: "Kitchen Block", type: "building", icon: "\u{1F373}" },
    { id: "B04", name: "Staff Quarters", type: "building", icon: "\u{1F3E0}" },
    { id: "B05", name: "Illam 1-5", type: "building", icon: "\u{1F3E8}" },
    { id: "B06", name: "Illam 6-10", type: "building", icon: "\u{1F3E8}" },
    { id: "B07", name: "Yoga Hall", type: "building", icon: "\u{1F9D8}" },
    { id: "B08", name: "Admin Block", type: "building", icon: "\u{1F4BC}" },
];

const DEFAULT_EQUIPMENT = [
    { id: "E01", name: "Diesel Generator 125kVA", type: "equipment", icon: "\u26A1", buildingId: null },
    { id: "E02", name: "Solar PV 120kW", type: "equipment", icon: "\u2600\uFE0F", buildingId: null },
    { id: "E03", name: "Main Water Pump", type: "equipment", icon: "\u{1F4A7}", buildingId: null },
    { id: "E04", name: "RO Plant", type: "equipment", icon: "\u{1F4A7}", buildingId: null },
    { id: "E05", name: "AC Units (Central)", type: "equipment", icon: "\u2744\uFE0F", buildingId: "B02" },
    { id: "E06", name: "Kitchen Boiler", type: "equipment", icon: "\u{1F525}", buildingId: "B03" },
];

const METRICS = [
    { key: "grid", label: "Grid Power", unit: "kWh", color: "#d97706", bg: "#fffbeb" },
    { key: "solar", label: "Solar", unit: "kWh", color: "#16a34a", bg: "#f0fdf4" },
    { key: "water", label: "Water", unit: "KL", color: "#2563eb", bg: "#eff6ff" },
    { key: "diesel", label: "Diesel", unit: "L", color: "#6b7280", bg: "#f9fafb" },
];

function MiniBar({ value, max, color }) {
    const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
    return (
        <div style={{ height: 4, background: "#f1f5f9", borderRadius: 2, overflow: "hidden", marginTop: 4 }}>
            <div style={{ height: "100%", background: color, borderRadius: 2, width: `${pct}%` }} />
        </div>
    );
}

export default function Uti({ utilities, setUtilities, showToast }) {
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState(null);
    const [activeMetric, setActiveMetric] = useState("grid");
    const [view, setView] = useState("overview"); // overview, daily, buildings, equipment
    const [buildings, setBuildings] = useState(DEFAULT_BUILDINGS);
    const [equipment, setEquipment] = useState(DEFAULT_EQUIPMENT);
    const [dailyReadings, setDailyReadings] = useState([]);
    const [showBldgForm, setShowBldgForm] = useState(false);
    const [showEquipForm, setShowEquipForm] = useState(false);
    const [bldgForm, setBldgForm] = useState(null);
    const [equipForm, setEquipForm] = useState(null);
    const [showDailyForm, setShowDailyForm] = useState(false);
    const [dailyForm, setDailyForm] = useState(null);

    const handleAdd = () => { setForm({ m: "", grid: 0, solar: 0, water: 0, diesel: 0 }); setShowAdd(true); };
    const handleEdit = (entry) => { setForm({ ...entry }); setShowAdd(true); };

    const saveForm = () => {
        if (!form.m) { showToast("Month name required", "error"); return; }
        const cleaned = { ...form, grid: Number(form.grid), solar: Number(form.solar), water: Number(form.water), diesel: Number(form.diesel) };
        if (form.id) {
            setUtilities(p => p.map(u => u.id === form.id ? cleaned : u));
            showToast("Reading updated");
        } else {
            const id = `U${String(utilities.length + 1).padStart(3, "0")}`;
            setUtilities(p => [...p, { ...cleaned, id }]);
            showToast("Reading added");
        }
        setShowAdd(false);
    };

    const handleDelete = () => {
        if (!window.confirm(`Delete reading for "${form.m}"?`)) return;
        setUtilities(p => p.filter(u => u.id !== form.id));
        setShowAdd(false); showToast("Reading deleted");
    };

    // Building CRUD
    const saveBldg = () => {
        if (!bldgForm.name) { showToast("Name required", "error"); return; }
        if (bldgForm.id && buildings.find(b => b.id === bldgForm.id)) {
            setBuildings(p => p.map(b => b.id === bldgForm.id ? bldgForm : b));
            showToast("Building updated");
        } else {
            const id = `B${String(buildings.length + 1).padStart(2, "0")}`;
            setBuildings(p => [...p, { ...bldgForm, id, type: "building" }]);
            showToast("Building added");
        }
        setShowBldgForm(false);
    };
    const deleteBldg = () => {
        if (!window.confirm(`Delete ${bldgForm.name}?`)) return;
        setBuildings(p => p.filter(b => b.id !== bldgForm.id));
        setShowBldgForm(false); showToast("Building deleted");
    };

    // Equipment CRUD
    const saveEquip = () => {
        if (!equipForm.name) { showToast("Name required", "error"); return; }
        if (equipForm.id && equipment.find(e => e.id === equipForm.id)) {
            setEquipment(p => p.map(e => e.id === equipForm.id ? equipForm : e));
            showToast("Equipment updated");
        } else {
            const id = `E${String(equipment.length + 1).padStart(2, "0")}`;
            setEquipment(p => [...p, { ...equipForm, id, type: "equipment" }]);
            showToast("Equipment added");
        }
        setShowEquipForm(false);
    };
    const deleteEquip = () => {
        if (!window.confirm(`Delete ${equipForm.name}?`)) return;
        setEquipment(p => p.filter(e => e.id !== equipForm.id));
        setShowEquipForm(false); showToast("Equipment deleted");
    };

    // Daily reading
    const saveDailyReading = () => {
        if (!dailyForm.date) { showToast("Date required", "error"); return; }
        const cleaned = { ...dailyForm, grid: Number(dailyForm.grid || 0), solar: Number(dailyForm.solar || 0), water: Number(dailyForm.water || 0), diesel: Number(dailyForm.diesel || 0) };
        if (dailyForm.id) {
            setDailyReadings(p => p.map(d => d.id === dailyForm.id ? cleaned : d));
            showToast("Daily reading updated");
        } else {
            const id = `DR${Date.now().toString().slice(-6)}`;
            setDailyReadings(p => [{ ...cleaned, id }, ...p]);
            showToast("Daily reading added");
        }
        setShowDailyForm(false);
    };

    const metric = METRICS.find(m => m.key === activeMetric);
    const maxVal = Math.max(...utilities.map(u => u[activeMetric] || 0), 1);
    const latest = utilities[utilities.length - 1];
    const prev = utilities[utilities.length - 2];

    const tabs = [
        { id: "overview", label: "Monthly Overview" },
        { id: "daily", label: "Daily Input" },
        { id: "buildings", label: "Buildings" },
        { id: "equipment", label: "Equipment" },
    ];

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{"\u26A1"} Energy & Utilities</div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, overflowX: "auto", marginBottom: 14 }}>
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setView(t.id)} style={{ padding: "6px 14px", borderRadius: 999, border: `1px solid ${view === t.id ? "#4f46e5" : "#e5e7eb"}`, background: view === t.id ? "#4f46e5" : "#fff", color: view === t.id ? "#fff" : "#64748b", fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{t.label}</button>
                ))}
            </div>

            {/* ========== MONTHLY OVERVIEW ========== */}
            {view === "overview" && (
                <div>
                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
                        <button onClick={handleAdd} style={{ background: "#0891b2", color: "#fff", border: "none", borderRadius: 10, padding: "7px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Add Monthly Reading</button>
                    </div>
                    {latest && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                            {METRICS.map(m => {
                                const val = latest[m.key];
                                const prevVal = prev?.[m.key];
                                const diff = prevVal ? Math.round(((val - prevVal) / prevVal) * 100) : null;
                                return (
                                    <div key={m.key} style={{ ...cd({ padding: 12 }), border: `1px solid ${m.bg === "#f9fafb" ? "#e5e7eb" : m.color + "33"}`, background: m.bg }}>
                                        <div style={{ fontSize: 10, color: m.color, fontWeight: 700, marginBottom: 2 }}>{m.label} ({latest.m})</div>
                                        <div style={{ fontSize: 20, fontWeight: 800, color: m.color }}>{val.toLocaleString()}</div>
                                        <div style={{ fontSize: 9, color: "#94a3b8" }}>{m.unit}{diff !== null && <span style={{ color: diff > 0 ? "#dc2626" : "#16a34a", fontWeight: 700 }}> {diff > 0 ? "\u25B2" : "\u25BC"}{Math.abs(diff)}% vs {prev.m}</span>}</div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 12 }}>
                        {METRICS.map(m => (
                            <button key={m.key} onClick={() => setActiveMetric(m.key)} style={{ padding: "5px 12px", borderRadius: 999, border: `1px solid ${activeMetric === m.key ? m.color : "#e5e7eb"}`, background: activeMetric === m.key ? m.color : "#fff", color: activeMetric === m.key ? "#fff" : "#64748b", fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>{m.label}</button>
                        ))}
                    </div>
                    <div style={cd({ marginBottom: 14, padding: 14 })}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>{metric.label} ({metric.unit}) Monthly</div>
                        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
                            {utilities.map((u, i) => {
                                const h = maxVal > 0 ? Math.max(4, Math.round((u[activeMetric] / maxVal) * 72)) : 4;
                                return (
                                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                                        <div style={{ fontSize: 8, color: "#94a3b8" }}>{u[activeMetric]?.toLocaleString()}</div>
                                        <div style={{ width: "100%", height: h, background: metric.color, borderRadius: "3px 3px 0 0", opacity: i === utilities.length - 1 ? 1 : 0.5 }} />
                                        <div style={{ fontSize: 9, color: "#64748b", fontWeight: 600 }}>{u.m}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>All Readings</div>
                    {[...utilities].reverse().map((u, i) => (
                        <div key={u.id || i} style={{ ...cd({ marginBottom: 8, padding: 12, position: "relative" }) }}>
                            <button onClick={() => handleEdit(u)} style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#4f46e5" }}>{"\u270F\uFE0F"} Edit</button>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 8, paddingRight: 40 }}>{u.m}</div>
                            {METRICS.map(m => (
                                <div key={m.key} style={{ marginBottom: 6 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94a3b8" }}>
                                        <span>{m.label}</span>
                                        <span style={{ fontWeight: 600, color: m.color }}>{u[m.key]?.toLocaleString()} {m.unit}</span>
                                    </div>
                                    <MiniBar value={u[m.key]} max={maxVal} color={m.color} />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}

            {/* ========== DAILY INPUT ========== */}
            {view === "daily" && (
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>Daily Energy Readings</div>
                        <button onClick={() => { setDailyForm({ date: new Date().toISOString().split("T")[0], buildingId: "all", grid: "", solar: "", water: "", diesel: "", notes: "" }); setShowDailyForm(true); }} style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: 10, padding: "7px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Add Today&apos;s Reading</button>
                    </div>

                    {dailyReadings.length === 0 ? (
                        <div style={cd({ textAlign: "center", padding: "32px 16px" })}>
                            <div style={{ fontSize: 36, marginBottom: 8 }}>{"\u{1F4CA}"}</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>No Daily Readings Yet</div>
                            <div style={{ fontSize: 12, color: "#64748b" }}>Tap &quot;Add Today&apos;s Reading&quot; to start recording daily energy consumption data.</div>
                        </div>
                    ) : (
                        dailyReadings.map(d => (
                            <div key={d.id} style={{ ...cd({ marginBottom: 8, padding: 12, position: "relative" }) }}>
                                <button onClick={() => { setDailyForm({ ...d }); setShowDailyForm(true); }} style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#4f46e5" }}>{"\u270F\uFE0F"}</button>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>{d.date}</div>
                                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>{d.buildingId === "all" ? "Entire Campus" : buildings.find(b => b.id === d.buildingId)?.name || d.buildingId}</div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
                                    {METRICS.map(m => (
                                        <div key={m.key} style={{ background: m.bg, borderRadius: 8, padding: "6px 8px", textAlign: "center" }}>
                                            <div style={{ fontSize: 9, color: m.color, fontWeight: 600 }}>{m.label}</div>
                                            <div style={{ fontSize: 13, fontWeight: 800, color: m.color }}>{d[m.key] || 0}</div>
                                            <div style={{ fontSize: 8, color: "#94a3b8" }}>{m.unit}</div>
                                        </div>
                                    ))}
                                </div>
                                {d.notes && <div style={{ fontSize: 11, color: "#475569", marginTop: 6, fontStyle: "italic" }}>{d.notes}</div>}
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* ========== BUILDINGS ========== */}
            {view === "buildings" && (
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>Campus Buildings ({buildings.length})</div>
                        <button onClick={() => { setBldgForm({ name: "", icon: "\u{1F3E2}", type: "building" }); setShowBldgForm(true); }} style={{ background: "#4f46e5", color: "#fff", border: "none", borderRadius: 10, padding: "7px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Add Building</button>
                    </div>
                    {buildings.map(b => {
                        const bEquip = equipment.filter(e => e.buildingId === b.id);
                        const bReadings = dailyReadings.filter(d => d.buildingId === b.id);
                        const totalGrid = bReadings.reduce((s, d) => s + (d.grid || 0), 0);
                        return (
                            <div key={b.id} style={{ ...cd({ marginBottom: 8, padding: 14 }) }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <div style={{ fontSize: 24 }}>{b.icon}</div>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{b.name}</div>
                                            <div style={{ fontSize: 11, color: "#94a3b8" }}>{bEquip.length} equipment {"\u00B7"} {bReadings.length} readings</div>
                                        </div>
                                    </div>
                                    <button onClick={() => { setBldgForm({ ...b }); setShowBldgForm(true); }} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: "4px 10px", fontSize: 11, color: "#4f46e5", fontWeight: 700, cursor: "pointer" }}>{"\u270F\uFE0F"}</button>
                                </div>
                                {totalGrid > 0 && <div style={{ fontSize: 11, color: "#d97706", fontWeight: 600 }}>Total Grid: {totalGrid} kWh recorded</div>}
                                {bEquip.length > 0 && (
                                    <div style={{ marginTop: 6 }}>
                                        {bEquip.map(e => (
                                            <div key={e.id} style={{ fontSize: 11, color: "#475569", padding: "2px 0" }}>{e.icon} {e.name}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ========== EQUIPMENT ========== */}
            {view === "equipment" && (
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>Equipment ({equipment.length})</div>
                        <button onClick={() => { setEquipForm({ name: "", icon: "\u26A1", type: "equipment", buildingId: "" }); setShowEquipForm(true); }} style={{ background: "#4f46e5", color: "#fff", border: "none", borderRadius: 10, padding: "7px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Add Equipment</button>
                    </div>
                    {equipment.map(e => {
                        const bldg = buildings.find(b => b.id === e.buildingId);
                        return (
                            <div key={e.id} style={{ ...cd({ marginBottom: 8, padding: 12 }) }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <div style={{ fontSize: 20 }}>{e.icon}</div>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{e.name}</div>
                                            <div style={{ fontSize: 11, color: "#94a3b8" }}>{bldg ? bldg.name : "Campus-wide"}</div>
                                        </div>
                                    </div>
                                    <button onClick={() => { setEquipForm({ ...e }); setShowEquipForm(true); }} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: "4px 10px", fontSize: 11, color: "#4f46e5", fontWeight: 700, cursor: "pointer" }}>{"\u270F\uFE0F"}</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* --- Modals --- */}
            {showAdd && form && (
                <Modal title={form.id ? "Edit Reading" : "Add Monthly Reading"} onClose={() => setShowAdd(false)} onSave={saveForm} isDelete={!!form.id} onDelete={handleDelete}>
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Month *</div>
                        <input value={form.m || ""} placeholder="e.g. Apr" onChange={e => setForm(f => ({ ...f, m: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                    </div>
                    {METRICS.map(m => (
                        <div key={m.key} style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>{m.label} ({m.unit})</div>
                            <input type="number" value={form[m.key] ?? ""} onChange={e => setForm(f => ({ ...f, [m.key]: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                        </div>
                    ))}
                </Modal>
            )}

            {showBldgForm && bldgForm && (
                <Modal title={bldgForm.id ? "Edit Building" : "Add Building"} onClose={() => setShowBldgForm(false)} onSave={saveBldg} isDelete={!!bldgForm.id} onDelete={deleteBldg}>
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Building Name *</div>
                        <input value={bldgForm.name || ""} onChange={e => setBldgForm(f => ({ ...f, name: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Icon</div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {["\u{1F3E5}", "\u{1F3E2}", "\u{1F3E0}", "\u{1F3E8}", "\u{1F373}", "\u{1F9D8}", "\u{1F4BC}", "\u{1F3EB}", "\u{1F3ED}", "\u26EA"].map(ic => (
                                <button key={ic} onClick={() => setBldgForm(f => ({ ...f, icon: ic }))} style={{ width: 36, height: 36, fontSize: 20, borderRadius: 8, border: bldgForm.icon === ic ? "2px solid #4f46e5" : "1px solid #e5e7eb", background: bldgForm.icon === ic ? "#eff6ff" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{ic}</button>
                            ))}
                        </div>
                    </div>
                </Modal>
            )}

            {showEquipForm && equipForm && (
                <Modal title={equipForm.id ? "Edit Equipment" : "Add Equipment"} onClose={() => setShowEquipForm(false)} onSave={saveEquip} isDelete={!!equipForm.id} onDelete={deleteEquip}>
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Equipment Name *</div>
                        <input value={equipForm.name || ""} onChange={e => setEquipForm(f => ({ ...f, name: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Building</div>
                        <select value={equipForm.buildingId || ""} onChange={e => setEquipForm(f => ({ ...f, buildingId: e.target.value || null }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, background: "#fff", boxSizing: "border-box" }}>
                            <option value="">Campus-wide (No building)</option>
                            {buildings.map(b => <option key={b.id} value={b.id}>{b.icon} {b.name}</option>)}
                        </select>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Icon</div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {["\u26A1", "\u2600\uFE0F", "\u{1F4A7}", "\u2744\uFE0F", "\u{1F525}", "\u{1F6B0}", "\u{1F50C}", "\u{1F4A1}", "\u2699\uFE0F"].map(ic => (
                                <button key={ic} onClick={() => setEquipForm(f => ({ ...f, icon: ic }))} style={{ width: 36, height: 36, fontSize: 20, borderRadius: 8, border: equipForm.icon === ic ? "2px solid #4f46e5" : "1px solid #e5e7eb", background: equipForm.icon === ic ? "#eff6ff" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{ic}</button>
                            ))}
                        </div>
                    </div>
                </Modal>
            )}

            {showDailyForm && dailyForm && (
                <Modal title={dailyForm.id ? "Edit Daily Reading" : "Add Daily Reading"} onClose={() => setShowDailyForm(false)} onSave={saveDailyReading} isDelete={!!dailyForm.id} onDelete={() => { setDailyReadings(p => p.filter(d => d.id !== dailyForm.id)); setShowDailyForm(false); showToast("Deleted"); }}>
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Date *</div>
                        <input type="date" value={dailyForm.date || ""} onChange={e => setDailyForm(f => ({ ...f, date: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Building / Area</div>
                        <select value={dailyForm.buildingId || "all"} onChange={e => setDailyForm(f => ({ ...f, buildingId: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, background: "#fff", boxSizing: "border-box" }}>
                            <option value="all">Entire Campus</option>
                            {buildings.map(b => <option key={b.id} value={b.id}>{b.icon} {b.name}</option>)}
                        </select>
                    </div>
                    {METRICS.map(m => (
                        <div key={m.key} style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>{m.label} ({m.unit})</div>
                            <input type="number" value={dailyForm[m.key] ?? ""} onChange={e => setDailyForm(f => ({ ...f, [m.key]: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                        </div>
                    ))}
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Notes</div>
                        <textarea value={dailyForm.notes || ""} onChange={e => setDailyForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any observations..." rows={2} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }} />
                    </div>
                </Modal>
            )}
        </div>
    );
}
