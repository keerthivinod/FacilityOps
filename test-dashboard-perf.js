const { performance } = require('perf_hooks');

// Generate mock data
const generateTickets = (num) => {
  const statuses = ["open", "in-progress", "resolved", "closed", "pending"];
  const priorities = ["critical", "high", "medium", "low"];
  const sources = ["whatsapp", "email", "portal", "phone"];
  return Array.from({ length: num }, () => ({
    status: statuses[Math.floor(Math.random() * statuses.length)],
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    source: sources[Math.floor(Math.random() * sources.length)],
    cost: Math.random() * 100,
    tatMins: Math.random() > 0.5 ? Math.floor(Math.random() * 500) : null,
  }));
};

const tickets = generateTickets(100000);

const tasks = [];
const incidents = [];
const staff = [];
const inventory = [];
const vendors = [];
const assets = [];

const P = { tickets, tasks, incidents, staff, inventory, vendors, assets };

function runOriginal() {
  const start = performance.now();
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

  const m = { openT, inProgress, resolved, dueMaint, overdueM, openInc, onDuty, totalCost, avgTAT, lowStock, expiringAMC, overdueA, whatsapp, priority, criticalCount: criticalT.length };

  const distribution = ["critical", "high", "medium", "low"].map(p => {
    const cnt = P.tickets.filter(t => t.priority === p).length;
    const pct = P.tickets.length ? Math.round((cnt / P.tickets.length) * 100) : 0;
    return { p, cnt, pct };
  });

  const end = performance.now();
  return { time: end - start, m, distribution };
}

function runOptimized() {
  const start = performance.now();

  let openT = 0, inProgress = 0, resolved = 0, totalCost = 0, tatSum = 0, tatCount = 0, whatsapp = 0;
  let critical = 0, high = 0, medium = 0, low = 0;
  const criticalT = [], highT = [];

  for (let i = 0; i < P.tickets.length; i++) {
    const t = P.tickets[i];

    // Status counts
    if (t.status === "open") openT++;
    else if (t.status === "in-progress") inProgress++;
    else if (t.status === "resolved" || t.status === "closed") resolved++;

    // Priority counts for distribution & priority lists
    if (t.priority === "critical") {
      critical++;
      if (t.status !== "resolved" && t.status !== "closed") criticalT.push(t);
    } else if (t.priority === "high") {
      high++;
      if (t.status !== "resolved" && t.status !== "closed") highT.push(t);
    } else if (t.priority === "medium") {
      medium++;
    } else if (t.priority === "low") {
      low++;
    }

    // Cost and TAT
    totalCost += (t.cost || 0);
    if (t.tatMins) {
      tatSum += t.tatMins;
      tatCount++;
    }

    // Source
    if (t.source === "whatsapp") whatsapp++;
  }

  let dueMaint = 0, overdueM = 0;
  for (let i = 0; i < P.tasks.length; i++) {
    const x = P.tasks[i];
    if (x.status === "overdue") { overdueM++; dueMaint++; }
    else if (x.status === "due-soon") dueMaint++;
  }

  let openInc = 0;
  for (let i = 0; i < P.incidents.length; i++) {
    if (P.incidents[i].status !== "closed") openInc++;
  }

  let onDuty = 0;
  for (let i = 0; i < P.staff.length; i++) {
    if (P.staff[i].status !== "on-leave") onDuty++;
  }

  const lowStock = [];
  for (let i = 0; i < P.inventory.length; i++) {
    if (P.inventory[i].qty < P.inventory[i].min) lowStock.push(P.inventory[i]);
  }

  const expiringAMC = [];
  for (let i = 0; i < P.vendors.length; i++) {
    if (P.vendors[i].status === "expiring") expiringAMC.push(P.vendors[i]);
  }

  const overdueA = [];
  for (let i = 0; i < P.assets.length; i++) {
    if (P.assets[i].status === "overdue") overdueA.push(P.assets[i]);
  }

  const avgTAT = tatCount ? Math.round(tatSum / tatCount) : 0;
  const priority = [...criticalT, ...highT.slice(0, 4)].slice(0, 5);

  const m = { openT, inProgress, resolved, dueMaint, overdueM, openInc, onDuty, totalCost, avgTAT, lowStock, expiringAMC, overdueA, whatsapp, priority, criticalCount: criticalT.length };

  const len = P.tickets.length;
  const distribution = [
    { p: "critical", cnt: critical, pct: len ? Math.round((critical / len) * 100) : 0 },
    { p: "high", cnt: high, pct: len ? Math.round((high / len) * 100) : 0 },
    { p: "medium", cnt: medium, pct: len ? Math.round((medium / len) * 100) : 0 },
    { p: "low", cnt: low, pct: len ? Math.round((low / len) * 100) : 0 }
  ];

  const end = performance.now();
  return { time: end - start, m, distribution };
}

// Warmup
runOriginal(); runOptimized();

let origTime = 0;
let optTime = 0;
for (let i = 0; i < 10; i++) {
  origTime += runOriginal().time;
  optTime += runOptimized().time;
}

console.log(`Original Time (avg): ${origTime / 10} ms`);
console.log(`Optimized Time (avg): ${optTime / 10} ms`);

const r1 = runOriginal();
const r2 = runOptimized();

const checkEq = (a, b, name) => {
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    console.error(`Mismatch in ${name}`);
    console.log("Original:", a);
    console.log("Optimized:", b);
  }
};

checkEq(r1.m.openT, r2.m.openT, "openT");
checkEq(r1.m.inProgress, r2.m.inProgress, "inProgress");
checkEq(r1.m.resolved, r2.m.resolved, "resolved");
checkEq(r1.m.dueMaint, r2.m.dueMaint, "dueMaint");
checkEq(r1.m.overdueM, r2.m.overdueM, "overdueM");
checkEq(r1.m.openInc, r2.m.openInc, "openInc");
checkEq(r1.m.onDuty, r2.m.onDuty, "onDuty");
checkEq(r1.m.totalCost, r2.m.totalCost, "totalCost");
checkEq(r1.m.avgTAT, r2.m.avgTAT, "avgTAT");
checkEq(r1.m.whatsapp, r2.m.whatsapp, "whatsapp");
checkEq(r1.m.criticalCount, r2.m.criticalCount, "criticalCount");
checkEq(r1.distribution, r2.distribution, "distribution");
checkEq(r1.m.priority, r2.m.priority, "priority");

console.log("Test completed.");
