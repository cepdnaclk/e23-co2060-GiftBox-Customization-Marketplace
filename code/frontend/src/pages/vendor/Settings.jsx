import { useState, useEffect } from "react";

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
    background: gold,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: navy,
    fontWeight: 700,
    fontSize: 30,
    border: `3px solid ${goldLight}`,
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
  },
  avatarOverlay: (hov) => ({
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    opacity: hov ? 1 : 0,
    transition: "opacity 0.2s",
  }),
  sellerName: { fontSize: 17, fontWeight: 700, color: navy, margin: "10px 0 0" },
  sellerBadge: {
    fontSize: 11,
    color: "#FFFFFF",
    background: gold,
    padding: "2px 14px",
    borderRadius: 20,
    marginTop: 6,
    fontWeight: 600,
    letterSpacing: 1,
  },
  statsRow: { display: "flex", gap: 12, marginTop: 20, width: "100%" },
  statBox: {
    flex: 1,
    textAlign: "center",
    background: "#F8F4EC",
    borderRadius: 10,
    padding: "10px 6px",
  },
  statNum: { fontSize: 16, fontWeight: 700, color: navy },
  statLabel: { fontSize: 10, color: "#7A869A", marginTop: 2 },
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
  textarea: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: "1.5px solid #E0D8C8",
    fontSize: 14,
    color: navy,
    background: "#FAFAF8",
    outline: "none",
    boxSizing: "border-box",
    resize: "vertical",
    minHeight: 90,
    fontFamily: "inherit",
    lineHeight: 1.5,
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
  const [hovAvatar, setHovAvatar] = useState(false);
  const [saved, setSaved] = useState(false);
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: localStorage.getItem('username') || "",
    phone: "",
    shopName: "",
    shopCategory: "premium-gifts",
    bio: "",
    address: "",
    city: "",
    district: "Central",
    bankName: "Commercial Bank",
    accountNo: "",
    accountName: "",
    branch: "",
  });

  const VENDOR_ID = localStorage.getItem('userId');
  const API_BASE = `${process.env.REACT_APP_API_URL || 'https://nexus-backend-axbdfzd2g4c0fwbf.austriaeast-01.azurewebsites.net'}/api`;

  useEffect(() => {
    if (VENDOR_ID) {
      fetch(`${API_BASE}/vendors/${VENDOR_ID}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      })
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch profile");
          return res.json();
        })
        .then(data => {
          const parts = (data.fullName || "").split(" ");
          const firstName = parts[0] || "";
          const lastName = parts.slice(1).join(" ") || "";

          const addrParts = (data.shopAddress || "").split(",");
          const address = addrParts[0]?.trim() || "";
          const city = addrParts[1]?.trim() || "";

          setProfile(p => ({
            ...p,
            firstName,
            lastName,
            shopName: data.shopName || "",
            phone: data.phoneNumber || "",
            address,
            city,
            accountName: data.fullName || "",
            shopCategory: data.categories || "premium-gifts"
          }));
        })
        .catch(err => console.error("Error loading settings:", err));
    }
  }, [VENDOR_ID, API_BASE]);

  const strength =
    password.length === 0 ? 0 :
    password.length < 6 ? 1 :
    password.length < 10 || !/[A-Z]/.test(password) ? 2 : 3;

  const handleChange = (e) =>
    setProfile((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = () => {
    const fullName = `${profile.firstName} ${profile.lastName}`.trim();
    const shopAddress = `${profile.address}, ${profile.city}`;

    const payload = {
      shopName: profile.shopName,
      fullName: fullName,
      phoneNumber: profile.phone,
      shopAddress: shopAddress,
      categories: profile.shopCategory
    };

    fetch(`${API_BASE}/vendors/${VENDOR_ID}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify(shopData)
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to save changes");
        return res.json();
      })
      .then(() => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      })
      .catch(err => alert("Error saving profile changes: " + err.message));
  };

  const tabs = [
    { id: "profile", label: "Personal Info" },
    { id: "shop", label: "Shop Details" },
    { id: "payment", label: "Payment Info" },
    { id: "security", label: "Security" },
  ];

  return (
    <div style={styles.page}>
      {/* Page Header */}
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>Edit Profile</h1>
        <p style={styles.pageSub}>
          Manage your personal details, shop settings and payment information
        </p>
      </div>

      <div style={styles.grid}>
        {/* ── Left: Profile Card ── */}
        <div style={styles.profileCard}>
          <div
            style={styles.avatarLarge}
            onMouseEnter={() => setHovAvatar(true)}
            onMouseLeave={() => setHovAvatar(false)}
          >
            MA
            <div style={styles.avatarOverlay(hovAvatar)}>📷</div>
          </div>

          <p style={styles.sellerName}>Mathew Anderson</p>
          <span style={styles.sellerBadge}>VENDOR</span>
          <p style={{ fontSize: 11, color: "#7A869A", marginTop: 8, textAlign: "center" }}>
            Hover avatar to change photo
          </p>

          <div style={styles.statsRow}>
            {[["89", "Today"], ["4.8★", "Rating"], ["142", "Items"]].map(([n, l]) => (
              <div key={l} style={styles.statBox}>
                <div style={styles.statNum}>{n}</div>
                <div style={styles.statLabel}>{l}</div>
              </div>
            ))}
          </div>

          <div style={styles.divider} />

          <div style={{ width: "100%" }}>
            <div style={styles.badge("#2E7D52", "#EAF3DE")}>✓ Identity Verified</div>
            <div style={styles.badge("#2E7D52", "#EAF3DE")}>✓ Shop Active</div>
            <div style={styles.badge("#854F0B", "#FEF9ED")}>⚠ Payment Pending Review</div>
          </div>

          <div style={styles.divider} />
          <p style={{ fontSize: 11, color: "#AAA", textAlign: "center", margin: 0 }}>
            Member since January 2024
          </p>
        </div>

        {/* ── Right: Form Card ── */}
        <div style={styles.card}>
          {/* Tabs */}
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
              <div style={styles.sectionTitle}>Personal Information</div>
              <div style={styles.formBody}>
                <div style={styles.formRow}>
                  <div>
                    <label style={styles.label}>First Name</label>
                    <input style={styles.input} name="firstName" value={profile.firstName} onChange={handleChange} />
                  </div>
                  <div>
                    <label style={styles.label}>Last Name</label>
                    <input style={styles.input} name="lastName" value={profile.lastName} onChange={handleChange} />
                  </div>
                </div>
                <div style={styles.formRow}>
                  <div>
                    <label style={styles.label}>Email Address</label>
                    <input style={styles.input} name="email" type="email" value={profile.email} onChange={handleChange} />
                  </div>
                  <div>
                    <label style={styles.label}>Phone Number</label>
                    <input style={styles.input} name="phone" value={profile.phone} onChange={handleChange} />
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Address</label>
                  <input style={styles.input} name="address" value={profile.address} onChange={handleChange} />
                </div>
                <div style={styles.formRow}>
                  <div>
                    <label style={styles.label}>City</label>
                    <input style={styles.input} name="city" value={profile.city} onChange={handleChange} />
                  </div>
                  <div>
                    <label style={styles.label}>District</label>
                    <select style={styles.select} name="district" value={profile.district} onChange={handleChange}>
                      {["Central","Western","Southern","Northern","Eastern","North Western","North Central","Uva","Sabaragamuwa"].map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Tab: Shop Details ── */}
          {activeTab === "shop" && (
            <>
              <div style={styles.sectionTitle}>Shop Details</div>
              <div style={styles.formBody}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Shop Name</label>
                  <input style={styles.input} name="shopName" value={profile.shopName} onChange={handleChange} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Shop Category</label>
                  <select style={styles.select} name="shopCategory" value={profile.shopCategory} onChange={handleChange}>
                    {[
                      ["premium-gifts", "Premium Gifts"],
                      ["handmade", "Handmade Items"],
                      ["floral", "Floral & Bouquets"],
                      ["cakes", "Cakes & Sweets"],
                      ["electronics", "Electronics"],
                      ["clothing", "Clothing & Apparel"],
                    ].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Shop Description</label>
                  <textarea style={styles.textarea} name="bio" value={profile.bio} onChange={handleChange} />
                </div>
                <div style={styles.infoBox("#F8F4EC", "#EDE8DE", "#5A6478")}>
                  🔗 Shop URL: <strong style={{ color: navy }}>giftora.lk/shop/mathew-anderson</strong>
                </div>
              </div>
            </>
          )}

          {/* ── Tab: Payment Info ── */}
          {activeTab === "payment" && (
            <>
              <div style={styles.sectionTitle}>Payment & Banking</div>
              <div style={styles.formBody}>
                <div style={styles.infoBox("#FEF9ED", "#FAC775", "#854F0B")}>
                  ⚠ Payment details are under admin review. Changes may require re-verification.
                </div>
                <div style={styles.formRow}>
                  <div>
                    <label style={styles.label}>Bank Name</label>
                    <select style={styles.select} name="bankName" value={profile.bankName} onChange={handleChange}>
                      {["Commercial Bank","Bank of Ceylon","Sampath Bank","HNB","People's Bank","NSB","Seylan Bank"].map((b) => (
                        <option key={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={styles.label}>Branch</label>
                    <input style={styles.input} name="branch" value={profile.branch} onChange={handleChange} />
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Account Number</label>
                  <input style={styles.input} name="accountNo" value={profile.accountNo} onChange={handleChange} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Account Holder Name</label>
                  <input style={styles.input} name="accountName" value={profile.accountName} onChange={handleChange} />
                </div>
              </div>
            </>
          )}

          {/* ── Tab: Security ── */}
          {activeTab === "security" && (
            <>
              <div style={styles.sectionTitle}>Password & Security</div>
              <div style={styles.formBody}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Current Password</label>
                  <input style={styles.input} type="password" placeholder="Enter current password" />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>New Password</label>
                  <input
                    style={styles.input}
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {password.length > 0 && (
                    <>
                      <div style={styles.strengthBar(strength)} />
                      <p style={{ fontSize: 11, margin: "4px 0 0", color: strength === 3 ? "#3B6D11" : strength === 2 ? "#854F0B" : "#A32D2D" }}>
                        {["", "Weak", "Fair", "Strong"][strength]}
                      </p>
                    </>
                  )}
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Confirm New Password</label>
                  <input style={styles.input} type="password" placeholder="Confirm new password" />
                </div>

                <div style={{ borderTop: "1px solid #EDE8DE", paddingTop: 20, marginTop: 4 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: navy, marginBottom: 12 }}>
                    Two-Factor Authentication
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "#F8F4EC", borderRadius: 10 }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: navy }}>SMS Authentication</p>
                      <p style={{ margin: 0, fontSize: 12, color: "#7A869A" }}>Receive OTP to +94 77 *** 4567</p>
                    </div>
                    <div style={{ width: 44, height: 24, borderRadius: 12, background: gold, cursor: "pointer", position: "relative" }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#FFF", position: "absolute", top: 3, right: 3 }} />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div style={styles.actionRow}>
            <button style={styles.btnSecondary}>Cancel</button>
            <button style={styles.btnPrimary} onClick={handleSave}>Save Changes</button>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {saved && (
        <div style={styles.toast}>
          <span>✓</span> Profile updated successfully!
        </div>
      )}
    </div>
  );
};

export default Settings;
