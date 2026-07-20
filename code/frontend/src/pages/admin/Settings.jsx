import React, { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaPhone, FaLock, FaGlobe, FaSlidersH, FaCheck } from "react-icons/fa";

const gold = "#C9A84C";
const goldLight = "#E8C96A";
const navy = "#1A2340";
const navyLight = "#243358";
const cream = "#F5F0E8";

const styles = {
  page: {
    padding: "32px 36px",
    minHeight: "100vh",
    background: cream,
    fontFamily: "'Inter', sans-serif",
  },
  pageHeader: { marginBottom: 28 },
  pageTitle: { fontSize: 24, fontWeight: 700, color: navy, margin: 0 },
  pageSub: { color: "#7A869A", fontSize: 14, marginTop: 6 },
  grid: {
    display: "grid",
    gridTemplateColumns: "280px 1fr",
    gap: 24,
    alignItems: "start",
  },

  // Profile Card (left)
  profileCard: {
    background: "#FFFFFF",
    borderRadius: 16,
    border: "1px solid #EDE8DE",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "32px 24px",
  },
  avatarLarge: {
    width: 90,
    height: 90,
    borderRadius: "50%",
    background: navy,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: gold,
    fontWeight: 700,
    fontSize: 30,
    border: `3px solid ${gold}`,
    position: "relative",
    overflow: "hidden",
  },
  sellerName: { fontSize: 17, fontWeight: 700, color: navy, margin: "14px 0 0" },
  sellerBadge: {
    fontSize: 11,
    color: "#FFFFFF",
    background: navy,
    padding: "2px 14px",
    borderRadius: 20,
    marginTop: 6,
    fontWeight: 600,
    letterSpacing: 1,
  },
  divider: { width: "100%", height: 1, background: "#EDE8DE", margin: "18px 0" },
  badge: (color, bg) => ({
    display: "flex",
    alignItems: "center",
    gap: 6,
    color,
    background: bg,
    padding: "6px 12px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 500,
    marginBottom: 6,
    width: "100%",
  }),

  // Form Card (right)
  card: {
    background: "#FFFFFF",
    borderRadius: 16,
    border: "1px solid #EDE8DE",
    overflow: "hidden",
  },
  tabRow: {
    display: "flex",
    borderBottom: "1px solid #EDE8DE",
    padding: "0 24px",
    overflowX: "auto",
  },
  tab: (active) => ({
    padding: "14px 16px",
    fontSize: 13,
    fontWeight: active ? 700 : 500,
    color: active ? gold : "#8899BB",
    borderBottom: active ? `2px solid ${gold}` : "2px solid transparent",
    cursor: "pointer",
    marginBottom: -1,
    whiteSpace: "nowrap",
    transition: "all 0.15s",
  }),
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: navy,
    padding: "20px 24px 14px",
    borderBottom: "1px solid #EDE8DE",
  },
  formBody: { padding: "20px 24px" },
  formRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 },
  formGroup: { marginBottom: 16 },
  label: {
    display: "block",
    fontSize: 11,
    fontWeight: 600,
    color: "#5A6478",
    marginBottom: 6,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: "1.5px solid #E0D8C8",
    fontSize: 14,
    color: navy,
    background: "#FAFAF8",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  select: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: "1.5px solid #E0D8C8",
    fontSize: 14,
    color: navy,
    background: "#FAFAF8",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    cursor: "pointer",
  },
  infoBox: (bg, border, color) => ({
    padding: "12px 16px",
    background: bg,
    borderRadius: 10,
    border: `1px solid ${border}`,
    marginBottom: 16,
    fontSize: 13,
    color,
    fontWeight: 500,
  }),
  actionRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    padding: "16px 24px",
    borderTop: "1px solid #EDE8DE",
    background: "#FAFAF8",
  },
  btnSecondary: {
    padding: "10px 22px",
    borderRadius: 10,
    border: "1.5px solid #D0C8B8",
    background: "transparent",
    color: "#5A6478",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  btnPrimary: {
    padding: "10px 22px",
    borderRadius: 10,
    border: "none",
    background: gold,
    color: navy,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  toast: {
    position: "fixed",
    bottom: 32,
    right: 32,
    background: navy,
    color: "#FFFFFF",
    padding: "14px 22px",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    gap: 10,
    zIndex: 999,
    borderLeft: `4px solid ${gold}`,
  },
  strengthBar: (s) => ({
    height: 4,
    borderRadius: 4,
    marginTop: 6,
    background: s === 0 ? "#E0D8C8" : s === 1 ? "#E24B4A" : s === 2 ? "#EF9F27" : "#3B6D11",
    width: s === 0 ? "0%" : s === 1 ? "33%" : s === 2 ? "66%" : "100%",
    transition: "all 0.3s",
  }),
};

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profile, setProfile] = useState({
    name: "",
    username: "",
    email: "",
    phoneNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    district: "Colombo",
    province: "Western",
    postalCode: "",
  });

  const USER_ID = localStorage.getItem("userId");
  const API_BASE = `${process.env.REACT_APP_API_URL || "https://nexus-backend-axbdfzd2g4c0fwbf.austriaeast-01.azurewebsites.net"}/api`;

  // Fetch admin info on mount
  useEffect(() => {
    if (USER_ID) {
      fetch(`${API_BASE}/users/${USER_ID}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load user info");
          return res.json();
        })
        .then((data) => {
          setProfile({
            name: data.name || "",
            username: data.username || "",
            email: data.email || "",
            phoneNumber: data.phoneNumber || "",
            addressLine1: data.addressLine1 || "",
            addressLine2: data.addressLine2 || "",
            city: data.city || "",
            district: data.district || "Colombo",
            province: data.province || "Western",
            postalCode: data.postalCode || "",
          });
        })
        .catch((err) => console.error("Error fetching admin profile:", err));
    }
  }, [USER_ID, API_BASE]);

  const strength =
    newPassword.length === 0 ? 0 :
    newPassword.length < 6 ? 1 :
    newPassword.length < 10 || !/[A-Z]/.test(newPassword) ? 2 : 3;

  const handleChange = (e) =>
    setProfile((p) => ({ ...p, [e.target.name]: e.target.value }));

  // Update profile details
  const handleSave = () => {
    if (!USER_ID) return;

    fetch(`${API_BASE}/users/${USER_ID}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify(profile)
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save changes");
        return res.json();
      })
      .then(() => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      })
      .catch((err) => alert("Error saving profile: " + err.message));
  };

  // Change password
  const handleSavePassword = () => {
    if (!USER_ID) return;
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    fetch(`${API_BASE}/users/${USER_ID}/password`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
      .then((res) => {
        if (!res.ok) return res.json().then(d => { throw new Error(d.message || "Failed") });
        return res.json();
      })
      .then(() => {
        setSaved(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setSaved(false), 3000);
      })
      .catch((err) => alert("Error: " + err.message));
  };

  const tabs = [
    { id: "profile", label: "Admin Profile" },
    { id: "security", label: "Security & Login" },
  ];

  return (
    <div style={styles.page}>
      
      {/* Page Header */}
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>System Settings</h1>
        <p style={styles.pageSub}>
          Configure your administrator details and manage account credentials
        </p>
      </div>

      <div style={styles.grid}>
        
        {/* ── Left Profile Details Card ── */}
        <div style={styles.profileCard}>
          <div style={styles.avatarLarge}>
            {profile.name ? profile.name.slice(0, 2).toUpperCase() : "AD"}
          </div>

          <p style={styles.sellerName}>{profile.name || "Administrator"}</p>
          <span style={styles.sellerBadge}>ADMINISTRATOR</span>
          <p style={{ fontSize: 11, color: "#7A869A", marginTop: 8, textAlign: "center" }}>
            Giftora Core Platform Admin
          </p>

          <div style={styles.divider} />

          <div style={{ width: "100%" }}>
            <div style={styles.badge("#185FA5", "#E6F1FB")}>✓ System Access Active</div>
            <div style={styles.badge("#2E7D52", "#EAF3DE")}>✓ Role Verified</div>
          </div>
        </div>

        {/* ── Right Edit Form Card ── */}
        <div style={styles.card}>
          
          {/* Tabs header */}
          <div style={styles.tabRow}>
            {tabs.map((t) => (
              <div
                key={t.id}
                style={styles.tab(activeTab === t.id)}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </div>
            ))}
          </div>

          {/* ── Tab: Personal Info ── */}
          {activeTab === "profile" && (
            <>
              <div style={styles.sectionTitle}>Profile Details</div>
              <div style={styles.formBody}>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Full Name</label>
                  <input style={styles.input} name="name" value={profile.name} onChange={handleChange} />
                </div>

                <div style={styles.formRow}>
                  <div>
                    <label style={styles.label}>Username</label>
                    <input style={styles.input} name="username" value={profile.username} readOnly disabled style={{ ...styles.input, background: "#EDEAE4", color: "#888" }} />
                  </div>
                  <div>
                    <label style={styles.label}>Email Address</label>
                    <input style={styles.input} name="email" type="email" value={profile.email} onChange={handleChange} />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone Number</label>
                  <input style={styles.input} name="phoneNumber" value={profile.phoneNumber} onChange={handleChange} placeholder="+94 77 123 4567" />
                </div>

                <div style={styles.divider} />

                <div style={styles.formGroup}>
                  <label style={styles.label}>Address Line 1</label>
                  <input style={styles.input} name="addressLine1" value={profile.addressLine1} onChange={handleChange} />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Address Line 2</label>
                  <input style={styles.input} name="addressLine2" value={profile.addressLine2} onChange={handleChange} />
                </div>

                <div style={styles.formRow}>
                  <div>
                    <label style={styles.label}>City</label>
                    <input style={styles.input} name="city" value={profile.city} onChange={handleChange} />
                  </div>
                  <div>
                    <label style={styles.label}>District</label>
                    <input style={styles.input} name="district" value={profile.district} onChange={handleChange} />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div>
                    <label style={styles.label}>Province</label>
                    <input style={styles.input} name="province" value={profile.province} onChange={handleChange} />
                  </div>
                  <div>
                    <label style={styles.label}>Postal Code</label>
                    <input style={styles.input} name="postalCode" value={profile.postalCode} onChange={handleChange} />
                  </div>
                </div>

              </div>
              
              <div style={styles.actionRow}>
                <button style={styles.btnSecondary} onClick={() => window.location.reload()}>Reset</button>
                <button style={styles.btnPrimary} onClick={handleSave}>Save Changes</button>
              </div>
            </>
          )}

          {/* ── Tab: Security ── */}
          {activeTab === "security" && (
            <>
              <div style={styles.sectionTitle}>Password Settings</div>
              <div style={styles.formBody}>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Current Password</label>
                  <input style={styles.input} type="password" placeholder="Enter current password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>New Password</label>
                  <input
                    style={styles.input}
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  {newPassword.length > 0 && (
                    <>
                      <div style={styles.strengthBar(strength)} />
                      <p style={{ fontSize: 11, margin: "4px 0 0", color: strength === 3 ? "#3B6D11" : strength === 2 ? "#854F0B" : "#A32D2D" }}>
                        Password Strength: {["", "Weak", "Fair", "Strong"][strength]}
                      </p>
                    </>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Confirm New Password</label>
                  <input style={styles.input} type="password" placeholder="Confirm new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </div>

              </div>

              <div style={styles.actionRow}>
                <button style={styles.btnPrimary} onClick={handleSavePassword}>Update Password</button>
              </div>
            </>
          )}

        </div>

      </div>

      {/* Success Notification */}
      {saved && (
        <div style={styles.toast}>
          <FaCheck color={gold} /> Changes saved successfully!
        </div>
      )}

    </div>
  );
};

export default Settings;