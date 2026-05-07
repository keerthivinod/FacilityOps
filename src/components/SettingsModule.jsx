import { useState } from "react";
import { cd, Badge } from "@/lib/data";
import { Modal } from "./Modal";
import { signOut } from "@/lib/auth";

const ROLES = ["facility_manager", "technician", "management", "admin", "viewer"];
const ROLE_COLORS = {
    facility_manager: ["#4f46e5", "#eff6ff"],
    technician: ["#16a34a", "#f0fdf4"],
    management: ["#7c3aed", "#f5f3ff"],
    admin: ["#dc2626", "#fef2f2"],
    viewer: ["#6b7280", "#f9fafb"],
};

export default function Stg({ user, showToast, isManager, setUser }) {
    const [tab, setTab] = useState("profile");
    const [users, setUsers] = useState([
        { id: "u1", name: "Keerthi Vinod", email: "keerthivinod@gmail.com", role: "facility_manager", initials: "KV", dept: "Facility", phone: "" },
        { id: "u2", name: "Rajan Kumar", email: "rajan@vaidyagrama.com", role: "technician", initials: "RK", dept: "Maintenance", phone: "" },
        { id: "u3", name: "Dr. Priya Nair", email: "management@vaidyagrama.com", role: "management", initials: "PN", dept: "Management", phone: "" },
    ]);
    const [profile, setProfile] = useState({ ...user });
    const [profileEdit, setProfileEdit] = useState(false);

    const [showUserForm, setShowUserForm] = useState(false);
    const [userForm, setUserForm] = useState(null);

    const saveProfile = () => {
        if (!profile.name) { showToast("Name required", "error"); return; }
        setProfileEdit(false);
        showToast("Profile updated");
    };

    const handleAddUser = () => {
        setUserForm({ name: "", email: "", role: "technician", dept: "", phone: "", initials: "" });
        setShowUserForm(true);
    };

    const handleEditUser = (u) => {
        setUserForm({ ...u });
        setShowUserForm(true);
    };

    const saveUser = () => {
        if (!userForm.name || !userForm.email) { showToast("Name and email required", "error"); return; }
        const initials = userForm.initials || userForm.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
        if (userForm.id) {
            setUsers(p => p.map(u => u.id === userForm.id ? { ...userForm, initials } : u));
            showToast("User updated");
        } else {
            const id = `u${users.length + 1}`;
            setUsers(p => [...p, { ...userForm, id, initials }]);
            showToast("User added");
        }
        setShowUserForm(false);
    };

    const deleteUser = () => {
        if (!window.confirm(`Delete user "${userForm.name}"?`)) return;
        setUsers(p => p.filter(u => u.id !== userForm.id));
        setShowUserForm(false);
        showToast("User deleted");
    };

    return (
        <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 14 }}>Settings</div>

            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                {([["profile", "My Profile"], ...(isManager ? [["users", "User Management"]] : []), ["app", "App Info"]]).map(([v, l]) => (
                    <button key={v} onClick={() => setTab(v)} style={{ padding: "6px 14px", borderRadius: 999, border: `1px solid ${tab === v ? "#4f46e5" : "#e5e7eb"}`, background: tab === v ? "#4f46e5" : "#fff", color: tab === v ? "#fff" : "#64748b", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                        {l}
                    </button>
                ))}
            </div>

            {tab === "profile" && (
                <div>
                    <div style={cd({ marginBottom: 14 })}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#fff" }}>
                                    {profile.initials || profile.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                                </div>
                                <div>
                                    <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>{profile.name}</div>
                                    <div style={{ fontSize: 12, color: "#64748b" }}>{profile.email}</div>
                                </div>
                            </div>
                            <button onClick={() => setProfileEdit(!profileEdit)} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, color: "#475569", cursor: "pointer" }}>
                                {profileEdit ? "Cancel" : "✏️ Edit"}
                            </button>
                        </div>

                        {profileEdit ? (
                            <div>
                                {[["Full Name", "name", "text"], ["Email", "email", "email"], ["Department", "dept", "text"], ["Phone", "phone", "tel"]].map(([l, k, type]) => (
                                    <div key={k} style={{ marginBottom: 8 }}>
                                        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>{l}</div>
                                        <input type={type} value={profile[k] || ""} onChange={e => setProfile(p => ({ ...p, [k]: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                                    </div>
                                ))}
                                <button onClick={saveProfile} style={{ width: "100%", padding: 11, background: "#4f46e5", border: "none", borderRadius: 12, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", marginTop: 4 }}>
                                    Save Profile
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                {[["Role", profile.role?.replace("_", " ")], ["Email", profile.email || ""], ["Dept", profile.dept || ""], ["Phone", profile.phone || ""]].map(([k, v]) => (
                                    <div key={k} style={{ background: "#f8fafc", borderRadius: 10, padding: "8px 10px" }}>
                                        <div style={{ fontSize: 10, color: "#94a3b8" }}>{k}</div>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b", textTransform: "capitalize" }}>{v}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button onClick={() => { signOut(); setUser(null); }} style={{ width: "100%", padding: 12, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, color: "#dc2626", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                        Sign Out
                    </button>
                </div>
            )}

            {tab === "users" && (
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{users.length} Login Users</div>
                        <button onClick={handleAddUser} style={{ background: "#4f46e5", color: "#fff", border: "none", borderRadius: 10, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                            + Add User
                        </button>
                    </div>
                    {users.map(u => {
                        const [rc, rbg] = ROLE_COLORS[u.role] || ["#6b7280", "#f9fafb"];
                        return (
                            <div key={u.id} style={{ ...cd({ marginBottom: 8, position: "relative" }) }}>
                                <button onClick={() => handleEditUser(u)} style={{ position: "absolute", top: 10, right: 10, background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#4f46e5" }}>✏️ Edit</button>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, paddingRight: 40 }}>
                                    <div style={{ width: 38, height: 38, borderRadius: 10, background: rbg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: rc }}>
                                        {u.initials}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{u.name}</div>
                                        <div style={{ fontSize: 11, color: "#64748b" }}>{u.email}</div>
                                        <div style={{ marginTop: 3 }}>
                                            <Badge label={u.role.replace("_", " ").toUpperCase()} color={rc} bg={rbg} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {tab === "app" && (
                <div style={cd()}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>Application Info</div>
                    {[
                        ["App", "FacilityOps"],
                        ["Version", "1.0.0"],
                        ["Organization", "Vaidyagrama Ayurveda Healing Village"],
                        ["Framework", "Next.js 14 (App Router)"],
                        ["Platform", "Progressive Web App (PWA)"],
                        ["Support", "facility123 (default password)"],
                    ].map(([k, v]) => (
                        <div key={k} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, marginBottom: 8, borderBottom: "1px solid #f1f5f9" }}>
                            <span style={{ fontSize: 12, color: "#64748b" }}>{k}</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{v}</span>
                        </div>
                    ))}
                </div>
            )}

            {showUserForm && userForm && (
                <Modal title={userForm.id ? "Edit User" : "Add User"} onClose={() => setShowUserForm(false)} onSave={saveUser} isDelete={!!userForm.id} onDelete={deleteUser}>
                    {[["Full Name *", "name", "text"], ["Email *", "email", "email"], ["Department", "dept", "text"], ["Phone", "phone", "tel"], ["Initials (2 chars)", "initials", "text"]].map(([l, k, type]) => (
                        <div key={k} style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>{l}</div>
                            <input type={type} value={userForm[k] || ""} onChange={e => setUserForm(f => ({ ...f, [k]: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                        </div>
                    ))}
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Role</div>
                        <select value={userForm.role} onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, background: "#fff" }}>
                            {ROLES.map(r => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                        </select>
                    </div>
                </Modal>
            )}
        </div>
    );
}
