// Pure data constants — no React/JSX.
// Used by scripts/seed.js (Node.js) and re-exported from data.js for the frontend.

const TEAM = [
  { id: "S01", name: "Rajesh M",      role: "Plumber",          level: 1, phone: "9876001001", skills: ["plumbing","water","pipe","leak","drain","tap","flush","bathroom","toilet"], icon: "🔧", tasksCompleted: 47, avgTAT: 32, rating: 4.2, status: "available" },
  { id: "S02", name: "Murugan K",     role: "Carpenter",         level: 1, phone: "9876001002", skills: ["wood","furniture","chair","door","table","cabinet","shelf","window","lock"], icon: "🪚", tasksCompleted: 38, avgTAT: 45, rating: 4.0, status: "available" },
  { id: "S03", name: "Rajan Kumar",   role: "Electrician",       level: 1, phone: "9876001003", skills: ["power","electric","switch","light","fan","wiring","mcb","socket","ac","generator"], icon: "⚡", tasksCompleted: 62, avgTAT: 28, rating: 4.5, status: "busy" },
  { id: "S04", name: "Suresh P",      role: "Electrician",       level: 1, phone: "9876001004", skills: ["power","electric","elevator","ups","motor"], icon: "⚡", tasksCompleted: 55, avgTAT: 35, rating: 4.3, status: "available" },
  { id: "S05", name: "Arun M",        role: "IT Support",        level: 1, phone: "9876001005", skills: ["network","internet","wifi","computer","printer","server","cctv","camera"], icon: "💻", tasksCompleted: 41, avgTAT: 22, rating: 4.6, status: "available" },
  { id: "S06", name: "Vinod R",       role: "Helper",            level: 1, phone: "9876001006", skills: ["cleaning","garbage","pest","garden","painting"], icon: "🧹", tasksCompleted: 73, avgTAT: 18, rating: 3.9, status: "available" },
  { id: "S07", name: "Kumar S",       role: "Helper",            level: 1, phone: "9876001007", skills: ["cleaning","garbage","shifting"], icon: "🧹", tasksCompleted: 68, avgTAT: 20, rating: 3.8, status: "on-leave" },
  { id: "S08", name: "Lakshmi N",     role: "Facility Admin",    level: 2, phone: "9876001008", skills: [], icon: "📋", tasksCompleted: 0, avgTAT: 0, rating: 0, status: "available" },
  { id: "S09", name: "Keerthi Vinod", role: "Facility Manager",  level: 3, phone: "9047017526", skills: [], icon: "👔", tasksCompleted: 0, avgTAT: 0, rating: 0, status: "available" },
];

const DEMO_USERS = [
  { id: "u1", name: "Keerthi Vinod",  email: "keerthivinod@gmail.com",      role: "facility_manager", initials: "KV", dept: "Facility" },
  { id: "u2", name: "Rajan Kumar",    email: "rajan@vaidyagrama.com",        role: "technician",       initials: "RK", dept: "Maintenance" },
  { id: "u3", name: "Dr. Priya Nair", email: "management@vaidyagrama.com",   role: "management",       initials: "PN", dept: "Management" },
];

const DEMO_CREDENTIALS = [
  { username: "keerthi",    email: "keerthivinod@gmail.com",    password: "facility123" },
  { username: "rajan",      email: "rajan@vaidyagrama.com",      password: "electrician123" },
  { username: "management", email: "management@vaidyagrama.com", password: "admin123" },
];

const INIT_ASSETS = [
  { id: "A001", code: "A001", name: "Diesel Generator (125kVA)",  cat: "Power",      icon: "⚡",  loc: "Generator Room",    status: "overdue",   last: "2024-11-15", next: "2025-02-15", vendor: "Kirloskar",       amc: true,  interval: 90,  model: "KG1-125AS",       serial: "KIR-2020-4521", install: "2020-03-10", warranty: "2023-03-10", critical: true,  qr: "FO-A001-GEN"  },
  { id: "A002", code: "A002", name: "Main Water Pump (Grundfos)", cat: "Plumbing",   icon: "💧",  loc: "Pump House",         status: "due-soon",  last: "2024-10-01", next: "2025-03-12", vendor: "Grundfos",        amc: true,  interval: 90,  model: "CM10-4",           serial: "GRU-2019-1190", install: "2019-06-15", warranty: "2022-06-15", critical: true,  qr: "FO-A002-PUMP" },
  { id: "A003", code: "A003", name: "AC Unit OPD Block (5T)",     cat: "HVAC",       icon: "❄️",  loc: "OPD Block",          status: "overdue",   last: "2024-08-01", next: "2025-02-01", vendor: "Daikin",          amc: false, interval: 180, model: "FTKF60TV16U",      serial: "DAI-2021-3341", install: "2021-11-20", warranty: "2024-11-20", critical: false, qr: "FO-A003-AC"   },
  { id: "A004", code: "A004", name: "120kW Solar PV System",      cat: "Power",      icon: "☀️",  loc: "Rooftop",            status: "healthy",   last: "2025-02-01", next: "2025-05-01", vendor: "Tata Power Solar", amc: true,  interval: 90,  model: "430W Mono",        serial: "TPS-2023-0901", install: "2023-09-01", warranty: "2033-09-01", critical: false, qr: "FO-A004-SOL"  },
  { id: "A005", code: "A005", name: "Ambulance KA19-F5432",       cat: "Vehicle",    icon: "🚑",  loc: "Parking Bay",        status: "overdue",   last: "2024-12-01", next: "2025-03-01", vendor: "Force Motors",    amc: false, interval: 90,  model: "Traveller ICU",    serial: "FORC-2022-3312", install: "2022-01-15", warranty: "2025-01-15", critical: true,  qr: "FO-A005-AMB"  },
  { id: "A006", code: "A006", name: "Kitchen Boiler (Thermax)",   cat: "Mechanical", icon: "🔥",  loc: "Kitchen Block",      status: "healthy",   last: "2025-01-20", next: "2025-07-20", vendor: "Thermax",         amc: true,  interval: 180, model: "ThermoWave 250",   serial: "THX-2018-2201", install: "2018-04-10", warranty: "2021-04-10", critical: false, qr: "FO-A006-BLR"  },
  { id: "A007", code: "A007", name: "CCTV System (32 Cameras)",   cat: "Security",   icon: "📹",  loc: "Admin Block",        status: "healthy",   last: "2025-02-15", next: "2025-08-15", vendor: "Hikvision",       amc: true,  interval: 180, model: "DS-7732NI-K4",     serial: "HIK-2022-7732", install: "2022-07-01", warranty: "2025-07-01", critical: false, qr: "FO-A007-CCTV" },
  { id: "A008", code: "A008", name: "Elevator Main Block (6P)",   cat: "Mechanical", icon: "🛗",  loc: "Main Block",         status: "overdue",   last: "2024-07-01", next: "2025-01-01", vendor: "KONE",            amc: true,  interval: 180, model: "MonoSpace 500",    serial: "KONE-2020-5011", install: "2020-08-15", warranty: "2023-08-15", critical: true,  qr: "FO-A008-LIFT" },
  { id: "A009", code: "A009", name: "RO Water Plant (2000 LPH)",  cat: "Water",      icon: "🏭",  loc: "Utility Block",      status: "healthy",   last: "2025-02-01", next: "2025-05-01", vendor: "Ion Exchange",    amc: true,  interval: 90,  model: "NFRES-2000",       serial: "ION-2021-0320", install: "2021-03-20", warranty: "2024-03-20", critical: false, qr: "FO-A009-RO"   },
  { id: "A010", code: "A010", name: "Fire Safety System",         cat: "Safety",     icon: "🛡️", loc: "All Blocks",         status: "due-soon",  last: "2024-11-01", next: "2025-03-15", vendor: "Minimax",         amc: true,  interval: 90,  model: "MX-1200",          serial: "MMX-2019-1201", install: "2019-12-01", warranty: "2022-12-01", critical: true,  qr: "FO-A010-FIRE" },
  { id: "A011", code: "A011", name: "250kVA Transformer",         cat: "Power",      icon: "⚡",  loc: "Electrical Room",    status: "healthy",   last: "2024-12-15", next: "2025-06-15", vendor: "ABB",             amc: true,  interval: 180, model: "ONAN-250",         serial: "ABB-2017-2504", install: "2017-05-10", warranty: "2020-05-10", critical: true,  qr: "FO-A011-TX"   },
  { id: "A012", code: "A012", name: "STP Sewage Treatment",       cat: "Mechanical", icon: "♻️",  loc: "Rear Block",         status: "healthy",   last: "2025-01-05", next: "2025-04-05", vendor: "Puratech",        amc: true,  interval: 90,  model: "PT-STP-50",        serial: "PUR-2020-5010", install: "2020-11-01", warranty: "2023-11-01", critical: false, qr: "FO-A012-STP"  },
];

const INIT_TASKS = [
  { id: "M001", assetId: "A001", asset: "Diesel Generator",  task: "Monthly run test + oil level + coolant check",          assignee: "Rajan Kumar",  assigneeId: "S03", due: "2025-03-01", status: "overdue",   freq: "Monthly",     priority: "high",     cat: "Power"      },
  { id: "M002", assetId: "A002", asset: "Water Pump",        task: "Bearing inspection + impeller check + lubrication",      assignee: "Suresh P",     assigneeId: "S04", due: "2025-03-12", status: "due-soon",  freq: "Quarterly",   priority: "high",     cat: "Plumbing"   },
  { id: "M003", assetId: "A008", asset: "Elevator",          task: "KONE inspection + door sensor calibration",              assignee: "KONE Eng",     assigneeId: null,  due: "2025-03-08", status: "overdue",   freq: "Half-Yearly", priority: "critical", cat: "Mechanical" },
  { id: "M004", assetId: "A004", asset: "Solar PV",          task: "Panel cleaning + inverter check",                        assignee: "Arun M",       assigneeId: "S05", due: "2025-03-20", status: "upcoming",  freq: "Monthly",     priority: "medium",   cat: "Power"      },
  { id: "M005", assetId: "A009", asset: "RO Plant",          task: "Filter replacement + TDS test",                          assignee: "Rajan Kumar",  assigneeId: "S03", due: "2025-03-25", status: "upcoming",  freq: "Quarterly",   priority: "medium",   cat: "Water"      },
  { id: "M006", assetId: "A010", asset: "Fire Safety",       task: "Sprinkler + extinguisher + hydrant test",                assignee: "Suresh P",     assigneeId: "S04", due: "2025-03-15", status: "due-soon",  freq: "Quarterly",   priority: "high",     cat: "Safety"     },
  { id: "M007", assetId: "A006", asset: "Kitchen Boiler",    task: "Pressure valve test + descaling",                        assignee: "Rajan Kumar",  assigneeId: "S03", due: "2025-04-01", status: "scheduled", freq: "Half-Yearly", priority: "medium",   cat: "Mechanical" },
  { id: "M008", assetId: "A005", asset: "Ambulance",         task: "Full service + tyre + brake check",                      assignee: "Rajan Kumar",  assigneeId: "S03", due: "2025-03-01", status: "overdue",   freq: "Quarterly",   priority: "high",     cat: "Vehicle"    },
  { id: "M009", assetId: "A011", asset: "Transformer",       task: "Oil BDV test + IR measurement",                          assignee: "Suresh P",     assigneeId: "S04", due: "2025-04-15", status: "scheduled", freq: "Half-Yearly", priority: "medium",   cat: "Power"      },
  { id: "M010", assetId: "A012", asset: "STP",               task: "Aeration + sludge removal + effluent test",              assignee: "Arun M",       assigneeId: "S05", due: "2025-03-30", status: "upcoming",  freq: "Monthly",     priority: "low",      cat: "Mechanical" },
  { id: "M011", assetId: "A003", asset: "AC Unit OPD",       task: "Filter clean + gas pressure + thermostat",               assignee: "Rajan Kumar",  assigneeId: "S03", due: "2025-02-01", status: "overdue",   freq: "Quarterly",   priority: "high",     cat: "HVAC"       },
  { id: "M012", assetId: "A007", asset: "CCTV System",       task: "Camera alignment + backup test",                         assignee: "Arun M",       assigneeId: "S05", due: "2025-04-20", status: "scheduled", freq: "Half-Yearly", priority: "low",      cat: "Security"   },
];

const INIT_TICKETS = [
  { id: "T001", asset: "AC Unit OPD Block",   problem: "Not cooling. Compressor grinding noise. Patients complaining.",                     priority: "high",     status: "open",        by: "Dr. Priya Nair",     assignee: null,      assigneeId: null,  date: "2025-03-05", cost: null, loc: "OPD Block",        createdAt: "2025-03-05T09:30:00", startedAt: null,                  resolvedAt: null,                 escLevel: 2, escLog: ["09:30 Auto → Suresh P (Electrician)","09:50 L2 alert → Lakshmi N"],                                                source: "app",      tatMins: null, category: "HVAC"       },
  { id: "T002", asset: "Elevator Main Block", problem: "Door sensor failure. Patients stuck twice. Safety risk.",                           priority: "critical", status: "in-progress", by: "Nurse Meera",        assignee: "Suresh P", assigneeId: "S04", date: "2025-03-06", cost: 4500, loc: "Main Block",       createdAt: "2025-03-06T08:15:00", startedAt: "2025-03-06T08:22:00", resolvedAt: null,                 escLevel: 1, escLog: ["08:15 Auto → Suresh P","08:22 Work started (7m)"],                                                        source: "whatsapp", tatMins: 7,    category: "Mechanical" },
  { id: "T003", asset: "Water Pump Main",     problem: "Low water pressure Block B/C. Third floor barely getting water.",                  priority: "medium",   status: "open",        by: "Keerthi Vinod",      assignee: "Rajesh M", assigneeId: "S01", date: "2025-03-07", cost: null, loc: "Block B/C",        createdAt: "2025-03-07T07:45:00", startedAt: null,                  resolvedAt: null,                 escLevel: 1, escLog: ["07:45 Auto → Rajesh M (Plumber) via 'water pressure'"],                                                      source: "whatsapp", tatMins: null, category: "Plumbing"   },
  { id: "T004", asset: "CCTV System",         problem: "Camera 4 offline. Blind spot.",                                                    priority: "low",      status: "resolved",    by: "Security Murugan",   assignee: "Arun M",  assigneeId: "S05", date: "2025-03-01", cost: 800,  loc: "Main Entrance",    createdAt: "2025-03-01T14:00:00", startedAt: "2025-03-01T14:08:00", resolvedAt: "2025-03-01T14:35:00", escLevel: 0, escLog: ["14:00 Auto → Arun M (IT)","14:08 Started","14:35 Resolved (27m)"],                                          source: "app",      tatMins: 27,   category: "IT", resolution: "BNC connector replaced." },
  { id: "T005", asset: "Diesel Generator",    problem: "Vibration and white smoke on startup. Possibly fuel contamination.",               priority: "high",     status: "open",        by: "Electrician Mohan",  assignee: null,      assigneeId: null,  date: "2025-03-08", cost: null, loc: "Generator Room",   createdAt: "2025-03-08T06:30:00", startedAt: null,                  resolvedAt: null,                 escLevel: 3, escLog: ["06:30 Auto → Rajan Kumar","06:50 L2 → Lakshmi N","07:30 L3 SLA breach → Keerthi Vinod"], source: "whatsapp", tatMins: null, category: "Electrical" },
];

const INIT_VENDORS = [
  { id: "V001", name: "Kirloskar Electric",  contact: "Ramesh Babu",    phone: "9876543210", email: "service@kirloskar.com",   cat: "Generator", amcEnd: "2025-06-30", amcVal: 45000,  status: "active",   lastVisit: "2025-01-15" },
  { id: "V002", name: "KONE Elevators",      contact: "Pradeep Sharma", phone: "9988776655", email: "service.blr@kone.com",    cat: "Elevator",  amcEnd: "2025-04-15", amcVal: 85000,  status: "expiring", lastVisit: "2024-10-20" },
  { id: "V003", name: "Tata Power Solar",    contact: "Ananya Rao",     phone: "9876512345", email: "solar@tata.com",          cat: "Solar",     amcEnd: "2026-09-01", amcVal: 120000, status: "active",   lastVisit: "2025-02-01" },
  { id: "V004", name: "Minimax Fire Safety", contact: "Sunil Krishnan", phone: "9123456789", email: "service@minimax.in",      cat: "Safety",    amcEnd: "2025-05-20", amcVal: 32000,  status: "active",   lastVisit: "2024-11-01" },
  { id: "V005", name: "Grundfos Pumps",      contact: "Vikram Nair",    phone: "9867452310", email: "service@grundfos.in",     cat: "Plumbing",  amcEnd: "2025-08-10", amcVal: 28000,  status: "active",   lastVisit: "2024-10-01" },
  { id: "V006", name: "Ion Exchange",        contact: "Dr. Ramesh P",   phone: "9012345678", email: "service@ionexchange.com", cat: "Water",     amcEnd: "2025-03-20", amcVal: 35000,  status: "expiring", lastVisit: "2025-02-01" },
];

const INIT_INVENTORY = [
  { id: "I001", name: "Air Filter AC",      qty: 8,   min: 5,   unit: "pcs", vendor: "Daikin",       cost: 450,  loc: "Store A"     },
  { id: "I002", name: "Engine Oil 15W40",   qty: 12,  min: 20,  unit: "L",   vendor: "Castrol",      cost: 180,  loc: "Store B"     },
  { id: "I003", name: "RO Membrane",        qty: 2,   min: 3,   unit: "pcs", vendor: "Ion Exchange",  cost: 1200, loc: "Store A"     },
  { id: "I004", name: "Pump Bearings SKF",  qty: 4,   min: 2,   unit: "set", vendor: "SKF",           cost: 850,  loc: "Store B"     },
  { id: "I005", name: "Fire Ext. CO2 5kg",  qty: 6,   min: 4,   unit: "pcs", vendor: "Minimax",       cost: 1800, loc: "Store C"     },
  { id: "I006", name: "Diesel Reserve",     qty: 150, min: 200, unit: "L",   vendor: "IOCL",          cost: 89,   loc: "Fuel Tank"   },
  { id: "I007", name: "BNC Connectors",     qty: 25,  min: 10,  unit: "pcs", vendor: "Hikvision",     cost: 15,   loc: "Store A"     },
  { id: "I008", name: "MCB 32A Legrand",    qty: 8,   min: 5,   unit: "pcs", vendor: "Legrand",       cost: 320,  loc: "Elec. Store" },
  { id: "I009", name: "Boiler Chemical",    qty: 1,   min: 3,   unit: "kg",  vendor: "Thermax",       cost: 2200, loc: "Store B"     },
  { id: "I010", name: "V-Belt A42",         qty: 3,   min: 2,   unit: "pcs", vendor: "Gates",         cost: 380,  loc: "Store B"     },
];

const INIT_INCIDENTS = [
  { id: "INC001", type: "Power Failure",    loc: "Block B",            sev: "high",   desc: "Total power failure 45 min. Generator delayed 3 min (low fuel). 2 surgeries rescheduled.", by: "Keerthi Vinod",       date: "2025-02-14", status: "closed",        rca: "MCB in DB-B tripped (overload). Generator low-fuel delay.",                                           preventive: "1. Daily diesel check added 2. MCB upgraded 32A→63A 3. Weekly auto-start test" },
  { id: "INC002", type: "Water Leak",       loc: "OPD Corridor",       sev: "medium", desc: "GI pipe leak near reception. Slippery floor. Patient near-slip.",                          by: "Reception Lakshmi",   date: "2025-03-01", status: "resolved",      rca: "25-year GI pipe corroded at elbow. Replaced with CPVC.",                                             preventive: "1. All GI pipes flagged for CPVC replacement 2. Monthly visual inspection added" },
  { id: "INC003", type: "Lift Entrapment",  loc: "Main Block Floor 2", sev: "high",   desc: "2 patients + 1 staff stuck 12 min. Manual release. KONE called.",                          by: "Security Murugan",    date: "2025-03-06", status: "investigating", rca: "Pending KONE inspection.",                                                                            preventive: "" },
];

const INIT_DOCS = [
  { id: "D001", name: "NABH Policy v2.1",             type: "policy",      uploaded: "2025-01-10", expiry: "2026-01-10", size: "1.2 MB" },
  { id: "D002", name: "Generator AMC Kirloskar",       type: "amc",         uploaded: "2024-07-01", expiry: "2025-06-30", size: "0.8 MB" },
  { id: "D003", name: "Elevator PESO Certificate",     type: "certificate", uploaded: "2024-01-15", expiry: "2025-01-15", size: "0.4 MB" },
  { id: "D004", name: "Fire NOC Certificate",          type: "certificate", uploaded: "2023-11-01", expiry: "2024-11-01", size: "0.3 MB" },
  { id: "D005", name: "Solar Commissioning Report",    type: "inspection",  uploaded: "2023-09-15", expiry: null,         size: "3.1 MB" },
  { id: "D006", name: "Maintenance Log 2024",          type: "log",         uploaded: "2025-01-05", expiry: null,         size: "5.4 MB" },
  { id: "D007", name: "Boiler IBR Certificate",        type: "certificate", uploaded: "2024-04-10", expiry: "2026-04-10", size: "0.6 MB" },
];

const INIT_PROJECTS = [
  { id: "P001", name: "CPVC Pipe Replacement OPD",      status: "in-progress", budget: 180000,  spent: 65000,  start: "2025-03-01", end: "2025-04-30", lead: "Rajesh M",  progress: 35, priority: "high"     },
  { id: "P002", name: "Solar Expansion Phase 2 (80kW)", status: "planned",     budget: 4500000, spent: 0,      start: "2025-06-01", end: "2025-09-30", lead: "Arun M",    progress: 0,  priority: "medium"   },
  { id: "P003", name: "Fire Safety Upgrade NABH",       status: "in-progress", budget: 320000,  spent: 210000, start: "2025-01-15", end: "2025-03-31", lead: "Suresh P",  progress: 70, priority: "critical" },
];

const UTILITY_DATA = [
  { m: "Oct", grid: 4200, solar: 3800, water: 420, diesel: 180 },
  { m: "Nov", grid: 3900, solar: 3200, water: 380, diesel: 160 },
  { m: "Dec", grid: 4100, solar: 2900, water: 350, diesel: 190 },
  { m: "Jan", grid: 3800, solar: 3500, water: 360, diesel: 140 },
  { m: "Feb", grid: 3600, solar: 3800, water: 340, diesel: 130 },
  { m: "Mar", grid: 3200, solar: 4100, water: 320, diesel: 110 },
];

const NOTIF_LOG = [
  { id: "N01", userId: "u1", title: "🚨 Overdue: Generator monthly check",    body: "M001 overdue 8 days. Rajan Kumar.",               type: "maintenance", channel: "push",      isRead: false },
  { id: "N02", userId: "u1", title: "⏫ L3 Escalation: Generator vibration",  body: "T005 unresolved 60+ min. SLA breach → Facility Manager.", type: "escalation",  channel: "push",      isRead: false },
  { id: "N03", userId: "u1", title: "📦 Low Stock: Engine Oil",               body: "12/20 liters. Reorder now.",                      type: "inventory",   channel: "push",      isRead: true  },
  { id: "N04", userId: "u1", title: "📋 AMC Expiring: KONE Elevators",        body: "Expires 2025-04-15 (37 days).",                   type: "amc",         channel: "push",      isRead: true  },
  { id: "N05", userId: "u1", title: "🔔 Maintenance Tomorrow: Fire Safety",   body: "Quarterly inspection. Suresh P.",                  type: "maintenance", channel: "push",      isRead: true  },
  { id: "N06", userId: "u1", title: "💬 WhatsApp Ticket: Water pressure",     body: "Auto-created → Rajesh M (Plumber).",              type: "whatsapp",    channel: "whatsapp",  isRead: true  },
];

module.exports = {
  TEAM, DEMO_USERS, DEMO_CREDENTIALS,
  INIT_ASSETS, INIT_TASKS, INIT_TICKETS, INIT_VENDORS, INIT_INVENTORY,
  INIT_INCIDENTS, INIT_DOCS, INIT_PROJECTS, UTILITY_DATA, NOTIF_LOG,
};
