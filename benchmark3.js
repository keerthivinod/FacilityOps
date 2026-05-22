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
    return { tickets };
};

const P = generateData();

const runOriginal = () => {
    const criticalT = P.tickets.filter(x => x.priority === "critical" && x.status !== "resolved" && x.status !== "closed");
    const highT = P.tickets.filter(x => x.priority === "high" && x.status !== "resolved" && x.status !== "closed");
    return [...criticalT, ...highT.slice(0, 4)].slice(0, 5);
};

const runOptimized = () => {
    const priority = [];
    let critCount = 0;

    // First pass: gather up to 5 critical tickets
    for (let i = 0; i < P.tickets.length && critCount < 5; i++) {
        const t = P.tickets[i];
        if (t.priority === "critical" && t.status !== "resolved" && t.status !== "closed") {
            priority.push(t);
            critCount++;
        }
    }

    // Second pass: fill the rest with high tickets
    if (critCount < 5) {
        let highCount = 0;
        const needed = 5 - critCount;
        for (let i = 0; i < P.tickets.length && highCount < needed; i++) {
            const t = P.tickets[i];
            if (t.priority === "high" && t.status !== "resolved" && t.status !== "closed") {
                priority.push(t);
                highCount++;
            }
        }
    }

    return priority;
};

const iters = 1000;
let t0 = performance.now();
for(let i=0; i<iters; i++) runOriginal();
let t1 = performance.now();
console.log(`Original Priority: ${(t1-t0).toFixed(2)}ms`);

t0 = performance.now();
for(let i=0; i<iters; i++) runOptimized();
t1 = performance.now();
console.log(`Optimized Priority: ${(t1-t0).toFixed(2)}ms`);
