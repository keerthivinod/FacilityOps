"use client";
import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Ticket, Wrench, Warning, Users, CheckCircle, Clock,
  ArrowRight, ArrowUpRight, ChatCircleDots, Package,
  Handshake, Warehouse, Siren, FlowArrow, Pulse, CurrencyInr,
} from "@phosphor-icons/react";
import { SB } from "@/lib/data";

const SPRING = { type: "spring", stiffness: 100, damping: 20 };

const STAGGER = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};
const CHILD = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: SPRING },
};

const PRIORITY_TONE = {
  critical: { dot: "bg-rose-600",    text: "text-rose-700",    bg: "bg-rose-50",    ring: "ring-rose-200" },
  high:     { dot: "bg-amber-600",   text: "text-amber-700",   bg: "bg-amber-50",   ring: "ring-amber-200" },
  medium:   { dot: "bg-yellow-600",  text: "text-yellow-700",  bg: "bg-yellow-50",  ring: "ring-yellow-200" },
  low:      { dot: "bg-sky-600",     text: "text-sky-700",     bg: "bg-sky-50",     ring: "ring-sky-200" },
};

// Isolated breathing dot — perpetual loop kept in its own memoized leaf to avoid
// re-rendering the dashboard tree every animation frame.
const BreathDot = memo(function BreathDot({ tone = "bg-emerald-500" }) {
  return (
    <span className="relative inline-flex h-2 w-2">
      <motion.span
        className={`absolute inline-flex h-full w-full rounded-full ${tone} opacity-60`}
        animate={{ scale: [1, 2.2, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
      />
      <span className={`relative inline-flex h-2 w-2 rounded-full ${tone}`} />
    </span>
  );
});

// Wide Data Stream archetype — infinite horizontal carousel of recent tickets.
// Memoized + isolated so its animation loop never re-renders the parent grid.
const TicketStream = memo(function TicketStream({ tickets, onClick }) {
  const items = tickets.slice(0, 8);
  if (items.length === 0) return null;
  // Duplicate the list so the translate loop stays seamless.
  const loop = [...items, ...items];
  return (
    <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
      <motion.div
        className="flex gap-3 w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
      >
        {loop.map((t, i) => {
          const tone = PRIORITY_TONE[t.priority] || PRIORITY_TONE.low;
          return (
            <button
              key={`${t.id}-${i}`}
              onClick={onClick}
              className="group flex items-center gap-3 px-4 py-3 rounded-2xl bg-white ring-1 ring-slate-200/60 hover:ring-slate-300 transition active:translate-y-[1px] min-w-[280px] text-left"
            >
              <span className={`h-2 w-2 rounded-full ${tone.dot} flex-shrink-0`} />
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-zinc-900 truncate">{t.asset}</div>
                <div className="text-[11px] text-zinc-500 truncate">{t.problem}</div>
              </div>
              <ArrowUpRight size={14} weight="bold" className="text-zinc-400 group-hover:text-emerald-600 transition" />
            </button>
          );
        })}
      </motion.div>
    </div>
  );
});

function MetricTile({ icon: Icon, label, value, delta, tone = "zinc", onClick }) {
  const tones = {
    zinc:    { ring: "ring-slate-200/60", icon: "text-zinc-400", value: "text-zinc-900" },
    emerald: { ring: "ring-emerald-100",   icon: "text-emerald-600", value: "text-zinc-900" },
    rose:    { ring: "ring-rose-100",      icon: "text-rose-600",    value: "text-zinc-900" },
    amber:   { ring: "ring-amber-100",     icon: "text-amber-600",   value: "text-zinc-900" },
  };
  const t = tones[tone];
  return (
    <motion.button
      variants={CHILD}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
      transition={SPRING}
      onClick={onClick}
      className={`group relative text-left p-6 rounded-3xl bg-white ring-1 ${t.ring} shadow-diffuse hover:shadow-diffuse-md transition-shadow w-full`}
    >
      <div className="flex items-start justify-between mb-8">
        <Icon size={20} weight="duotone" className={t.icon} />
        <ArrowUpRight size={14} weight="bold" className="text-zinc-300 group-hover:text-zinc-500 transition" />
      </div>
      <div className={`font-mono text-3xl font-medium tracking-tight ${t.value}`}>{value}</div>
      <div className="mt-1 flex items-center justify-between">
        <div className="text-[12px] text-zinc-500 font-medium">{label}</div>
        {delta != null && (
          <div className="text-[10px] font-mono text-zinc-400">{delta}</div>
        )}
      </div>
    </motion.button>
  );
}

function PriorityRow({ ticket, onClick }) {
  const tone = PRIORITY_TONE[ticket.priority] || PRIORITY_TONE.low;
  return (
    <motion.button
      layout
      variants={CHILD}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.99 }}
      transition={SPRING}
      onClick={onClick}
      className="group flex items-start gap-4 py-4 w-full text-left border-b border-slate-100 last:border-b-0 active:translate-y-[1px]"
    >
      <div className={`mt-1 h-8 w-8 rounded-2xl ${tone.bg} ring-1 ${tone.ring} flex items-center justify-center flex-shrink-0`}>
        {ticket.priority === "critical"
          ? <Siren size={15} weight="duotone" className={tone.text} />
          : <Warning size={15} weight="duotone" className={tone.text} />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[13.5px] font-semibold text-zinc-900 truncate">{ticket.asset}</span>
          <span className={`text-[10px] font-mono uppercase tracking-wider ${tone.text} flex-shrink-0`}>
            {ticket.priority}
          </span>
        </div>
        <p className="text-[12px] text-zinc-600 line-clamp-1 mt-0.5">{ticket.problem}</p>
        <div className="mt-1.5 text-[11px] text-zinc-400 font-medium">
          {ticket.assignee || "Unassigned"} <span className="text-zinc-300 px-1">/</span> {ticket.loc}
        </div>
      </div>
      <ArrowRight size={14} weight="bold" className="text-zinc-300 group-hover:text-emerald-600 transition mt-2 flex-shrink-0" />
    </motion.button>
  );
}

function AlertPill({ count, label, onClick, icon: Icon, tone }) {
  const tones = {
    rose:  "bg-rose-50/60 ring-rose-200/60 text-rose-700 hover:bg-rose-50",
    amber: "bg-amber-50/60 ring-amber-200/60 text-amber-700 hover:bg-amber-50",
  };
  return (
    <motion.button
      layout
      variants={CHILD}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`flex items-center justify-between gap-3 w-full px-4 py-3 rounded-2xl ring-1 ${tones[tone]} transition active:translate-y-[1px]`}
    >
      <div className="flex items-center gap-3">
        <Icon size={16} weight="duotone" />
        <span className="text-[12.5px] font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[13px] font-semibold">{count}</span>
        <ArrowRight size={13} weight="bold" />
      </div>
    </motion.button>
  );
}

export default function Dash({ P }) {
  const m = useMemo(() => {
    let openT = 0, inProgress = 0, resolved = 0, totalCost = 0, whatsapp = 0;
    let tatSum = 0, tatCount = 0;
    let criticalCountDist = 0, highCountDist = 0, mediumCountDist = 0, lowCountDist = 0;
    const criticalT = [];
    const highT = [];

    for (let i = 0; i < P.tickets.length; i++) {
      const t = P.tickets[i];
      if (t.status === "open") openT++;
      else if (t.status === "in-progress") inProgress++;
      else if (t.status === "resolved" || t.status === "closed") resolved++;

      if (t.status !== "resolved" && t.status !== "closed") {
        if (t.priority === "critical") criticalT.push(t);
        if (t.priority === "high") highT.push(t);
      }

      if (t.cost) totalCost += t.cost;
      if (t.tatMins) {
        tatSum += t.tatMins;
        tatCount++;
      }
      if (t.source === "whatsapp") whatsapp++;

      if (t.priority === "critical") criticalCountDist++;
      else if (t.priority === "high") highCountDist++;
      else if (t.priority === "medium") mediumCountDist++;
      else if (t.priority === "low") lowCountDist++;
    }

    const avgTAT = tatCount ? Math.round(tatSum / tatCount) : 0;
    const priority = [...criticalT, ...highT.slice(0, 4)].slice(0, 5);

    let dueMaint = 0, overdueM = 0;
    for (let i = 0; i < P.tasks.length; i++) {
      const t = P.tasks[i];
      if (t.status === "overdue" || t.status === "due-soon") dueMaint++;
      if (t.status === "overdue") overdueM++;
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
      const item = P.inventory[i];
      if (item.qty < item.min) lowStock.push(item);
    }

    let expiringAMC = [];
    for (let i = 0; i < P.vendors.length; i++) {
      const v = P.vendors[i];
      if (v.status === "expiring") expiringAMC.push(v);
    }

    let overdueA = [];
    for (let i = 0; i < P.assets.length; i++) {
      const a = P.assets[i];
      if (a.status === "overdue") overdueA.push(a);
    }

    return { openT, inProgress, resolved, dueMaint, overdueM, openInc, onDuty, totalCost, avgTAT, lowStock, expiringAMC, overdueA, whatsapp, priority, criticalCount: criticalT.length, countsDist: { critical: criticalCountDist, high: highCountDist, medium: mediumCountDist, low: lowCountDist } };
  }, [P.tickets, P.tasks, P.incidents, P.staff, P.inventory, P.vendors, P.assets]);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long",
  });

  const distribution = useMemo(() => (
    ["critical", "high", "medium", "low"].map(p => {
      const cnt = m.countsDist[p];
      const pct = P.tickets.length ? Math.round((cnt / P.tickets.length) * 100) : 0;
      return { p, cnt, pct };
    })
  ), [P.tickets, m.countsDist]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={STAGGER}
      className="font-sans text-zinc-900 max-w-[1400px] mx-auto"
    >
      {/* HEADER — left-aligned, asymmetric, no centering */}
      <motion.div variants={CHILD} className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-10">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-emerald-700 mb-3">
            <BreathDot tone="bg-emerald-500" />
            <span>Live operations</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-zinc-950">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {P.user?.name?.split(" ")[0] || "there"}.
          </h1>
          <p className="mt-1.5 text-[14px] text-zinc-500">{today}</p>
        </div>
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
          transition={SPRING}
          onClick={() => P.goTo("whatsapp")}
          className="group inline-flex items-center gap-2.5 self-start lg:self-auto px-5 py-3 rounded-2xl bg-zinc-950 text-white text-[13px] font-medium hover:bg-zinc-800 transition active:translate-y-[1px] shadow-[0_4px_12px_-4px_rgba(0,0,0,0.2)]"
        >
          <ChatCircleDots size={16} weight="duotone" />
          <span>Report an issue</span>
          <ArrowRight size={13} weight="bold" className="group-hover:translate-x-0.5 transition-transform" />
        </motion.button>
      </motion.div>

      {/* CRITICAL STRIP — Contextual UI archetype, only renders when there's signal */}
      {m.criticalCount > 0 && (
        <motion.button
          variants={CHILD}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.995 }}
          onClick={() => P.goTo("tickets")}
          className="group w-full mb-6 flex items-center justify-between gap-4 px-6 py-4 rounded-3xl bg-rose-50/70 ring-1 ring-rose-200/70 text-left active:translate-y-[1px]"
        >
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className="h-10 w-10 rounded-2xl bg-rose-100 ring-1 ring-rose-200 flex items-center justify-center"
            >
              <Siren size={18} weight="duotone" className="text-rose-700" />
            </motion.div>
            <div>
              <div className="text-[13.5px] font-semibold text-rose-900">
                {m.criticalCount} critical {m.criticalCount === 1 ? "ticket needs" : "tickets need"} attention
              </div>
              <div className="text-[12px] text-rose-700/80">SLA breach risk — review and assign now.</div>
            </div>
          </div>
          <ArrowRight size={16} weight="bold" className="text-rose-700 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      )}

      {/* METRIC ROW — 4 tiles, asymmetric responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricTile icon={Ticket}      label="Open tickets"   value={m.openT}      tone="rose"    onClick={() => P.goTo("tickets")} />
        <MetricTile icon={FlowArrow}   label="In progress"    value={m.inProgress} tone="amber"   onClick={() => P.goTo("tickets")} />
        <MetricTile icon={CheckCircle} label="Resolved"       value={m.resolved}   tone="emerald" onClick={() => P.goTo("tickets")} />
        <MetricTile icon={Users}       label="Staff on duty"  value={`${m.onDuty}/${P.staff.length}`} tone="zinc" onClick={() => P.goTo("team")} />
      </div>

      {/* SECONDARY METRICS — quiet strip with dividers, no card overuse */}
      <motion.div variants={CHILD} className="mb-10 px-6 py-5 rounded-3xl bg-white ring-1 ring-slate-200/60 grid grid-cols-2 lg:grid-cols-4 divide-x divide-slate-100">
        {[
          { icon: Clock,       label: "Avg TAT",      value: `${m.avgTAT}m`,                                tone: "text-zinc-900" },
          { icon: CurrencyInr, label: "Repair spend", value: `${(m.totalCost / 1000).toFixed(1)}K`,         tone: "text-zinc-900" },
          { icon: ChatCircleDots, label: "WhatsApp",  value: m.whatsapp,                                    tone: "text-zinc-900" },
          { icon: Package,     label: "Low stock",    value: m.lowStock.length,                             tone: m.lowStock.length > 0 ? "text-rose-700" : "text-emerald-700" },
        ].map((s, i) => (
          <div key={s.label} className={`flex items-center justify-between gap-3 ${i === 0 ? "pr-5" : "px-5"}`}>
            <div>
              <div className={`font-mono text-xl font-medium tracking-tight ${s.tone}`}>{s.value}</div>
              <div className="text-[10.5px] font-mono uppercase tracking-wider text-zinc-400 mt-1">{s.label}</div>
            </div>
            <s.icon size={18} weight="duotone" className="text-zinc-300" />
          </div>
        ))}
      </motion.div>

      {/* BENTO ROW — 7/5 split: Priority Actions + Alerts column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Intelligent List archetype */}
        <motion.section variants={CHILD} className="lg:col-span-7 p-7 rounded-3xl bg-white ring-1 ring-slate-200/60 shadow-diffuse">
          <header className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-[15px] font-semibold text-zinc-900 tracking-tight">Priority actions</h2>
              <p className="text-[12px] text-zinc-500 mt-0.5">Auto-sorted by severity and SLA risk.</p>
            </div>
            <button
              onClick={() => P.goTo("tickets")}
              className="text-[11.5px] font-medium text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 active:translate-y-[1px]"
            >
              All tickets <ArrowRight size={12} weight="bold" />
            </button>
          </header>
          {m.priority.length > 0 ? (
            <motion.div variants={STAGGER} initial="hidden" animate="visible">
              {m.priority.map(t => (
                <PriorityRow key={t.id} ticket={t} onClick={() => P.goTo("tickets")} />
              ))}
            </motion.div>
          ) : (
            <div className="py-12 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100 mb-3">
                <CheckCircle size={20} weight="duotone" className="text-emerald-600" />
              </div>
              <div className="text-[13px] font-medium text-zinc-700">All clear.</div>
              <div className="text-[11.5px] text-zinc-500 mt-0.5">No critical or high-priority tickets right now.</div>
            </div>
          )}
        </motion.section>

        {/* Live Status archetype */}
        <motion.section variants={CHILD} className="lg:col-span-5 p-7 rounded-3xl bg-white ring-1 ring-slate-200/60 shadow-diffuse">
          <header className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[15px] font-semibold text-zinc-900 tracking-tight">Operational alerts</h2>
              <p className="text-[12px] text-zinc-500 mt-0.5">Items drifting outside their windows.</p>
            </div>
            <Pulse size={18} weight="duotone" className="text-emerald-600" />
          </header>
          <motion.div variants={STAGGER} initial="hidden" animate="visible" className="space-y-2.5">
            {m.overdueM > 0 && (
              <AlertPill count={m.overdueM}              label="Overdue maintenance tasks"   icon={Wrench}    tone="rose"  onClick={() => P.goTo("maintenance")} />
            )}
            {m.overdueA.length > 0 && (
              <AlertPill count={m.overdueA.length}        label="Assets overdue for service"  icon={Warehouse} tone="rose"  onClick={() => P.goTo("assets")} />
            )}
            {m.expiringAMC.length > 0 && (
              <AlertPill count={m.expiringAMC.length}     label="AMCs expiring this month"    icon={Handshake} tone="amber" onClick={() => P.goTo("vendors")} />
            )}
            {m.lowStock.length > 0 && (
              <AlertPill count={m.lowStock.length}        label="Items below reorder level"   icon={Package}   tone="amber" onClick={() => P.goTo("inventory")} />
            )}
            {m.openInc > 0 && (
              <AlertPill count={m.openInc}                label="Open incidents"              icon={Warning}   tone="rose"  onClick={() => P.goTo("incidents")} />
            )}
            {m.overdueM === 0 && m.overdueA.length === 0 && m.expiringAMC.length === 0 && m.lowStock.length === 0 && m.openInc === 0 && (
              <div className="py-10 text-center">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100 mb-2">
                  <CheckCircle size={18} weight="duotone" className="text-emerald-600" />
                </div>
                <div className="text-[12.5px] font-medium text-zinc-700">Nothing flagged.</div>
                <div className="text-[11px] text-zinc-500 mt-0.5">All systems within nominal range.</div>
              </div>
            )}
          </motion.div>
        </motion.section>
      </div>

      {/* WIDE DATA STREAM — recent tickets carousel */}
      {P.tickets.length > 0 && (
        <motion.section variants={CHILD} className="mb-6 p-6 rounded-3xl bg-gradient-to-br from-zinc-950 to-zinc-900 ring-1 ring-zinc-800 text-white shadow-diffuse-md">
          <header className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2.5">
              <Pulse size={16} weight="duotone" className="text-emerald-400" />
              <span className="text-[11.5px] font-mono uppercase tracking-[0.18em] text-zinc-400">Recent activity</span>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">{P.tickets.length} total</span>
          </header>
          <TicketStream tickets={P.tickets} onClick={() => P.goTo("tickets")} />
        </motion.section>
      )}

      {/* BOTTOM ROW — distribution + staff (no card overuse: divide-y, not boxes) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <motion.section variants={CHILD} className="lg:col-span-5 p-7 rounded-3xl bg-white ring-1 ring-slate-200/60 shadow-diffuse">
          <h2 className="text-[15px] font-semibold text-zinc-900 tracking-tight mb-5">Ticket distribution</h2>
          <div className="space-y-4">
            {distribution.map(({ p, cnt, pct }) => {
              const tone = PRIORITY_TONE[p];
              return (
                <div key={p}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                      <span className="text-[12px] capitalize text-zinc-700 font-medium">{p}</span>
                    </div>
                    <div className="flex items-baseline gap-2 font-mono">
                      <span className={`text-[13px] font-semibold ${tone.text}`}>{cnt}</span>
                      <span className="text-[10.5px] text-zinc-400">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ ...SPRING, delay: 0.1 }}
                      className={tone.dot.replace("bg-", "bg-") + " h-full rounded-full"}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        <motion.section variants={CHILD} className="lg:col-span-7 p-7 rounded-3xl bg-white ring-1 ring-slate-200/60 shadow-diffuse">
          <header className="flex items-center justify-between mb-1">
            <h2 className="text-[15px] font-semibold text-zinc-900 tracking-tight">Staff status</h2>
            <button
              onClick={() => P.goTo("team")}
              className="text-[11.5px] font-medium text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 active:translate-y-[1px]"
            >
              View team <ArrowRight size={12} weight="bold" />
            </button>
          </header>
          <div className="divide-y divide-slate-100">
            {P.staff.slice(0, 6).map(s => {
              const initials = s.name.split(" ").map(x => x[0]).slice(0, 2).join("");
              const dotTone = s.status === "available" ? "bg-emerald-500"
                             : s.status === "busy"     ? "bg-amber-500"
                             :                           "bg-zinc-300";
              return (
                <div key={s.id} className="flex items-center justify-between py-3.5">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 ring-1 ring-slate-200 flex items-center justify-center flex-shrink-0">
                      <span className="font-mono text-[11px] font-semibold text-zinc-700">{initials}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold text-zinc-900 truncate">{s.name}</div>
                      <div className="text-[11px] text-zinc-500 truncate">{s.role}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    {s.status === "available" ? <BreathDot tone="bg-emerald-500" /> : <span className={`h-2 w-2 rounded-full ${dotTone}`} />}
                    <SB s={s.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
