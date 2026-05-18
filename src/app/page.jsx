"use client";
import { useState, useEffect } from "react";
import {
  autoRoute, LoginScreen, PAGES, BNAV, cd, Spinner,
} from "@/lib/data";
import { loadSession } from "@/lib/auth";
import { api } from "@/lib/api";
import { AppContext } from "@/lib/AppContext";

import Ast from "@/components/AssetsModule";
import Mnt from "@/components/MaintenanceModule";
import Tkt from "@/components/TicketsModule";
import Tm from "@/components/StaffModule";
import Ven from "@/components/VendorsModule";
import Inv from "@/components/InventoryModule";
import Inc from "@/components/IncidentsModule";
import PrjModule from "@/components/ProjectsModule";
import DocModule from "@/components/DocumentsModule";
import UtiModule from "@/components/UtilitiesModule";
import StgModule from "@/components/SettingsModule";
import WhatsAppModule from "@/components/WhatsAppModule";
import AIBrainModule from "@/components/AIBrainModule";
import Dash from "@/components/DashboardModule";
import Esc from "@/components/EscalationModule";
import Ntf from "@/components/NotificationsModule";
import Rpt from "@/components/ReportsModule";
import ErrorBoundary from "@/components/ErrorBoundary";

// Read the current URL hash and map it to a known page id, defaulting to "dashboard".
// Enables deep links like /#tickets and browser back/forward navigation.
function getHashPage() {
  if (typeof window === "undefined") return "dashboard";
  const hash = window.location.hash.slice(1);
  return PAGES.some(p => p.id === hash) ? hash : "dashboard";
}

export default function AppWrapper() {
  // undefined = checking session, null = not logged in, object = logged in
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    setUser(loadSession());
  }, []);

  if (user === undefined) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1e1b4b,#312e81,#1e1b4b)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Spinner />
    </div>
  );
  if (!user) return <LoginScreen onLogin={setUser} />;
  return <Layout user={user} setUser={setUser} />;
}


function useAppData(user, setUser) {
  const [active, setActive] = useState(getHashPage);
  const [tst, setTst] = useState(null);

  // Sync active page with browser back / forward buttons
  useEffect(() => {
    const onHashChange = () => setActive(getHashPage());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const [assets, setAssets] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [staff, setStaff] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [docs, setDocs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [utilities, setUtilities] = useState([]);
  const [profile, setProfile] = useState({ ...user });
  const [bootState, setBootState] = useState("loading");

  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      try {
        const [a, m, t, v, inv, inc, d, p, u, n, tm] = await Promise.all([
          api.get("assets"), api.get("maintenance"), api.get("tickets"),
          api.get("vendors"), api.get("inventory"), api.get("incidents"),
          api.get("documents"), api.get("projects"), api.get("utilities"),
          api.get("notifications"), api.get("team"),
        ]);
        if (!alive) return;
        setAssets(a); setTasks(m); setTickets(t); setVendors(v);
        setInventory(inv); setIncidents(inc); setDocs(d); setProjects(p);
        setUtilities(u); setNotifs(n); setStaff(tm);
        setBootState("ready");
      } catch {
        if (alive) setBootState("error");
      }
    })();
    return () => { alive = false; };
  }, [user]);

  const showToast = (m, type = "success") => {
    setTst({ m, type });
    setTimeout(() => setTst(null), 3000);
  };

  const createTicket = async (input) => {
    const route = autoRoute(input.problem || "");
    const optimistic = { id: `T_${Date.now()}`, ...input, status: "open",
      assignee: route.person, assigneeId: route.id, escLevel: 1,
      createdAt: new Date().toISOString() };
    setTickets(prev => [optimistic, ...prev]);
    try {
      const saved = await api.post("tickets", optimistic);
      setTickets(prev => prev.map(t => t.id === optimistic.id ? saved : t));
    } catch {
      setTickets(prev => prev.filter(t => t.id !== optimistic.id));
      showToast("Failed to save ticket", "error");
    }
  };

  const updateTicket = async (id, patch) => {
    const before = tickets.find(t => t.id === id);
    setTickets(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
    try {
      const saved = await api.put("tickets", id, patch);
      setTickets(prev => prev.map(t => t.id === id ? saved : t));
    } catch {
      if (before) setTickets(prev => prev.map(t => t.id === id ? before : t));
      showToast("Update failed", "error");
    }
  };

  const goTo = (page) => {
    window.location.hash = page;  // triggers hashchange → setActive
    setActive(page);              // also update immediately to avoid flicker
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const dbReady = bootState === "ready";
  const isManager = user?.role === "facility_manager";
  const MANAGER_ONLY_PAGES = ["escalation", "reports", "vendors", "projects"];
  const filteredPages = isManager ? PAGES : PAGES.filter(p => !MANAGER_ONLY_PAGES.includes(p.id));

  const locked = (
    <div style={cd({ textAlign: "center", padding: 32 })}>
      <div style={{ fontSize: 36, marginBottom: 8 }}>{"\u{1F512}"}</div>
      <div style={{ fontSize: 14, fontWeight: 700 }}>Facility Manager Access Only</div>
      <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Contact your facility manager for access.</div>
    </div>
  );

  const P = {
    user, setUser, profile, setProfile,
    assets, setAssets,
    tasks, setTasks,
    tickets, setTickets,
    inventory, setInventory,
    staff, setStaff,
    vendors, setVendors,
    incidents, setIncidents,
    docs, setDocs,
    projects, setProjects,
    utilities, setUtilities,
    notifs, setNotifs,
    showToast, goTo, isManager, dbReady,
    createTicket, updateTicket,
  };

  const R = {
    dashboard:    <Dash P={P} />,
    assets:       <Ast {...P} />,
    maintenance:  <Mnt {...P} />,
    tickets:      <Tkt {...P} />,
    team:         <Tm {...P} />,
    vendors:      isManager ? <Ven {...P} /> : locked,
    inventory:    <Inv {...P} />,
    incidents:    <Inc {...P} />,
    whatsapp:     <WhatsAppModule tickets={tickets} setTickets={setTickets} staff={staff} showToast={showToast} />,
    escalation:   isManager ? <Esc P={P} /> : locked,
    brain:        <AIBrainModule tickets={tickets} assets={assets} tasks={tasks} incidents={incidents} staff={staff} vendors={vendors} inventory={inventory} showToast={showToast} user={user} />,
    notifications: <Ntf P={P} />,
    projects:     isManager ? <PrjModule {...P} /> : locked,
    documents:    <DocModule {...P} />,
    utilities:    <UtiModule {...P} />,
    settings:     <StgModule {...P} />,
    reports:      isManager ? <Rpt P={P} /> : locked,
  };

  const pageLabel = PAGES.find(p => p.id === active)?.label || "FacilityOps";

  return { active, P, filteredPages, bootState, pageLabel, tst, R, goTo, notifs, dbReady };
}

function Sidebar({ filteredPages, active, goTo, user }) {
  return (
<aside className="fo-sidebar" aria-label="Main navigation">
  <div className="fo-sidebar-brand">
    <div className="fo-sidebar-brand-icon">{"\u{1F3D7}️"}</div>
    <div>FacilityOps</div>
  </div>
  <nav className="fo-sidebar-nav">
    {filteredPages.map(p => {
      const act = active === p.id;
      return (
        <button key={p.id}
          className={"fo-sidebar-item" + (act ? " fo-sidebar-item--active" : "")}
          onClick={() => goTo(p.id)}
          aria-current={act ? "page" : undefined}>
          <span className="fo-sidebar-icon" aria-hidden="true">{p.icon}</span>
          <span className="fo-sidebar-label">{p.label}</span>
        </button>
      );
    })}
  </nav>
  <div className="fo-sidebar-footer">
    <div className="fo-sidebar-user-name">{user.name}</div>
    <div className="fo-sidebar-user-role">{user.role.replace("_", " ").toUpperCase()}</div>
  </div>
</aside>
  );
}

function Header({ user, pageLabel, dbReady, notifs, goTo }) {
  return (
  <>
  {/* Header */}
  <div className="fo-header">
    <div>
      <div className="fo-header-user">{user.name} {"\u2022"} {user.role.replace("_", " ").toUpperCase()}</div>
      <div className="fo-header-title">
        {pageLabel}
        {!dbReady && <span className="fo-sync-dot" aria-label="Syncing data" title="Syncing data…" />}
      </div>
    </div>
    <div style={{ display: "flex", gap: 12 }}>
      <button className="fo-header-btn" onClick={() => goTo("notifications")}
        aria-label={`Notifications${notifs.filter(n => !n.read).length > 0 ? `, ${notifs.filter(n => !n.read).length} unread` : ""}`}>
        {"\u{1F514}"}
        {notifs.filter(n => !n.read).length > 0 && (
          <span className="fo-notif-dot" aria-hidden="true">{notifs.filter(n => !n.read).length}</span>
        )}
      </button>
      <button className="fo-header-btn fo-header-menu-btn" aria-label="Open module menu" aria-haspopup="dialog"
        onClick={() => document.getElementById("menu").style.display = "flex"}>
        {"\u2630"}
      </button>
    </div>
  </div>
  </>
  );
}

function BottomNav({ active, goTo }) {
  return (
  <>
  {/* Bottom Nav */}
  <nav className="fo-bottom-nav" aria-label="Main navigation">
    {BNAV.map(id => {
      const p = PAGES.find(x => x.id === id);
      const act = active === id;
      return (
        <button key={id} className="fo-bnav-btn" onClick={() => goTo(id)}
          style={{ color: act ? "#4f46e5" : "#64748b" }}
          aria-label={p.label} aria-current={act ? "page" : undefined}>
          <div className={"fo-bnav-icon" + (act ? " fo-bnav-icon--active" : "")} aria-hidden="true">{p.icon}</div>
          <div className="fo-bnav-label" style={{ fontWeight: act ? 800 : 600 }}>{p.label.split(" ")[0]}</div>
        </button>
      );
    })}
  </nav>
  </>
  );
}

function MenuOverlay({ filteredPages, goTo }) {
  return (
  <>
  {/* Full Menu Overlay */}
  <div id="menu" className="fo-menu-overlay" role="dialog" aria-modal="true" aria-label="All modules">
    <div style={{ padding: "20px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ color: "#fff", fontSize: 24, fontWeight: 800 }}>All Modules</div>
      <button aria-label="Close menu"
        onClick={() => document.getElementById("menu").style.display = "none"}
        style={{ background: "rgba(255,255,255,.1)", width: 40, height: 40, borderRadius: 20, color: "#fff", fontSize: 20, border: "none", cursor: "pointer" }}>{"\u2715"}</button>
    </div>
    <div className="fo-menu-grid" role="list">
      {filteredPages.map(p => (
        <button key={p.id} className="fo-menu-item" role="listitem"
          aria-label={p.label}
          onClick={() => { goTo(p.id); document.getElementById("menu").style.display = "none"; }}>
          <div style={{ fontSize: 28 }} aria-hidden="true">{p.icon}</div>
          <div style={{ fontSize: 11, fontWeight: 700, textAlign: "center" }}>{p.label}</div>
        </button>
      ))}
    </div>
  </div>
  </>
  );
}
function Layout({ user, setUser }) {
  const { active, P, filteredPages, bootState, pageLabel, tst, R, goTo, notifs, dbReady } = useAppData(user, setUser);


  if (bootState === "loading") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1e1b4b,#312e81,#1e1b4b)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <Spinner />
      <div style={{ color: "#a5b4fc", fontSize: 14 }}>Loading facility data&hellip;</div>
    </div>
  );

  if (bootState === "error") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1e1b4b,#312e81,#1e1b4b)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, padding: 16 }}>
      <div style={{ fontSize: 36 }}>⚠️</div>
      <div style={{ color: "#fca5a5", fontSize: 14, textAlign: "center" }}>Failed to load data. Check your connection and try again.</div>
      <button onClick={() => window.location.reload()} style={{ padding: "10px 24px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 600 }}>Retry</button>
    </div>
  );

  return (
    <AppContext.Provider value={P}>
      <Sidebar filteredPages={filteredPages} active={active} goTo={goTo} user={user} />
    <div className="fo-shell">
      {tst && (
        <div className={`fo-toast fo-toast--${tst.type || "success"}`}>
          {tst.m}
        </div>
      )}

      {/* Header */}
      <Header user={user} pageLabel={pageLabel} dbReady={dbReady} notifs={notifs} goTo={goTo} />

      {/* Main Content — key resets the error boundary on every navigation */}
      <main className="fo-content">
        <ErrorBoundary key={active}>
          {R[active]}
        </ErrorBoundary>
      </main>

      {/* Bottom Nav */}
      <BottomNav active={active} goTo={goTo} />

      {/* Full Menu Overlay */}
      <MenuOverlay filteredPages={filteredPages} goTo={goTo} />
    </div>
    </AppContext.Provider>
  );
}
