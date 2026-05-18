const { performance } = require('perf_hooks');

const statuses = ["planned", "in-progress", "completed", "on-hold"];
const projects = Array.from({ length: 100000 }, (_, i) => ({
    id: i,
    status: statuses[Math.floor(Math.random() * statuses.length)]
}));

const filterValues = ["all", "planned", "in-progress", "completed", "on-hold"];

function unoptimized() {
    return filterValues.map(v => {
        return v === "all" ? projects.length : projects.filter(p => p.status === v).length;
    });
}

function optimized() {
    const counts = { all: projects.length };
    for (let i = 0; i < projects.length; i++) {
        const s = projects[i].status;
        counts[s] = (counts[s] || 0) + 1;
    }
    return filterValues.map(v => counts[v] || 0);
}

// Warmup
for (let i = 0; i < 100; i++) {
    unoptimized();
    optimized();
}

const startUnopt = performance.now();
for (let i = 0; i < 100; i++) {
    unoptimized();
}
const endUnopt = performance.now();

const startOpt = performance.now();
for (let i = 0; i < 100; i++) {
    optimized();
}
const endOpt = performance.now();

console.log(`Unoptimized: ${(endUnopt - startUnopt).toFixed(2)} ms`);
console.log(`Optimized: ${(endOpt - startOpt).toFixed(2)} ms`);
