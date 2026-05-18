import { useState, useCallback } from "react";
import { verifyCredentials, saveSession } from "./auth.js";
export { ESCALATION_RULES, TAT_BENCHMARKS, autoRoute } from "./data-utils.js";

export const statusColor = s => ({ overdue: "#dc2626", "due-soon": "#d97706", healthy: "#16a34a", upcoming: "#2563eb", scheduled: "#7c3aed" }[s] || "#6b7280");
export const priorityColor = p => ({ critical: "#dc2626", high: "#ea580c", medium: "#d97706", low: "#2563eb" }[p] || "#6b7280");
export const PIE_COLORS = ["#16a34a", "#d97706", "#dc2626", "#6366f1"];
export const bs = (c, bg) => ({ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, color: c, background: bg, border: `1px solid ${c}22` });
export const cd = (x = {}) => ({ background: "#fff", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", border: "1px solid #e5e7eb", padding: 16, ...x });
export const Badge = ({ label, color, bg }) => <span style={bs(color, bg)}>{label}</span>;
export const SB = ({ s }) => { const m = { overdue: ["#dc2626", "#fef2f2"], "due-soon": ["#d97706", "#fffbeb"], healthy: ["#16a34a", "#f0fdf4"], upcoming: ["#2563eb", "#eff6ff"], scheduled: ["#7c3aed", "#f5f3ff"], open: ["#dc2626", "#fef2f2"], "in-progress": ["#d97706", "#fffbeb"], resolved: ["#16a34a", "#f0fdf4"], closed: ["#6b7280", "#f9fafb"], active: ["#16a34a", "#f0fdf4"], expiring: ["#d97706", "#fffbeb"], investigating: ["#d97706", "#fffbeb"], available: ["#16a34a", "#f0fdf4"], busy: ["#d97706", "#fffbeb"], "on-leave": ["#6b7280", "#f9fafb"], planned: ["#2563eb", "#eff6ff"] }; const [c, bg] = m[s] || ["#6b7280", "#f9fafb"]; return <Badge label={s === "due-soon" ? "Due Soon" : s === "in-progress" ? "In Progress" : s === "on-leave" ? "On Leave" : s.charAt(0).toUpperCase() + s.slice(1)} color={c} bg={bg} />; };
export const PD = ({ p }) => <span style={{ width: 8, height: 8, borderRadius: 4, background: priorityColor(p), display: "inline-block", marginRight: 4 }} />;
export const Spinner = () => <div style={{ width: 24, height: 24, border: "3px solid #e5e7eb", borderTop: "3px solid #4f46e5", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />;
export function QRCode({ data, size = 80 }) { const h = data.split("").reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0), 0); const cells = []; for (let y = 0; y < 9; y++)for (let x = 0; x < 9; x++) { if (((h * (x + 1) * (y + 1)) % 3) !== 0 || (x < 3 && y < 3) || (x > 5 && y < 3) || (x < 3 && y > 5)) cells.push(<rect key={`${x}-${y}`} x={x * 10 + 10} y={y * 10 + 10} width={9} height={9} fill="#0f172a" rx={1} />); } return <svg width={size} height={size} viewBox="0 0 100 110"><rect width="100" height="100" fill="#fff" rx={6} />{cells}<text x="50" y="108" textAnchor="middle" fontSize="6" fill="#94a3b8">{data}</text></svg>; }

export const LoginScreen = ({ onLogin }) => {
    const [ld, setLd] = useState(false);
    const [err, setErr] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = useCallback(async () => {
        if (!username.trim() || !password.trim()) {
            setErr("Please enter both username and password.");
            return;
        }
        setLd(true);
        setErr("");
        try {
            const { token, user } = await verifyCredentials(username.trim(), password);
            saveSession({ token, user });
            onLogin(user);
        } catch (e) {
            setErr(e.message || "Login failed.");
        } finally {
            setLd(false);
        }
    }, [username, password, onLogin]);

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleLogin();
        }
    };

    return (<div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1e1b4b,#312e81,#1e1b4b)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes slideUp{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}@keyframes toast{0%{opacity:0;transform:translateY(20px)}10%{opacity:1;transform:translateY(0)}90%{opacity:1}100%{opacity:0}}@keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}@keyframes esc{0%{box-shadow:0 0 0 0 rgba(220,38,38,.4)}70%{box-shadow:0 0 0 10px rgba(220,38,38,0)}100%{box-shadow:0 0 0 0 rgba(220,38,38,0)}}`}</style>
        <div style={{ width: "100%", maxWidth: 380, animation: "fadeIn .5s ease" }}><div style={{ textAlign: "center", marginBottom: 32 }}><div style={{ width: 72, height: 72, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 16px", boxShadow: "0 8px 24px rgba(99,102,241,.4)" }}>{"\u{1F3D7}️"}</div><div style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: -1 }}>FacilityOps</div><div style={{ color: "#a5b4fc", fontSize: 13, marginTop: 4 }}>Vaidyagrama Ayurveda Healing Village</div></div>
            <div style={{ background: "rgba(255,255,255,.08)", backdropFilter: "blur(12px)", borderRadius: 24, padding: 24, border: "1px solid rgba(255,255,255,.15)" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6, textAlign: "center" }}>Welcome back</div>
                <div style={{ fontSize: 12, color: "#a5b4fc", marginBottom: 24, textAlign: "center" }}>Sign in with your username and password to continue</div>
                {err && <div style={{ background: "rgba(220,38,38,.2)", border: "1px solid rgba(220,38,38,.3)", color: "#fca5a5", borderRadius: 10, padding: "10px 14px", fontSize: 12, marginBottom: 16, lineHeight: 1.5 }}>{err}</div>}
                <div style={{ marginBottom: 16 }}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={ld}
                        style={{
                            width: "100%",
                            padding: "12px 16px",
                            border: "1px solid rgba(255,255,255,.2)",
                            borderRadius: 12,
                            background: "rgba(255,255,255,.1)",
                            color: "#fff",
                            fontSize: 14,
                            outline: "none",
                            marginBottom: 12,
                            "::placeholder": { color: "#a5b4fc" }
                        }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={ld}
                        style={{
                            width: "100%",
                            padding: "12px 16px",
                            border: "1px solid rgba(255,255,255,.2)",
                            borderRadius: 12,
                            background: "rgba(255,255,255,.1)",
                            color: "#fff",
                            fontSize: 14,
                            outline: "none"
                        }}
                    />
                </div>
                {ld
                    ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: 13, color: "#a5b4fc" }}><Spinner /><span>Signing in...</span></div>
                    : <button
                        onClick={handleLogin}
                        disabled={ld}
                        style={{
                            width: "100%",
                            padding: "12px 16px",
                            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                            color: "#fff",
                            border: "none",
                            borderRadius: 12,
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: ld ? "default" : "pointer",
                            opacity: ld ? 0.6 : 1
                        }}
                    >
                        Sign In
                    </button>
                }
            </div></div></div>);
};

export const PAGES = [{ id: "dashboard", label: "Dashboard", icon: "\u{1F4CA}" }, { id: "assets", label: "Assets", icon: "\u{1F3D7}️" }, { id: "maintenance", label: "Maintenance", icon: "\u{1F527}" }, { id: "tickets", label: "Tickets", icon: "\u{1F6A8}" }, { id: "whatsapp", label: "WhatsApp Desk", icon: "\u{1F4AC}" }, { id: "escalation", label: "Escalation", icon: "⏫" }, { id: "team", label: "Team & KRA", icon: "\u{1F465}" }, { id: "vendors", label: "Vendors", icon: "\u{1F91D}" }, { id: "inventory", label: "Inventory", icon: "\u{1F4E6}" }, { id: "utilities", label: "Utilities", icon: "⚡" }, { id: "brain", label: "AI Brain", icon: "\u{1F9E0}" }, { id: "incidents", label: "Incidents", icon: "⚠️" }, { id: "projects", label: "Projects", icon: "\u{1F4D0}" }, { id: "documents", label: "Documents", icon: "\u{1F4C4}" }, { id: "reports", label: "Reports", icon: "\u{1F4C8}" }, { id: "notifications", label: "Alerts", icon: "\u{1F514}" }, { id: "settings", label: "Settings", icon: "⚙️" }];
export const BNAV = ["dashboard", "tickets", "whatsapp", "brain", "settings"];
