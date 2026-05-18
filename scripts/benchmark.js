const P = {
    tickets: [],
    assets: [],
    tasks: [],
    incidents: [],
    staff: [],
    vendors: [],
    inventory: []
};

// Generate test data
for (let i = 0; i < 10000; i++) {
    P.tickets.push({
        id: i,
        asset: "Asset " + i,
        problem: "Problem " + i,
        priority: i % 10 === 0 ? "critical" : "normal",
        status: i % 3 === 0 ? "open" : i % 3 === 1 ? "in-progress" : "closed",
        cost: i % 2 === 0 ? 100 : 0,
        tatMins: i % 4 === 0 ? 60 : 0
    });
    P.assets.push({
        id: i,
        status: i % 5 === 0 ? "overdue" : "active"
    });
    P.tasks.push({
        id: i,
        status: i % 5 === 0 ? "overdue" : "active"
    });
    P.inventory.push({
        qty: i % 10,
        min: 5
    });
    P.vendors.push({
        status: i % 10 === 0 ? "expiring" : "active"
    });
}

function buildContextOriginal(P) {
    const openTickets = P.tickets.filter(t => t.status === "open" || t.status === "in-progress");
    const resolvedTickets = P.tickets.filter(t => t.status === "resolved" || t.status === "closed");
    const criticalTickets = P.tickets.filter(t => t.priority === "critical");
    const overdueAssets = P.assets.filter(a => a.status === "overdue");
    const overdueTasks = P.tasks.filter(t => t.status === "overdue");
    const totalCost = P.tickets.reduce((s, t) => s + (t.cost || 0), 0);
    const avgTAT = P.tickets.filter(t => t.tatMins).reduce((a, t, _, arr) => a + t.tatMins / arr.length, 0);
    return { openTickets, resolvedTickets, criticalTickets, overdueAssets, overdueTasks, totalCost, avgTAT };
}

function buildContextOptimized(P) {
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
    return { openTickets, resolvedTickets, criticalTickets, overdueAssets, overdueTasks, totalCost, avgTAT };
}

// Warmup
for (let i = 0; i < 100; i++) {
    buildContextOriginal(P);
    buildContextOptimized(P);
}

const ITERATIONS = 1000;

console.time("Original");
for (let i = 0; i < ITERATIONS; i++) {
    buildContextOriginal(P);
}
console.timeEnd("Original");

console.time("Optimized");
for (let i = 0; i < ITERATIONS; i++) {
    buildContextOptimized(P);
}
console.timeEnd("Optimized");

const resOrg = buildContextOriginal(P);
const resOpt = buildContextOptimized(P);
console.log(resOrg.openTickets.length, resOpt.openTickets.length);
console.log(resOrg.totalCost, resOpt.totalCost);
console.log(resOrg.avgTAT, resOpt.avgTAT);
