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
  { id: "u1", username: "keerthi",    name: "Keerthi Vinod",  email: "keerthivinod@gmail.com",      role: "facility_manager", initials: "KV", dept: "Facility" },
  { id: "u2", username: "rajan",      name: "Rajan Kumar",    email: "rajan@vaidyagrama.com",        role: "technician",       initials: "RK", dept: "Maintenance" },
  { id: "u3", username: "management", name: "Dr. Priya Nair", email: "management@vaidyagrama.com",   role: "management",       initials: "PN", dept: "Management" },
];

const INIT_ASSETS = [];

const INIT_TASKS = [];

const INIT_TICKETS = [];

const INIT_VENDORS = [];

const INIT_INVENTORY = [];

const INIT_INCIDENTS = [];

const INIT_DOCS = [];

const INIT_PROJECTS = [];

const UTILITY_DATA = [];

const NOTIF_LOG = [];

module.exports = {
  TEAM, DEMO_USERS,
  INIT_ASSETS, INIT_TASKS, INIT_TICKETS, INIT_VENDORS, INIT_INVENTORY,
  INIT_INCIDENTS, INIT_DOCS, INIT_PROJECTS, UTILITY_DATA, NOTIF_LOG,
};
