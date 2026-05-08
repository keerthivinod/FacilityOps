import { useState, useMemo } from "react";
import { cd, SB, QRCode } from "@/lib/data";
import { Modal } from "./Modal";
import { api } from "@/lib/api";

export default function Ast({ assets, setAssets, showToast }) {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [detail, setDetail] = useState(null);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState(null);
    const [showScanner, setShowScanner] = useState(false);
    const [scanInput, setScanInput] = useState("");
    const [scanResult, setScanResult] = useState(null);
    const [repairLog, setRepairLog] = useState({ notes: "", action: "inspection", status: "completed" });
    const [scanLogs, setScanLogs] = useState([]);

    // ⚡ Bolt Optimization: Memoized filter array and extracted lowercase conversion
    // Prevents re-computing filter on every render, and avoids repetitive toLowerCase() inside O(n) loop
    const flt = useMemo(() => {
        const query = search ? search.toLowerCase() : "";
        return assets.filter((a) => {
            if (filter !== "all" && a.status !== filter && a.cat !== filter) return false;
            if (query && !a.name.toLowerCase().includes(query) && !a.loc.toLowerCase().includes(query)) return false;
            return true;
        });
    }, [assets, filter, search]);

    const handleEdit = (asset) => { setForm({ ...asset }); setShowAdd(true); };
    const handleAdd = () => { setForm({ name: "", cat: "Power", loc: "", model: "", vendor: "", interval: 90, status: "healthy", icon: "\u{1F527}" }); setShowAdd(true); };

    const saveForm = async () => {
        if (!form.name) { showToast("Name required", "error"); return; }
        if (form.id) {
            setAssets((p) => p.map((a) => (a.id === form.id ? form : a)));
            api.put("assets", form.id, { last_service_date: form.last }).catch(() => {});
            showToast(`${form.name} updated`);
        } else {
            const newAsset = { ...form, last: new Date().toISOString().split("T")[0], next: "", amc: false, serial: "", critical: false };
            try {
                const saved = await api.post("assets", { code: form.code || ("A" + String(assets.length + 1).padStart(3, "0")), name: form.name, model: form.model, service_interval_days: form.interval });
                newAsset.id = saved.id;
                newAsset.code = form.code || ("A" + String(assets.length + 1).padStart(3, "0"));
                newAsset.qr = "FO-" + newAsset.code;
            } catch {
                const id = "A" + String(assets.length + 1).padStart(3, "0");
                newAsset.id = id; newAsset.code = id; newAsset.qr = "FO-" + id;
            }
            setAssets((p) => [...p, newAsset]);
            showToast(`${form.name} added`);
        }
        setShowAdd(false);
        setDetail(form.id || null);
    };

    const handleDelete = () => {
        if (!window.confirm(`Delete ${form.name}?`)) return;
        setAssets((p) => p.filter((a) => a.id !== form.id));
        api.del("assets", form.id).catch(() => {});
        setShowAdd(false); setDetail(null);
        showToast("Asset deleted");
    };

    const handleScan = (code) => {
        const qr = code.trim().toUpperCase();
        const found = assets.find(a => (a.qr || "").toUpperCase() === qr || (a.code || "").toUpperCase() === qr || a.id.toUpperCase() === qr);
        if (found) {
            setScanResult(found);
            setRepairLog({ notes: "", action: "inspection", status: "completed" });
            showToast(`Asset found: ${found.name}`);
        } else {
            showToast("No asset found for this QR code", "error");
        }
    };

    const submitRepairLog = () => {
        if (!repairLog.notes.trim()) { showToast("Add repair notes", "error"); return; }
        const log = {
            id: `SL${Date.now().toString().slice(-6)}`,
            assetId: scanResult.id, assetName: scanResult.name,
            action: repairLog.action, notes: repairLog.notes, status: repairLog.status,
            by: "Technician", time: new Date().toLocaleString("en-IN"), timestamp: Date.now()
        };
        setScanLogs(prev => [log, ...prev]);
        if (repairLog.status === "completed") {
            const today = new Date().toISOString().split("T")[0];
            setAssets(prev => prev.map(a => a.id === scanResult.id ? { ...a, status: "healthy", last: today } : a));
            api.put("assets", scanResult.id, { last_service_date: today }).catch(() => {});
        }
        showToast(`Repair logged for ${scanResult.name}`);
        setScanResult(null); setShowScanner(false); setScanInput("");
    };

    const getAssetHistory = (assetId) => {
        const assetScans = scanLogs.filter(l => l.assetId === assetId);
        return { scans: assetScans };
    };

    // --- QR Scan Result: Repair Log Form ---
    if (scanResult) {
        const hist = getAssetHistory(scanResult.id);
        return (
            <div>
                <button onClick={() => { setScanResult(null); setShowScanner(true); }} style={{ fontSize: 13, color: "#4f46e5", background: "none", border: "none", cursor: "pointer", fontWeight: 600, padding: 0, marginBottom: 12 }}>{"\u2190"} Back to Scanner</button>

                <div style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", borderRadius: 16, padding: 16, color: "#fff", marginBottom: 12 }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                        <div style={{ fontSize: 36 }}>{scanResult.icon}</div>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 800 }}>{scanResult.name}</div>
                            <div style={{ fontSize: 12, opacity: .8 }}>{scanResult.code} {"\u00B7"} {scanResult.loc}</div>
                            <div style={{ fontSize: 11, opacity: .7 }}>Last Service: {scanResult.last || "N/A"}</div>
                        </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                        {[["Status", scanResult.status], ["Vendor", scanResult.vendor || "N/A"], ["AMC", scanResult.amc ? "Active" : "No"]].map(([k, v]) => (
                            <div key={k} style={{ background: "rgba(255,255,255,.15)", borderRadius: 8, padding: "6px 8px", textAlign: "center" }}>
                                <div style={{ fontSize: 9, opacity: .7 }}>{k}</div>
                                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "capitalize" }}>{v}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={cd({ marginBottom: 12 })}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>{"\u{1F4DD}"} Log Repair / Maintenance</div>
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Action Type</div>
                        <select value={repairLog.action} onChange={e => setRepairLog(p => ({ ...p, action: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, background: "#fff", boxSizing: "border-box" }}>
                            <option value="inspection">Inspection</option>
                            <option value="repair">Repair</option>
                            <option value="replacement">Part Replacement</option>
                            <option value="cleaning">Cleaning</option>
                            <option value="calibration">Calibration</option>
                            <option value="emergency">Emergency Fix</option>
                        </select>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Outcome</div>
                        <select value={repairLog.status} onChange={e => setRepairLog(p => ({ ...p, status: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, background: "#fff", boxSizing: "border-box" }}>
                            <option value="completed">Completed - Asset Healthy</option>
                            <option value="partial">Partial - Needs Follow-up</option>
                            <option value="escalated">Escalated - Vendor Required</option>
                        </select>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Notes *</div>
                        <textarea value={repairLog.notes} onChange={e => setRepairLog(p => ({ ...p, notes: e.target.value }))} placeholder="Describe work done, parts used, observations..." rows={3} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }} />
                    </div>
                    <button onClick={submitRepairLog} style={{ width: "100%", padding: 12, background: "#16a34a", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                        {"\u2705"} Submit Repair Log
                    </button>
                </div>

                {hist.scans.length > 0 && (
                    <div style={cd()}>
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{"\u{1F4CB}"} Recent Scan Logs</div>
                        {hist.scans.slice(0, 5).map(l => (
                            <div key={l.id} style={{ padding: "8px 0", borderBottom: "1px solid #f1f5f9", fontSize: 12 }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ fontWeight: 600, textTransform: "capitalize" }}>{l.action}</span>
                                    <span style={{ color: "#94a3b8", fontSize: 10 }}>{l.time}</span>
                                </div>
                                <div style={{ color: "#475569", marginTop: 2 }}>{l.notes}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // --- QR Scanner View ---
    if (showScanner) {
        return (
            <div>
                <button onClick={() => setShowScanner(false)} style={{ fontSize: 13, color: "#4f46e5", background: "none", border: "none", cursor: "pointer", fontWeight: 600, padding: 0, marginBottom: 12 }}>{"\u2190"} Back to Assets</button>
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                    <div style={{ fontSize: 48, marginBottom: 8 }}>{"\u{1F4F7}"}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>QR Code Scanner</div>
                    <div style={{ fontSize: 13, color: "#64748b" }}>Scan asset QR code to auto-populate details</div>
                </div>
                <div style={cd({ marginBottom: 16 })}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Enter QR Code</div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <input value={scanInput} onChange={e => setScanInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleScan(scanInput)} placeholder="e.g. FO-A001-GEN or A001" style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                        <button onClick={() => handleScan(scanInput)} style={{ background: "#4f46e5", color: "#fff", border: "none", borderRadius: 10, padding: "0 16px", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>Scan</button>
                    </div>
                </div>
                <div style={cd({ marginBottom: 16 })}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Quick Select Asset</div>
                    <div style={{ maxHeight: 300, overflowY: "auto" }}>
                        {assets.map(a => (
                            <div key={a.id} onClick={() => handleScan(a.qr || a.code)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f1f5f9", cursor: "pointer" }}>
                                <QRCode data={a.qr || a.code} size={32} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</div>
                                    <div style={{ fontSize: 10, color: "#94a3b8" }}>{a.qr || a.code} {"\u00B7"} {a.loc}</div>
                                </div>
                                <SB s={a.status} />
                            </div>
                        ))}
                    </div>
                </div>
                {scanLogs.length > 0 && (
                    <div style={cd()}>
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{"\u{1F4CB}"} Today&apos;s Scan History</div>
                        {scanLogs.slice(0, 10).map(l => (
                            <div key={l.id} style={{ padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                                    <span style={{ fontWeight: 600 }}>{l.assetName}</span>
                                    <span style={{ color: l.status === "completed" ? "#16a34a" : "#d97706", fontSize: 10, fontWeight: 700, textTransform: "capitalize" }}>{l.status}</span>
                                </div>
                                <div style={{ fontSize: 11, color: "#64748b" }}>{l.action} {"\u00B7"} {l.time}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // --- Asset Detail View ---
    if (detail) {
        const a = assets.find((x) => x.id === detail);
        if (!a) return null;
        const hist = getAssetHistory(a.id);
        return (
            <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <button onClick={() => setDetail(null)} style={{ fontSize: 13, color: "#4f46e5", background: "none", border: "none", cursor: "pointer", fontWeight: 600, padding: 0 }}>{"\u2190"} Back</button>
                    <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => { setScanResult(a); setRepairLog({ notes: "", action: "inspection", status: "completed" }); setDetail(null); }} style={{ fontSize: 12, background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", padding: "4px 12px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>{"\u{1F4F7}"} Log Repair</button>
                        <button onClick={() => handleEdit(a)} style={{ fontSize: 12, background: "#f1f5f9", color: "#475569", border: "none", padding: "4px 12px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>{"\u270F\uFE0F"} Edit</button>
                    </div>
                </div>
                <div style={cd({ marginBottom: 12 })}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                        <div>
                            <div style={{ fontSize: 28, marginBottom: 4 }}>{a.icon}</div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{a.name}</div>
                            <div style={{ fontSize: 12, color: "#94a3b8" }}>{a.code} {"\u00B7"} {a.loc}</div>
                        </div>
                        <SB s={a.status} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#f8fafc", borderRadius: 12, padding: 12, marginBottom: 12 }}>
                        <QRCode data={a.qr || a.code} />
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>{"\u{1F4F1}"} Scan QR for instant history</div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>Code: {a.qr}</div>
                            <div style={{ fontSize: 10, color: "#4f46e5", fontWeight: 600, marginTop: 4 }}>Technicians scan after repair</div>
                        </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {[["Model", a.model], ["Serial", a.serial], ["Category", a.cat], ["Vendor", a.vendor], ["Installed", a.install], ["Warranty", a.warranty || ""], ["Last Service", a.last], ["Interval", `${a.interval}d`], ["AMC", a.amc ? "\u2705" : "\u274C"]].map(([k, v]) => (
                            <div key={k} style={{ background: "#f8fafc", borderRadius: 10, padding: "8px 10px" }}>
                                <div style={{ fontSize: 10, color: "#94a3b8" }}>{k}</div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>{v || ""}</div>
                            </div>
                        ))}
                    </div>
                </div>
                {hist.scans.length > 0 && (
                    <div style={cd()}>
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{"\u{1F4CB}"} Repair Log History</div>
                        {hist.scans.map(l => (
                            <div key={l.id} style={{ padding: "8px 0", borderBottom: "1px solid #f1f5f9", fontSize: 12 }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ fontWeight: 600, textTransform: "capitalize" }}>{l.action}</span>
                                    <span style={{ color: "#94a3b8", fontSize: 10 }}>{l.time}</span>
                                </div>
                                <div style={{ color: "#475569", marginTop: 2 }}>{l.notes}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // --- Assets List View ---
    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Assets ({flt.length})</div>
                <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => setShowScanner(true)} style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: 10, padding: "7px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>{"\u{1F4F7}"} Scan QR</button>
                    <button onClick={handleAdd} style={{ background: "#4f46e5", color: "#fff", border: "none", borderRadius: 10, padding: "7px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Add</button>
                </div>
            </div>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={"\u{1F50D} Search..."} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 12, padding: "10px 14px", fontSize: 13, outline: "none", marginBottom: 10, boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 12 }}>
                {[["all", "All"], ["overdue", "Overdue"], ["due-soon", "Due Soon"], ["healthy", "Healthy"]].map(([v, l]) => (
                    <button key={v} onClick={() => setFilter(v)} style={{ padding: "5px 12px", borderRadius: 999, border: `1px solid ${filter === v ? "#4f46e5" : "#e5e7eb"}`, background: filter === v ? "#4f46e5" : "#fff", color: filter === v ? "#fff" : "#64748b", fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{l}</button>
                ))}
            </div>
            {flt.map((a) => (
                <div key={a.id} className="card-hover" onClick={() => setDetail(a.id)} style={{ ...cd({ cursor: "pointer", marginBottom: 8 }), borderColor: a.status === "overdue" ? "#fecaca" : "#e5e7eb" }}>
                    <div style={{ display: "flex", gap: 10 }}>
                        <div style={{ fontSize: 24 }}>{a.icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</div>
                                <SB s={a.status} />
                            </div>
                            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{a.loc} {"\u00B7"} {a.vendor}</div>
                        </div>
                    </div>
                </div>
            ))}

            {showAdd && form && (
                <Modal title={form.id ? "Edit Asset" : "Add Asset"} onClose={() => setShowAdd(false)} onSave={saveForm} isDelete={!!form.id} onDelete={handleDelete}>
                    {[["Name *", "name"], ["Model", "model"], ["Location", "loc"], ["Vendor", "vendor"]].map(([l, k]) => (
                        <div key={k} style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>{l}</div>
                            <input value={form[k] || ""} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                        </div>
                    ))}
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Category</div>
                        <select value={form.cat} onChange={e => setForm(f => ({ ...f, cat: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, background: "#fff", boxSizing: "border-box" }}>
                            {["Power", "Plumbing", "HVAC", "Mechanical", "Vehicle", "Security", "Water", "IT"].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Status</div>
                        <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, background: "#fff", boxSizing: "border-box" }}>
                            <option value="healthy">Healthy</option>
                            <option value="due-soon">Due Soon</option>
                            <option value="overdue">Overdue</option>
                        </select>
                    </div>
                </Modal>
            )}
        </div>
    );
}
