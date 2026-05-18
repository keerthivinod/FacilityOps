function generateLocalResponse(query, P) {
    const q = query.toLowerCase();
    const openTickets = P.tickets.filter(t => t.status === "open" || t.status === "in-progress");
    const criticalTickets = P.tickets.filter(t => t.priority === "critical");
    const overdueAssets = P.assets.filter(a => a.status === "overdue");
    const overdueTasks = P.tasks.filter(t => t.status === "overdue");
    const totalCost = P.tickets.reduce((s, t) => s + (t.cost || 0), 0);
    const lowStock = P.inventory.filter(i => i.qty < i.min);
    const expiringAMC = P.vendors.filter(v => v.status === "expiring");

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
        return { sections: [
            { icon: "\u{1F477}", title: "STAFF PERFORMANCE" },
            { title: "Top Performers", items: [...P.staff].sort((a, b) => b.rating - a.rating).slice(0, 3).map(s => `${s.name}: ${s.rating}\u2B50 (${s.tasksCompleted} tasks, ${s.avgTAT}m TAT)`) },
            { title: "Needs Support", items: [...P.staff].sort((a, b) => a.rating - b.rating).slice(0, 2).map(s => `${s.name}: ${s.rating}\u2B50 (${s.avgTAT}m TAT)`) },
            { icon: "\u{1F4CB}", title: "RECOMMENDATIONS", items: [
                "Reward top performing technicians",
                "Provide additional training for staff with low ratings/high TAT",
                "Rebalance workload if any staff is overburdened"
            ]}
        ]};
    }

    return { sections: [
        { icon: "\u{1F4CA}", title: "FACILITY SUMMARY" },
        { title: "Current Status", items: [
            `${openTickets.length} Open/In-progress tickets`,
            `${criticalTickets.length} Critical tickets`,
            `Total Repair Cost: Rs.${totalCost.toLocaleString()}`
        ]},
        { title: "Action Needed", items: [
            `${overdueAssets.length} Overdue assets`,
            `${overdueTasks.length} Overdue tasks`,
            `${lowStock.length} Low stock items`,
            `${expiringAMC.length} Expiring AMCs`
        ]},
        { icon: "\u{1F4A1}", title: "RECOMMENDATIONS", items: [
            "Address critical tickets immediately",
            "Follow up on overdue maintenance tasks",
            "Review stock levels and reorder as needed",
            "Plan for upcoming AMC renewals"
        ]}
    ]};
}

function generateLocalResponseOptimized(query, P) {
    const q = query.toLowerCase();

    // Instead of multiple passes, we can do single passes
    let openTicketsCount = 0;
    let openTicketsList = []; // Need list?
    let criticalTicketsList = [];
    let totalCost = 0;

    for (let i = 0; i < P.tickets.length; i++) {
        const t = P.tickets[i];
        if (t.status === "open" || t.status === "in-progress") {
            openTicketsCount++;
            openTicketsList.push(t);
        }
        if (t.priority === "critical") {
            criticalTicketsList.push(t);
        }
        if (t.cost) {
            totalCost += t.cost;
        }
    }

    let overdueAssetsList = [];
    for (let i = 0; i < P.assets.length; i++) {
        const a = P.assets[i];
        if (a.status === "overdue") {
            overdueAssetsList.push(a);
        }
    }

    let overdueTasksList = [];
    for (let i = 0; i < P.tasks.length; i++) {
        const t = P.tasks[i];
        if (t.status === "overdue") {
            overdueTasksList.push(t);
        }
    }

    let lowStockList = [];
    for (let i = 0; i < P.inventory.length; i++) {
        const inv = P.inventory[i];
        if (inv.qty < inv.min) {
            lowStockList.push(inv);
        }
    }

    let expiringAMCList = [];
    for (let i = 0; i < P.vendors.length; i++) {
        const v = P.vendors[i];
        if (v.status === "expiring") {
            expiringAMCList.push(v);
        }
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
        for (let i = 0; i < P.tickets.length; i++) {
            const t = P.tickets[i];
            if (t.cost) {
                const c = t.category || "Other";
                byCategory[c] = (byCategory[c] || 0) + t.cost;
            }
        }

        let totalAmc = 0;
        const vendorItems = [];
        for (let i = 0; i < P.vendors.length; i++) {
            const v = P.vendors[i];
            vendorItems.push(`${v.name}: Rs.${v.amcVal.toLocaleString()}/year (${v.status})`);
            totalAmc += v.amcVal;
        }

        return { sections: [
            { icon: "\u{1F4B0}", title: "COST ANALYSIS", items: [`Total Repair Cost: Rs.${totalCost.toLocaleString()}`] },
            { title: "By Category", items: Object.entries(byCategory).map(([k, v]) => `${k}: Rs.${v.toLocaleString()}`) },
            { title: "AMC Investments", items: vendorItems },
            { content: `Total AMC: Rs.${totalAmc.toLocaleString()}/year` },
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
            { title: `Critical Tickets (${criticalTicketsList.length})`, items: criticalTicketsList.map(t => `${t.asset}: ${t.problem} [${t.status}]`), empty: "None" },
            { title: `Overdue Assets (${overdueAssetsList.length})`, items: overdueAssetsList.map(a => `${a.name} at ${a.loc} (Last: ${a.last})`) },
            { title: `Overdue Tasks (${overdueTasksList.length})`, items: overdueTasksList.map(t => `${t.asset}: ${t.task} (Due: ${t.due})`) },
            { title: `Low Inventory (${lowStockList.length})`, items: lowStockList.map(i => `${i.name}: ${i.qty}/${i.min} ${i.unit}`) },
            { title: `Expiring AMCs (${expiringAMCList.length})`, items: expiringAMCList.map(v => `${v.name}: expires ${v.amcEnd}`) }
        ]};
    }
    if (q.includes("technician") || q.includes("staff") || q.includes("perform") || q.includes("best")) {
        return { sections: [
            { icon: "\u{1F477}", title: "STAFF PERFORMANCE" },
            { title: "Top Performers", items: [...P.staff].sort((a, b) => b.rating - a.rating).slice(0, 3).map(s => `${s.name}: ${s.rating}\u2B50 (${s.tasksCompleted} tasks, ${s.avgTAT}m TAT)`) },
            { title: "Needs Support", items: [...P.staff].sort((a, b) => a.rating - b.rating).slice(0, 2).map(s => `${s.name}: ${s.rating}\u2B50 (${s.avgTAT}m TAT)`) },
            { icon: "\u{1F4CB}", title: "RECOMMENDATIONS", items: [
                "Reward top performing technicians",
                "Provide additional training for staff with low ratings/high TAT",
                "Rebalance workload if any staff is overburdened"
            ]}
        ]};
    }

    return { sections: [
        { icon: "\u{1F4CA}", title: "FACILITY SUMMARY" },
        { title: "Current Status", items: [
            `${openTicketsList.length} Open/In-progress tickets`,
            `${criticalTicketsList.length} Critical tickets`,
            `Total Repair Cost: Rs.${totalCost.toLocaleString()}`
        ]},
        { title: "Action Needed", items: [
            `${overdueAssetsList.length} Overdue assets`,
            `${overdueTasksList.length} Overdue tasks`,
            `${lowStockList.length} Low stock items`,
            `${expiringAMCList.length} Expiring AMCs`
        ]},
        { icon: "\u{1F4A1}", title: "RECOMMENDATIONS", items: [
            "Address critical tickets immediately",
            "Follow up on overdue maintenance tasks",
            "Review stock levels and reorder as needed",
            "Plan for upcoming AMC renewals"
        ]}
    ]};
}

// Generate huge dataset to emphasize optimization difference
const P = {
    tickets: Array.from({length: 10000}, (_, i) => ({
        id: i, status: i % 5 === 0 ? "open" : (i % 7 === 0 ? "in-progress" : "closed"),
        priority: i % 13 === 0 ? "critical" : "normal",
        cost: i % 3 === 0 ? Math.random() * 1000 : 0,
        category: i % 2 === 0 ? "Electrical" : "Plumbing",
        asset: "Asset" + i, problem: "Problem" + i
    })),
    assets: Array.from({length: 5000}, (_, i) => ({
        id: i, status: i % 11 === 0 ? "overdue" : "ok",
        name: "Asset" + i, loc: "Loc" + i, last: "2023-01-01"
    })),
    tasks: Array.from({length: 5000}, (_, i) => ({
        id: i, status: i % 9 === 0 ? "overdue" : "ok",
        asset: "Asset" + i, task: "Task" + i, due: "2023-01-01"
    })),
    incidents: Array.from({length: 1000}, (_, i) => ({
        id: i, type: "Type" + i, loc: "Loc" + i, sev: "high", rca: "RCA" + i, preventive: "Prev" + i, status: "open"
    })),
    staff: Array.from({length: 500}, (_, i) => ({
        name: "Staff" + i, rating: Math.random() * 5, tasksCompleted: Math.floor(Math.random() * 100), avgTAT: Math.floor(Math.random() * 120)
    })),
    vendors: Array.from({length: 1000}, (_, i) => ({
        name: "Vendor" + i, status: i % 15 === 0 ? "expiring" : "active",
        amcVal: Math.random() * 50000, amcEnd: "2023-12-31"
    })),
    inventory: Array.from({length: 3000}, (_, i) => ({
        name: "Inv" + i, qty: Math.floor(Math.random() * 100), min: 50, unit: "pcs"
    }))
};

const queries = [
    "what is the root cause?",
    "what are the total costs?",
    "needs attention urgent",
    "who is the best technician?",
    "give me a summary"
];

const ITERS = 100;

console.time("Original");
for(let i = 0; i < ITERS; i++) {
    for (const q of queries) {
        generateLocalResponse(q, P);
    }
}
console.timeEnd("Original");

console.time("Optimized");
for(let i = 0; i < ITERS; i++) {
    for (const q of queries) {
        generateLocalResponseOptimized(q, P);
    }
}
console.timeEnd("Optimized");
