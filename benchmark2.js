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
    const distribution = ["critical", "high", "medium", "low"].map(p => {
      const cnt = P.tickets.filter(t => t.priority === p).length;
      const pct = P.tickets.length ? Math.round((cnt / P.tickets.length) * 100) : 0;
      return { p, cnt, pct };
    });
    return distribution;
};

const runOptimized = () => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    for (let i = 0; i < P.tickets.length; i++) {
        const p = P.tickets[i].priority;
        if (counts[p] !== undefined) counts[p]++;
    }
    const len = P.tickets.length;
    return ["critical", "high", "medium", "low"].map(p => ({
        p,
        cnt: counts[p],
        pct: len ? Math.round((counts[p] / len) * 100) : 0
    }));
};

const iters = 100;
let t0 = performance.now();
for(let i=0; i<iters; i++) runOriginal();
let t1 = performance.now();
console.log(`Original Distribution: ${(t1-t0).toFixed(2)}ms`);

t0 = performance.now();
for(let i=0; i<iters; i++) runOptimized();
t1 = performance.now();
console.log(`Optimized Distribution: ${(t1-t0).toFixed(2)}ms`);
