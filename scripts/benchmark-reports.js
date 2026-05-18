const { performance } = require('perf_hooks');

const P = {
  tickets: Array.from({ length: 100000 }, (_, i) => ({
    priority: ['critical', 'high', 'medium', 'low'][Math.floor(Math.random() * 4)],
  })),
};

const stats = { totalTickets: P.tickets.length };

function oldMethod() {
  const priorities = ["critical", "high", "medium", "low"];
  const colors = { critical: "#dc2626", high: "#ea580c", medium: "#d97706", low: "#2563eb" };
  return priorities.map(p => {
    const cnt = P.tickets.filter(t => t.priority === p).length;
    const pct = stats.totalTickets > 0 ? Math.round((cnt / stats.totalTickets) * 100) : 0;
    return { p, cnt, pct, color: colors[p] };
  });
}

function newMethod() {
  const priorities = ["critical", "high", "medium", "low"];
  const colors = { critical: "#dc2626", high: "#ea580c", medium: "#d97706", low: "#2563eb" };

  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  for (let i = 0; i < P.tickets.length; i++) {
    const p = P.tickets[i].priority;
    if (counts[p] !== undefined) {
      counts[p]++;
    }
  }

  return priorities.map(p => {
    const cnt = counts[p] || 0;
    const pct = stats.totalTickets > 0 ? Math.round((cnt / stats.totalTickets) * 100) : 0;
    return { p, cnt, pct, color: colors[p] };
  });
}

// Warmup
for(let i=0; i<100; i++) { oldMethod(); newMethod(); }

const start1 = performance.now();
for(let i=0; i<100; i++) { oldMethod(); }
const end1 = performance.now();

const start2 = performance.now();
for(let i=0; i<100; i++) { newMethod(); }
const end2 = performance.now();

console.log(`Old method: ${end1 - start1} ms`);
console.log(`New method: ${end2 - start2} ms`);
