const { performance } = require('perf_hooks');

const generateData = () => {
    const tickets = Array.from({ length: 50000 }, (_, i) => ({
        id: `T${i}`,
        status: ["open", "in-progress", "resolved", "closed"][i % 4],
        priority: ["critical", "high", "medium", "low"][i % 4],
        cost: i % 5 === 0 ? 100 : 0,
        tatMins: i % 2 === 0 ? 30 : null,
        source: i % 10 === 0 ? "whatsapp" : "app"
    }));
    const tasks = Array.from({ length: 10000 }, (_, i) => ({
        status: ["overdue", "due-soon", "completed"][i % 3]
    }));
    const incidents = Array.from({ length: 5000 }, (_, i) => ({
        status: i % 2 === 0 ? "open" : "closed"
    }));
    const staff = Array.from({ length: 1000 }, (_, i) => ({
        status: i % 5 === 0 ? "on-leave" : "active"
    }));
    const inventory = Array.from({ length: 20000 }, (_, i) => ({
        qty: i % 10,
        min: 5
    }));
    const vendors = Array.from({ length: 500 }, (_, i) => ({
        status: i % 10 === 0 ? "expiring" : "active"
    }));
    const assets = Array.from({ length: 10000 }, (_, i) => ({
        status: i % 20 === 0 ? "overdue" : "active"
    }));
    return { tickets, tasks, incidents, staff, inventory, vendors, assets };
};

const P = generateData();

const runOriginal = () => {
    const openT       = P.tickets.filter(x => x.status === "open").length;
    const inProgress  = P.tickets.filter(x => x.status === "in-progress").length;
    const resolved    = P.tickets.filter(x => x.status === "resolved" || x.status === "closed").length;
    const dueMaint    = P.tasks.filter(x => x.status === "overdue" || x.status === "due-soon").length;
    const overdueM    = P.tasks.filter(x => x.status === "overdue").length;
    const openInc     = P.incidents.filter(x => x.status !== "closed").length;
    const onDuty      = P.staff.filter(x => x.status !== "on-leave").length;
    const criticalT   = P.tickets.filter(x => x.priority === "critical" && x.status !== "resolved" && x.status !== "closed");
    const highT       = P.tickets.filter(x => x.priority === "high" && x.status !== "resolved" && x.status !== "closed");
    const totalCost   = P.tickets.reduce((s, t) => s + (t.cost || 0), 0);
    const tatList     = P.tickets.filter(t => t.tatMins);
    const avgTAT      = tatList.length ? Math.round(tatList.reduce((a, t) => a + t.tatMins, 0) / tatList.length) : 0;
    const lowStock    = P.inventory.filter(i => i.qty < i.min);
    const expiringAMC = P.vendors.filter(v => v.status === "expiring");
    const overdueA    = P.assets.filter(a => a.status === "overdue");
    const whatsapp    = P.tickets.filter(t => t.source === "whatsapp").length;
    const priority    = [...criticalT, ...highT.slice(0, 4)].slice(0, 5);
    return { openT, inProgress, resolved, dueMaint, overdueM, openInc, onDuty, totalCost, avgTAT, lowStock, expiringAMC, overdueA, whatsapp, priority, criticalCount: criticalT.length };
};

const runOptimized = () => {
    let openT = 0, inProgress = 0, resolved = 0;
    let criticalT = [], highT = [];
    let totalCost = 0, tatSum = 0, tatCount = 0;
    let whatsapp = 0;

    for (let i = 0; i < P.tickets.length; i++) {
        const t = P.tickets[i];
        if (t.status === "open") openT++;
        else if (t.status === "in-progress") inProgress++;
        else if (t.status === "resolved" || t.status === "closed") resolved++;

        const isNotResolved = t.status !== "resolved" && t.status !== "closed";
        if (t.priority === "critical" && isNotResolved) criticalT.push(t);
        if (t.priority === "high" && isNotResolved) highT.push(t);

        if (t.cost) totalCost += t.cost;
        if (t.tatMins) {
            tatSum += t.tatMins;
            tatCount++;
        }
        if (t.source === "whatsapp") whatsapp++;
    }

    let dueMaint = 0, overdueM = 0;
    for (let i = 0; i < P.tasks.length; i++) {
        const t = P.tasks[i];
        if (t.status === "overdue") { overdueM++; dueMaint++; }
        else if (t.status === "due-soon") dueMaint++;
    }

    let openInc = 0;
    for (let i = 0; i < P.incidents.length; i++) {
        if (P.incidents[i].status !== "closed") openInc++;
    }

    let onDuty = 0;
    for (let i = 0; i < P.staff.length; i++) {
        if (P.staff[i].status !== "on-leave") onDuty++;
    }

    let lowStock = [];
    for (let i = 0; i < P.inventory.length; i++) {
        if (P.inventory[i].qty < P.inventory[i].min) lowStock.push(P.inventory[i]);
    }

    let expiringAMC = [];
    for (let i = 0; i < P.vendors.length; i++) {
        if (P.vendors[i].status === "expiring") expiringAMC.push(P.vendors[i]);
    }

    let overdueA = [];
    for (let i = 0; i < P.assets.length; i++) {
        if (P.assets[i].status === "overdue") overdueA.push(P.assets[i]);
    }

    const avgTAT = tatCount ? Math.round(tatSum / tatCount) : 0;
    const priority = [...criticalT, ...highT.slice(0, 4)].slice(0, 5);

    return { openT, inProgress, resolved, dueMaint, overdueM, openInc, onDuty, totalCost, avgTAT, lowStock, expiringAMC, overdueA, whatsapp, priority, criticalCount: criticalT.length };
};

const iters = 100;
let t0 = performance.now();
for(let i=0; i<iters; i++) runOriginal();
let t1 = performance.now();
console.log(`Original: ${(t1-t0).toFixed(2)}ms`);

t0 = performance.now();
for(let i=0; i<iters; i++) runOptimized();
t1 = performance.now();
console.log(`Optimized: ${(t1-t0).toFixed(2)}ms`);
