import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";

// AI requests go through the Cloud Function via Firebase Hosting rewrite.
// The OpenAI API key lives ONLY in server-side environment variables — never in this file.


const SUGGESTED_QUERIES = [
    "What is the root cause of the elevator incidents?",
    "Show total maintenance cost analysis",
    "Which assets need immediate attention?",
    "What preventive measures should we take for power failures?",
    "Who is the best performing technician?",
    "Analyze all open tickets and suggest priority actions",
    "What is the incident trend this quarter?",
    "Which vendors have expiring AMCs?",
    "Give me a cost breakdown of all incidents",
    "What accountability measures are needed?"
];

// --- Smart Priority Engine ---
const GUEST_PATIENT_KEYWORDS = ["patient", "guest", "visitor", "opd", "ward", "icu", "ot", "surgery", "treatment", "therapy", "room", "illam", "block b", "block c", "reception", "lobby", "corridor"];
const ACCIDENT_RISK_KEYWORDS = ["stuck", "fire", "smoke", "sparking", "electrocution", "collapse", "flooding", "gas leak", "entrapment", "slip", "fall", "short circuit", "exposed wire", "broken glass", "sharp", "toxic", "sewage overflow", "no railing", "crack in wall"];
const CRITICAL_ASSET_KEYWORDS = ["elevator", "lift", "generator", "transformer", "boiler", "fire system", "ambulance", "water pump", "oxygen", "medical gas"];
const COMFORT_IMPACT_KEYWORDS = ["not cooling", "no ac", "hot", "no water", "no power", "dark", "smell", "noise", "mosquito", "pest"];

function aiPrioritize(text, location) {
    const t = (text + " " + (location || "")).toLowerCase();
    let score = 0;
    let reasons = [];

    // Patient/Guest impact (highest weight)
    const guestHit = GUEST_PATIENT_KEYWORDS.some(k => t.includes(k));
    if (guestHit) { score += 40; reasons.push("Affects guests/patients area"); }

    // Accident/Safety risk
    const accidentHit = ACCIDENT_RISK_KEYWORDS.some(k => t.includes(k));
    if (accidentHit) { score += 50; reasons.push("Potential safety/accident risk"); }

    // Critical asset
    const criticalHit = CRITICAL_ASSET_KEYWORDS.some(k => t.includes(k));
    if (criticalHit) { score += 30; reasons.push("Critical infrastructure asset"); }

    // Comfort impact
    const comfortHit = COMFORT_IMPACT_KEYWORDS.some(k => t.includes(k));
    if (comfortHit) { score += 15; reasons.push("Guest comfort impacted"); }

    // Multiple areas
    if (t.includes("all") || t.includes("entire") || t.includes("whole building") || t.includes("campus")) {
        score += 20; reasons.push("Wide area affected");
    }

    // Time sensitivity
    if (t.includes("since morning") || t.includes("since yesterday") || t.includes("hours") || t.includes("repeated") || t.includes("again")) {
        score += 10; reasons.push("Prolonged/recurring issue");
    }

    let priority;
    if (score >= 60) priority = "critical";
    else if (score >= 35) priority = "high";
    else if (score >= 15) priority = "medium";
    else priority = "low";

    return { priority, score, reasons };
}

// --- Personnel Allocation Engine ---
const TWO_PERSON_KEYWORDS = ["heavy", "shift", "move", "install", "replace", "height", "roof", "ceiling", "ladder", "overhead", "transformer", "generator", "boiler", "panel", "main line", "trenching", "excavat", "pump replacement", "motor", "compressor"];

function calculatePersonnel(text, staff = []) {
    const t = text.toLowerCase();
    let needsTwo = false;
    let reasons = [];

    if (TWO_PERSON_KEYWORDS.some(k => t.includes(k))) {
        needsTwo = true;
        reasons.push("Task involves heavy/elevated/complex work");
    }
    if (t.includes("emergency") || t.includes("urgent") || t.includes("critical")) {
        needsTwo = true;
        reasons.push("Emergency requires faster resolution");
    }
    if (t.includes("electrical") && (t.includes("main") || t.includes("panel") || t.includes("high voltage"))) {
        needsTwo = true;
        reasons.push("Electrical safety requires 2-person team");
    }

    let helper = null;
    if (needsTwo) {
        const helpers = staff.filter(s => s.role === "Helper" && s.status === "available");
        helper = helpers.length > 0 ? helpers[0] : staff.find(s => s.role === "Helper") || null;
    }

    return { needsTwo, helper, reasons };
}

function buildContext(P) {
    const openTickets = [];
    const resolvedTickets = [];
    const criticalTickets = [];
    let totalCost = 0;
    let tatSum = 0;
    let tatCount = 0;

    for (let i = 0; i < P.tickets.length; i++) {
        const t = P.tickets[i];
        if (t.status === "open" || t.status === "in-progress") openTickets.push(t);
        else if (t.status === "resolved" || t.status === "closed") resolvedTickets.push(t);

        if (t.priority === "critical") criticalTickets.push(t);
        if (t.cost) totalCost += t.cost;
        if (t.tatMins) {
            tatSum += t.tatMins;
            tatCount++;
        }
    }
    const avgTAT = tatCount > 0 ? tatSum / tatCount : 0;

    const overdueAssets = [];
    for (let i = 0; i < P.assets.length; i++) {
        if (P.assets[i].status === "overdue") overdueAssets.push(P.assets[i]);
    }

    const overdueTasks = [];
    for (let i = 0; i < P.tasks.length; i++) {
        if (P.tasks[i].status === "overdue") overdueTasks.push(P.tasks[i]);
    }

    return `You are FacilityOps AI Brain for Vaidyagrama Ayurveda Healing Village - a healthcare facility.

IMPORTANT FORMATTING RULES:
- Do NOT use markdown asterisks for bold. Instead write plain text with clear section headers.
- Use numbered lists (1. 2. 3.) and bullet points (-)
- Use ALL CAPS for section headers
- Use emoji icons for visual structure
- Keep responses clear and scannable

CURRENT FACILITY DATA:
TICKETS (${P.tickets.length} total):
${P.tickets.map(t => `- [${t.id}] ${t.asset}: "${t.problem}" | Priority: ${t.priority} | Status: ${t.status} | Assigned: ${t.assignee || "Unassigned"} | Cost: ${t.cost ? "Rs." + t.cost : "N/A"} | TAT: ${t.tatMins ? t.tatMins + "min" : "Pending"} | Source: ${t.source || "app"} | Location: ${t.loc || "N/A"}`).join("\n")}

ASSETS (${P.assets.length} total):
${P.assets.map(a => `- [${a.id}] ${a.name} | Location: ${a.loc} | Status: ${a.status} | Category: ${a.cat} | Vendor: ${a.vendor} | AMC: ${a.amc ? "Active" : "No"} | Last Service: ${a.last} | Interval: ${a.interval}d`).join("\n")}

MAINTENANCE TASKS (${P.tasks.length} total):
${P.tasks.map(t => `- [${t.id}] ${t.asset}: ${t.task} | Assignee: ${t.assignee} | Due: ${t.due} | Status: ${t.status} | Priority: ${t.priority}`).join("\n")}

INCIDENTS (${P.incidents.length} total):
${P.incidents.map(i => `- [${i.id}] ${i.type} at ${i.loc} | Severity: ${i.sev} | Status: ${i.status} | RCA: ${i.rca || "Pending"} | Preventive: ${i.preventive || "None"} | Desc: ${i.desc}`).join("\n")}

STAFF (${P.staff.length} members):
${P.staff.map(s => `- ${s.name} (${s.role}) | Tasks: ${s.tasksCompleted} | Avg TAT: ${s.avgTAT}min | Rating: ${s.rating} | Status: ${s.status}`).join("\n")}

VENDORS:
${P.vendors.map(v => `- ${v.name} (${v.cat}) | AMC End: ${v.amcEnd} | AMC Value: Rs.${v.amcVal} | Status: ${v.status}`).join("\n")}

INVENTORY:
${P.inventory.map(i => `- ${i.name}: ${i.qty}/${i.min} ${i.unit} | Cost: Rs.${i.cost} | ${i.qty < i.min ? "LOW STOCK" : "OK"}`).join("\n")}

SUMMARY:
- Open Tickets: ${openTickets.length}, Critical: ${criticalTickets.length}, Resolved: ${resolvedTickets.length}
- Overdue Assets: ${overdueAssets.length}, Overdue Tasks: ${overdueTasks.length}
- Total Cost: Rs.${totalCost}, Average TAT: ${Math.round(avgTAT)} min

Always provide: 1) Root cause analysis 2) Cost implications 3) Preventive measures 4) Accountability 5) Actionable recommendations`;
}

function generateLocalResponse(query, P) {
    const q = query.toLowerCase();

    const openTickets = [];
    const criticalTickets = [];
    let totalCost = 0;

    for (let i = 0; i < P.tickets.length; i++) {
        const t = P.tickets[i];
        if (t.status === "open" || t.status === "in-progress") openTickets.push(t);
        if (t.priority === "critical") criticalTickets.push(t);
        if (t.cost) totalCost += t.cost;
    }

    const overdueAssets = [];
    for (let i = 0; i < P.assets.length; i++) {
        if (P.assets[i].status === "overdue") overdueAssets.push(P.assets[i]);
    }

    const overdueTasks = [];
    for (let i = 0; i < P.tasks.length; i++) {
        if (P.tasks[i].status === "overdue") overdueTasks.push(P.tasks[i]);
    }

    const lowStock = [];
    for (let i = 0; i < P.inventory.length; i++) {
        if (P.inventory[i].qty < P.inventory[i].min) lowStock.push(P.inventory[i]);
    }

    const expiringAMC = [];
    for (let i = 0; i < P.vendors.length; i++) {
        if (P.vendors[i].status === "expiring") expiringAMC.push(P.vendors[i]);
    }

    if (q.includes("root cause") || q.includes("elevator") || q.includes("incident")) {
        return { sections: [
            { icon: "\u{1F50D}", title: "ROOT CAUSE ANALYSIS - INCIDENTS", content: null },
            ...P.incidents.map(i => ({
                title: `${i.type} (${i.id}) at ${i.loc}`,
                items: [
                    `Severity: ${i.sev.toUpperCase()}`,
                    `RCA: ${i.rca || "Investigation pending"}`,
                    `Preventive: ${i.preventive || "To be determined"}`,
                    `Status: ${i.status}`
                ]
            })),
            { icon: "\u{1F4CB}", title: "RECOMMENDATIONS", items: [
                "Complete pending investigations immediately",
                "Implement all preventive measures listed",
                "Schedule monthly safety audits",
                "Review vendor SLAs for critical equipment"
            ]}
        ]};
    }
    if (q.includes("cost") || q.includes("expense") || q.includes("budget")) {
        const byCategory = {};
        P.tickets.filter(t => t.cost).forEach(t => { const c = t.category || "Other"; byCategory[c] = (byCategory[c] || 0) + t.cost; });
        return { sections: [
            { icon: "\u{1F4B0}", title: "COST ANALYSIS", items: [`Total Repair Cost: Rs.${totalCost.toLocaleString()}`] },
            { title: "By Category", items: Object.entries(byCategory).map(([k, v]) => `${k}: Rs.${v.toLocaleString()}`) },
            { title: "AMC Investments", items: P.vendors.map(v => `${v.name}: Rs.${v.amcVal.toLocaleString()}/year (${v.status})`) },
            { content: `Total AMC: Rs.${P.vendors.reduce((s, v) => s + v.amcVal, 0).toLocaleString()}/year` },
            { icon: "\u{1F4CB}", title: "RECOMMENDATIONS", items: [
                "Prioritize AMC renewals for expiring contracts",
                "Budget for preventive maintenance to reduce emergency costs",
                "Track cost per asset for ROI analysis"
            ]}
        ]};
    }
    if (q.includes("attention") || q.includes("priority") || q.includes("urgent") || q.includes("action")) {
        return { sections: [
            { icon: "\u{1F6A8}", title: "IMMEDIATE ATTENTION REQUIRED" },
            { title: `Critical Tickets (${criticalTickets.length})`, items: criticalTickets.map(t => `${t.asset}: ${t.problem} [${t.status}]`), empty: "None" },
            { title: `Overdue Assets (${overdueAssets.length})`, items: overdueAssets.map(a => `${a.name} at ${a.loc} (Last: ${a.last})`) },
            { title: `Overdue Tasks (${overdueTasks.length})`, items: overdueTasks.map(t => `${t.asset}: ${t.task} (Due: ${t.due})`) },
            { title: `Low Inventory (${lowStock.length})`, items: lowStock.map(i => `${i.name}: ${i.qty}/${i.min} ${i.unit}`) },
            { title: `Expiring AMCs (${expiringAMC.length})`, items: expiringAMC.map(v => `${v.name}: expires ${v.amcEnd}`) }
        ]};
    }
    if (q.includes("technician") || q.includes("staff") || q.includes("perform") || q.includes("best")) {
        const sorted = [...P.staff].filter(s => s.tasksCompleted > 0).sort((a, b) => b.rating - a.rating);
        return { sections: [
            { icon: "\u{1F465}", title: "STAFF PERFORMANCE ANALYSIS" },
            ...sorted.map((s, i) => ({
                title: `${i + 1}. ${s.name} (${s.role})`,
                items: [`Tasks: ${s.tasksCompleted} | Avg TAT: ${s.avgTAT}min | Rating: \u2B50${s.rating} | Status: ${s.status}`]
            })),
            { icon: "\u{1F3C6}", title: "TOP PERFORMER", content: `${sorted[0]?.name} with ${sorted[0]?.rating} rating` },
            { icon: "\u{1F4CB}", title: "RECOMMENDATIONS", items: [
                "Recognize top performers",
                "Provide training for lower-rated staff",
                "Balance workload distribution",
                "Set TAT improvement targets"
            ]}
        ]};
    }
    if (q.includes("vendor") || q.includes("amc")) {
        return { sections: [
            { icon: "\u{1F91D}", title: "VENDOR & AMC ANALYSIS" },
            ...P.vendors.map(v => ({
                title: `${v.name} (${v.cat})`,
                items: [
                    `AMC: Rs.${v.amcVal.toLocaleString()} | Expires: ${v.amcEnd} | Status: ${v.status}`,
                    `Last Visit: ${v.lastVisit} | Contact: ${v.contact} (${v.phone})`
                ]
            })),
            { icon: "\u26A0\uFE0F", title: "ACTION REQUIRED", items: expiringAMC.length > 0 ? expiringAMC.map(v => `RENEW: ${v.name} AMC expiring ${v.amcEnd}`) : ["All AMCs current"] },
            { content: `Total AMC Investment: Rs.${P.vendors.reduce((s, v) => s + v.amcVal, 0).toLocaleString()}/year` }
        ]};
    }
    if (q.includes("prevent") || q.includes("future") || q.includes("measure")) {
        return { sections: [
            { icon: "\u{1F6E1}\uFE0F", title: "PREVENTIVE MEASURES & RECOMMENDATIONS" },
            { title: "From Incident Analysis", items: P.incidents.filter(i => i.preventive).map(i => `${i.type}: ${i.preventive}`), empty: "No preventive measures documented yet" },
            { title: "General Recommendations", items: [
                "Implement daily equipment checklists",
                "Set up automated maintenance reminders",
                "Conduct monthly safety drills",
                "Regular vendor performance reviews",
                "Maintain critical spare parts inventory",
                "Cross-train staff on emergency procedures",
                "Install IoT sensors for real-time monitoring",
                "Weekly management review of open tickets"
            ]}
        ]};
    }

    return { sections: [
        { icon: "\u{1F9E0}", title: "FACILITYOPS ANALYSIS" },
        { title: "Current Status", items: [
            `${openTickets.length} open tickets requiring attention`,
            `${criticalTickets.length} critical issues`,
            `${overdueAssets.length} assets overdue for maintenance`,
            `${overdueTasks.length} overdue maintenance tasks`,
            `${lowStock.length} low stock items`,
            `Total costs: Rs.${totalCost.toLocaleString()}`
        ]},
        { title: "Try asking about", items: [
            "Root cause analysis",
            "Cost breakdown",
            "Staff performance",
            "Preventive measures",
            "Vendor AMC status",
            "Priority actions needed"
        ]},
        { content: "Try asking about root causes, cost breakdown, staff performance, or vendor AMC status." }
    ]};
}

// --- Rich markdown-to-JSX renderer ---
function RichMessage({ data }) {
    // If data is structured (local response)
    if (data.sections) {
        return (
            <div>
                {data.sections.map((s, i) => (
                    <div key={i} style={{ marginBottom: 10 }}>
                        {s.title && (
                            <div style={{ fontSize: s.icon ? 14 : 13, fontWeight: 800, color: s.icon ? "#0f172a" : "#334155", marginBottom: 4, marginTop: s.icon ? 8 : 4 }}>
                                {s.icon ? `${s.icon} ` : ""}{s.title}
                            </div>
                        )}
                        {s.content && <div style={{ fontSize: 13, color: "#475569", marginBottom: 4 }}>{s.content}</div>}
                        {s.items && s.items.length > 0 ? (
                            <div style={{ paddingLeft: 4 }}>
                                {s.items.map((item, j) => (
                                    <div key={j} style={{ fontSize: 12, color: "#475569", padding: "3px 0 3px 10px", borderLeft: "2px solid #e2e8f0", marginBottom: 2 }}>
                                        {item}
                                    </div>
                                ))}
                            </div>
                        ) : s.items && s.empty ? (
                            <div style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic", paddingLeft: 10 }}>{s.empty}</div>
                        ) : null}
                    </div>
                ))}
            </div>
        );
    }
    // If data is a raw string (OpenAI response), render with proper formatting
    if (typeof data === "string") {
        return <FormattedText text={data} />;
    }
    return null;
}

function FormattedText({ text }) {
    const lines = text.split("\n");
    return (
        <div>
            {lines.map((line, i) => {
                const trimmed = line.trim();
                if (trimmed === "") return <div key={i} style={{ height: 6 }} />;

                // Headers: ### or ALL CAPS lines
                if (trimmed.startsWith("###")) {
                    return <div key={i} style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginTop: 10, marginBottom: 4 }}>{cleanMd(trimmed.replace(/^#+\s*/, ""))}</div>;
                }
                if (trimmed.startsWith("##")) {
                    return <div key={i} style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginTop: 12, marginBottom: 4 }}>{cleanMd(trimmed.replace(/^#+\s*/, ""))}</div>;
                }
                if (trimmed.startsWith("#")) {
                    return <div key={i} style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginTop: 12, marginBottom: 6 }}>{cleanMd(trimmed.replace(/^#+\s*/, ""))}</div>;
                }

                // Numbered list
                const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
                if (numMatch) {
                    return (
                        <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "#475569", padding: "3px 0", marginLeft: 4 }}>
                            <span style={{ fontWeight: 700, color: "#4f46e5", minWidth: 18 }}>{numMatch[1]}.</span>
                            <span>{cleanMd(numMatch[2])}</span>
                        </div>
                    );
                }

                // Bullet list
                if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                    return (
                        <div key={i} style={{ fontSize: 12, color: "#475569", padding: "3px 0 3px 10px", borderLeft: "2px solid #e2e8f0", marginBottom: 2, marginLeft: 4 }}>
                            {cleanMd(trimmed.substring(2))}
                        </div>
                    );
                }

                // Bold-only line
                if (trimmed.startsWith("**") && trimmed.endsWith("**") && trimmed.indexOf("**", 2) === trimmed.length - 2) {
                    return <div key={i} style={{ fontSize: 13, fontWeight: 800, color: "#1e293b", marginTop: 8, marginBottom: 3 }}>{trimmed.replace(/\*\*/g, "")}</div>;
                }

                // Regular line with possible inline bold/italic
                return <div key={i} style={{ fontSize: 12, color: "#475569", marginBottom: 2, lineHeight: 1.6 }}>{renderInline(trimmed)}</div>;
            })}
        </div>
    );
}

function cleanMd(text) {
    return text.replace(/\*\*/g, "").replace(/\*/g, "").replace(/__/g, "").replace(/_/g, " ");
}

function renderInline(text) {
    // Split by **bold** patterns and render
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    if (parts.length === 1) {
        // Try *italic*
        const ip = text.split(/(\*[^*]+\*)/g);
        if (ip.length === 1) return text;
        return ip.map((p, j) => {
            if (p.startsWith("*") && p.endsWith("*")) return <em key={j} style={{ color: "#64748b" }}>{p.slice(1, -1)}</em>;
            return p;
        });
    }
    return parts.map((p, j) => {
        if (p.startsWith("**") && p.endsWith("**")) return <b key={j} style={{ color: "#0f172a" }}>{p.slice(2, -2)}</b>;
        return p;
    });
}

export default function AIBrainModule({ tickets, assets, tasks, incidents, staff, vendors, inventory }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const chatRef = useRef(null);

    useEffect(() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, [messages]);

    const P = { tickets, assets, tasks, incidents, staff, vendors, inventory };

    const askAI = async (query) => {
        const q = (query || input).trim();
        if (!q) return;
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: q }]);
        setLoading(true);

        try {

            const data = await api.post("ai", {
                messages: [
                    ...messages.filter(m => typeof m.content === "string").map(m => ({ role: m.role, content: typeof m.content === "string" ? m.content : "Analysis provided." })),
                    { role: "user", content: q }
                ],
                systemPrompt: buildContext(P)
            });
            if (data.reply) {
                setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
            } else {
                const local = generateLocalResponse(q, P);
                setMessages(prev => [...prev, { role: "assistant", content: local }]);
            }
        } catch {
            const local = generateLocalResponse(q, P);
            setMessages(prev => [...prev, { role: "assistant", content: local }]);
        }
        setLoading(false);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 160px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{"\u{1F9E0}"} FacilityOps AI Brain</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>
                        {"\u{1F7E2} AI Connected"} {"\u00B7"} Ask anything about your facility
                    </div>
                </div>
            </div>

            <div ref={chatRef} style={{ flex: 1, overflowY: "auto", marginBottom: 12 }}>
                {messages.length === 0 ? (
                    <div>
                        <div style={{ textAlign: "center", padding: "24px 16px", marginBottom: 16 }}>
                            <div style={{ fontSize: 48, marginBottom: 12 }}>{"\u{1F9E0}"}</div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Ask the AI Brain</div>
                            <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
                                Analyzes tickets, incidents, assets, staff performance, costs, and provides root cause analysis with preventive recommendations.
                            </div>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 8 }}>Suggested Questions:</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {SUGGESTED_QUERIES.map((q, i) => (
                                <button key={i} onClick={() => askAI(q)} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "8px 12px", fontSize: 12, color: "#4f46e5", cursor: "pointer", textAlign: "left", fontWeight: 500 }}>{q}</button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {messages.map((m, i) => (
                            <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: m.role === "user" ? "85%" : "95%" }}>
                                <div style={{
                                    background: m.role === "user" ? "#4f46e5" : "#fff",
                                    color: m.role === "user" ? "#fff" : "#0f172a",
                                    padding: m.role === "user" ? "10px 14px" : "14px 16px",
                                    borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                    fontSize: 13, lineHeight: 1.6,
                                    border: m.role === "assistant" ? "1px solid #e5e7eb" : "none",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                                }}>
                                    {m.role === "user" ? m.content : <RichMessage data={m.content} />}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div style={{ alignSelf: "flex-start", maxWidth: "80%" }}>
                                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "14px 16px", fontSize: 13, color: "#94a3b8", display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ animation: "pulse 1.5s infinite" }}>{"\u{1F9E0}"}</span> Analyzing facility data...
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {messages.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                    {SUGGESTED_QUERIES.slice(0, 4).map((q, i) => (
                        <button key={i} onClick={() => askAI(q)} disabled={loading} style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 8, padding: "4px 10px", fontSize: 10, color: "#4f46e5", cursor: "pointer" }}>{q}</button>
                    ))}
                </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !loading && askAI()} disabled={loading} placeholder="Ask about root causes, costs, staff, prevention..." style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 12, padding: "10px 16px", fontSize: 13, outline: "none" }} />
                <button onClick={() => askAI()} disabled={loading} style={{ background: loading ? "#94a3b8" : "#4f46e5", color: "#fff", border: "none", borderRadius: 12, width: 42, height: 42, fontWeight: 700, cursor: loading ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{"\u27A4"}</button>
            </div>
        </div>
    );
}

export { aiPrioritize, calculatePersonnel };
