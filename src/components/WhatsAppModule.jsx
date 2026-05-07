import { useState, useRef, useEffect } from "react";
import { autoRoute } from "@/lib/data";
import { aiPrioritize, calculatePersonnel } from "./AIBrainModule";

function extractLocation(text) {
    const patterns = [
        /(?:illam|block|building|room|floor|wing|ward)\s*[\d\w\-]+(?:\s+(?:left|right|front|back|north|south|east|west)\s*(?:side)?)?/gi,
        /(?:opd|icu|ot|reception|kitchen|pharmacy|lab|store|parking|generator\s*room|pump\s*house|rooftop|corridor|entrance|lobby)\s*(?:block|area|room|wing)?/gi,
        /(?:main\s+block|block\s+[a-d])/gi
    ];
    const locations = [];
    for (const p of patterns) {
        const matches = text.match(p);
        if (matches) locations.push(...matches);
    }
    return locations.length > 0 ? locations[0].trim() : null;
}

const TEMPLATES = [
    "Illam 9 Left side pipe Leakage",
    "AC not cooling in OPD Block",
    "Elevator stuck in Main Block - patients inside",
    "Light not working in Room 12",
    "Water pressure low in Block B",
    "Generator making unusual noise and smoke",
    "CCTV camera 4 offline",
    "Kitchen boiler pressure issue"
];

export default function WhatsAppModule({ setTickets, showToast, staff = [] }) {
    const [msg, setMsg] = useState("");
    const [chat, setChat] = useState([
        { r: "system", t: "Welcome to FacilityOps WhatsApp Desk. Report any facility issue and I'll auto-create a ticket, assign the right technician(s), and notify them instantly.\n\nAI analyzes each report for guest/patient impact, safety risk, and complexity to set priority and allocate personnel.", time: "System" },
        { r: "user", t: "Illam 9 Left side pipe Leakage", time: "09:15 AM" },
        { r: "bot", t: null, ticket: { id: "T-WA001", issue: "Pipe Leakage", location: "Illam 9 Left side", priority: "high", assignee: "Rajesh M", role: "Plumber", status: "Ticket Created & Assigned", aiReasons: ["Affects guests/patients area"], personnel: { needsTwo: false, helper: null, reasons: [] } }, time: "09:15 AM" },
        { r: "notif", t: null, notif: { to: "Rajesh M", role: "Plumber", phone: "9876001001", message: "NEW TASK: Pipe Leakage at Illam 9 Left side", priority: "high" }, time: "09:15 AM" },
        { r: "user", t: "Elevator stuck in Main Block - 2 patients inside", time: "09:30 AM" },
        { r: "bot", t: null, ticket: { id: "T-WA002", issue: "Elevator stuck - 2 patients inside", location: "Main Block", priority: "critical", assignee: "Suresh P", role: "Electrician", status: "Ticket Created & Assigned", aiReasons: ["Potential safety/accident risk", "Affects guests/patients area", "Critical infrastructure asset"], personnel: { needsTwo: true, helper: { name: "Vinod R", role: "Helper" }, reasons: ["Emergency requires faster resolution"] } }, time: "09:30 AM" },
        { r: "notif", t: null, notif: { to: "Suresh P + Vinod R (Helper)", role: "Electrician + Helper", phone: "9876001004", message: "EMERGENCY: Elevator stuck with patients at Main Block", priority: "critical" }, time: "09:30 AM" }
    ]);
    const [showTemplates, setShowTemplates] = useState(false);
    const chatRef = useRef(null);

    useEffect(() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, [chat]);

    const send = (text) => {
        const m = (text || msg).trim();
        if (!m) return;
        const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
        const newChat = [...chat, { r: "user", t: m, time: now }];
        setChat(newChat);
        setMsg("");
        setShowTemplates(false);

        setTimeout(() => {
            const route = autoRoute(m);
            const location = extractLocation(m);
            const ticketId = `T${Date.now().toString().slice(-4)}`;
            const technicianInfo = staff.find(s => s.id === route.id) || {};

            // AI Priority Analysis
            const aiResult = aiPrioritize(m, location);
            const priority = aiResult.priority;

            // AI Personnel Allocation
            const personnel = calculatePersonnel(m, staff);

            const assigneeText = personnel.needsTwo && personnel.helper
                ? `${route.person} + ${personnel.helper.name} (Helper)`
                : route.person;

            const newTicket = {
                id: ticketId,
                asset: location ? `WhatsApp: ${location}` : "WhatsApp Request",
                problem: m,
                priority: priority,
                status: "open",
                by: "WhatsApp User",
                assignee: assigneeText,
                date: new Date().toISOString().split("T")[0],
                cost: null,
                loc: location || "Not specified",
                createdAt: new Date().toISOString(),
                startedAt: null,
                resolvedAt: null,
                escLevel: priority === "critical" ? 2 : 1,
                escLog: [
                    `${now} AI Priority: ${priority.toUpperCase()} (Score: ${aiResult.score}) - ${aiResult.reasons.join(", ")}`,
                    `${now} Auto-assigned to ${assigneeText} (${route.role}) via WhatsApp AI`,
                    ...(personnel.needsTwo ? [`${now} AI allocated 2-person team: ${personnel.reasons.join(", ")}`] : [])
                ],
                source: "whatsapp",
                tatMins: null,
                category: route.role
            };

            setTickets(prev => [newTicket, ...prev]);

            const botResponse = {
                r: "bot", t: null,
                ticket: {
                    id: ticketId, issue: m,
                    location: location || "Auto-detected",
                    priority: priority,
                    assignee: route.person, role: route.role,
                    status: "Ticket Created & Assigned",
                    aiReasons: aiResult.reasons,
                    personnel: personnel
                },
                time: now
            };

            const notifMsg = {
                r: "notif", t: null,
                notif: {
                    to: assigneeText,
                    role: personnel.needsTwo ? `${route.role} + Helper` : route.role,
                    phone: technicianInfo.phone || "N/A",
                    message: `${priority === "critical" ? "EMERGENCY" : "NEW TASK"}: ${m.substring(0, 60)}${m.length > 60 ? "..." : ""} at ${location || "facility"}`,
                    priority: priority
                },
                time: now
            };

            setChat(prev => [...prev, botResponse, notifMsg]);
            showToast(`Ticket ${ticketId} [${priority.toUpperCase()}] \u2192 ${assigneeText}`);
        }, 800);
    };

    const prioColor = { critical: "#dc2626", high: "#ea580c", medium: "#d97706", low: "#2563eb" };
    const prioLabel = { critical: "\u{1F534} CRITICAL", high: "\u{1F7E0} HIGH", medium: "\u{1F7E1} MEDIUM", low: "\u{1F535} LOW" };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 160px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>WhatsApp AI Desk</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>AI Priority {"\u2192"} Auto-assign {"\u2192"} Team Allocation {"\u2192"} Notify</div>
                </div>
                <div style={{ background: "#16a34a", color: "#fff", borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 700 }}>{"\u{1F7E2}"} Live</div>
            </div>

            <div ref={chatRef} style={{ flex: 1, overflowY: "auto", background: "#f0f2f5", borderRadius: 16, padding: 12, display: "flex", flexDirection: "column", gap: 10, marginBottom: 12, border: "1px solid #e5e7eb" }}>
                {chat.map((c, i) => {
                    if (c.r === "system") {
                        return (
                            <div key={i} style={{ background: "#fef9c3", borderRadius: 10, padding: "8px 12px", fontSize: 11, color: "#92400e", textAlign: "center", maxWidth: "90%", margin: "0 auto", lineHeight: 1.5 }}>
                                {c.t}
                            </div>
                        );
                    }
                    if (c.r === "user") {
                        return (
                            <div key={i} style={{ alignSelf: "flex-end", maxWidth: "85%" }}>
                                <div style={{ background: "#dcf8c6", color: "#0f172a", padding: "10px 14px", borderRadius: "16px 16px 4px 16px", fontSize: 13, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>{c.t}</div>
                                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3, textAlign: "right" }}>{c.time}</div>
                            </div>
                        );
                    }
                    if (c.r === "bot" && c.ticket) {
                        const tk = c.ticket;
                        return (
                            <div key={i} style={{ alignSelf: "flex-start", maxWidth: "90%" }}>
                                <div style={{ background: "#fff", borderRadius: "16px 16px 16px 4px", padding: 12, border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                        <span style={{ fontSize: 12, fontWeight: 800, color: "#16a34a" }}>{"\u2705"} {tk.status}</span>
                                        <span style={{ fontSize: 10, color: prioColor[tk.priority], fontWeight: 700, background: prioColor[tk.priority] + "15", padding: "2px 8px", borderRadius: 6 }}>{prioLabel[tk.priority]}</span>
                                    </div>
                                    <div style={{ background: "#f8fafc", borderRadius: 8, padding: 8, fontSize: 12, marginBottom: 6 }}>
                                        <div style={{ color: "#64748b", marginBottom: 4 }}><b>Ticket:</b> {tk.id}</div>
                                        <div style={{ color: "#64748b", marginBottom: 4 }}><b>Issue:</b> {tk.issue}</div>
                                        <div style={{ color: "#64748b", marginBottom: 4 }}><b>Location:</b> {tk.location}</div>
                                        <div style={{ color: "#64748b" }}><b>Assigned:</b> {tk.assignee} ({tk.role})</div>
                                    </div>
                                    {/* AI Priority Reasoning */}
                                    {tk.aiReasons && tk.aiReasons.length > 0 && (
                                        <div style={{ background: "#fefce8", borderRadius: 8, padding: 8, fontSize: 11, marginBottom: 6, border: "1px solid #fef08a" }}>
                                            <div style={{ fontWeight: 700, color: "#854d0e", marginBottom: 3 }}>{"\u{1F9E0}"} AI Priority Analysis:</div>
                                            {tk.aiReasons.map((r, ri) => (
                                                <div key={ri} style={{ color: "#92400e", paddingLeft: 8 }}>{"\u2022"} {r}</div>
                                            ))}
                                        </div>
                                    )}
                                    {/* Personnel Allocation */}
                                    {tk.personnel && tk.personnel.needsTwo && (
                                        <div style={{ background: "#f0fdf4", borderRadius: 8, padding: 8, fontSize: 11, border: "1px solid #bbf7d0" }}>
                                            <div style={{ fontWeight: 700, color: "#166534", marginBottom: 3 }}>{"\u{1F465}"} AI Team Allocation: 2-Person Team</div>
                                            <div style={{ color: "#15803d" }}>Primary: {tk.assignee} ({tk.role})</div>
                                            {tk.personnel.helper && <div style={{ color: "#15803d" }}>Helper: {tk.personnel.helper.name} ({tk.personnel.helper.role})</div>}
                                            {tk.personnel.reasons.map((r, ri) => (
                                                <div key={ri} style={{ color: "#166534", paddingLeft: 8, fontSize: 10 }}>{"\u2022"} {r}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>{c.time}</div>
                            </div>
                        );
                    }
                    if (c.r === "notif" && c.notif) {
                        const n = c.notif;
                        return (
                            <div key={i} style={{ alignSelf: "flex-start", maxWidth: "90%" }}>
                                <div style={{ background: "#eff6ff", borderRadius: 10, padding: 10, border: "1px solid #bfdbfe", fontSize: 11 }}>
                                    <div style={{ fontWeight: 700, color: "#1d4ed8", marginBottom: 4 }}>{"\u{1F4F2}"} Notification Sent</div>
                                    <div style={{ color: "#475569" }}><b>To:</b> {n.to} ({n.role}) - {n.phone}</div>
                                    <div style={{ color: "#475569", marginTop: 2 }}><b>Alert:</b> {n.message}</div>
                                    <div style={{ color: prioColor[n.priority], fontWeight: 700, marginTop: 4 }}>Priority: {n.priority.toUpperCase()}</div>
                                </div>
                            </div>
                        );
                    }
                    if (c.r === "bot") {
                        return (
                            <div key={i} style={{ alignSelf: "flex-start", maxWidth: "85%" }}>
                                <div style={{ background: "#fff", color: "#0f172a", padding: "10px 14px", borderRadius: "16px 16px 16px 4px", fontSize: 13, border: "1px solid #e5e7eb" }}>{c.t}</div>
                                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>{c.time}</div>
                            </div>
                        );
                    }
                    return null;
                })}
            </div>

            {showTemplates && (
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 8, marginBottom: 8, maxHeight: 180, overflowY: "auto" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 6, padding: "0 4px" }}>Quick Report Templates</div>
                    {TEMPLATES.map((t, i) => (
                        <button key={i} onClick={() => { setMsg(t); setShowTemplates(false); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 10px", background: "none", border: "none", borderBottom: i < TEMPLATES.length - 1 ? "1px solid #f1f5f9" : "none", fontSize: 12, color: "#0f172a", cursor: "pointer" }}>
                            {t}
                        </button>
                    ))}
                </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setShowTemplates(!showTemplates)} style={{ background: "#f1f5f9", border: "1px solid #e5e7eb", borderRadius: 12, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, flexShrink: 0 }}>{"\u{1F4CB}"}</button>
                <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Report an issue... e.g. Illam 9 pipe leaking" style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 12, padding: "10px 16px", fontSize: 13, outline: "none" }} />
                <button onClick={() => send()} style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: 12, width: 42, height: 42, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{"\u27A4"}</button>
            </div>
        </div>
    );
}
