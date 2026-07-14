import React, { useState } from "react";
import {
  User,
  Lock,
  Bell,
  Shield,
  Camera,
  Save,
  Trash2,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
} from "lucide-react";
import PageShell from "./components/PageShell"
import SideNav from "./components/SideNav";
import { MOCK_USER } from "./data/mockData";
import styles from "./styles/ProfileSettings.module.css";

const SECTIONS = [
  { key: "personal", label: "Personal Info", icon: User },
  { key: "security", label: "Security", icon: Lock },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "privacy", label: "Privacy", icon: Shield },
];

function ProfileSettings() {
  const [section, setSection] = useState("personal");
  const [user, setUser] = useState(MOCK_USER);
  const [savedFlash, setSavedFlash] = useState(false);

  const update = (patch) => setUser((u) => ({ ...u, ...patch }));
  const updatePref = (patch) =>
    setUser((u) => ({ ...u, preferences: { ...u.preferences, ...patch } }));

  const handleSave = (e) => {
    e?.preventDefault();
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2200);
  };

  return (
    <PageShell
      title="Profile Settings"
      subtitle="Manage your personal information, security, and preferences."
      breadcrumbs={[{ label: "Account", href: "/account" }, { label: "Settings" }]}
      sidebar={<SideNav active="settings" />}
    >
      {savedFlash && (
        <div className={styles.flash} role="status">
          <Check size={16} />
          Changes saved successfully
        </div>
      )}

      <div className={styles.layout}>
        {/* Section nav (tabs on top of content) */}
        <nav className={styles.sectionNav} aria-label="Settings sections">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.key}
                onClick={() => setSection(s.key)}
                className={`${styles.sectionTab} ${section === s.key ? styles.sectionTabActive : ""}`}
              >
                <Icon size={16} />
                <span>{s.label}</span>
              </button>
            );
          })}
        </nav>

        <div className={styles.content}>
          {section === "personal" && (
            <PersonalInfoSection user={user} update={update} onSave={handleSave} />
          )}
          {section === "security" && <SecuritySection onSave={handleSave} />}
          {section === "notifications" && (
            <NotificationsSection prefs={user.preferences} updatePref={updatePref} onSave={handleSave} />
          )}
          {section === "privacy" && <PrivacySection />}
        </div>
      </div>
    </PageShell>
  );
}

/* ============ PERSONAL INFO ============ */
function PersonalInfoSection({ user, update, onSave }) {
  const initials = user.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <form className={styles.card} onSubmit={onSave}>
      <SectionHeader
        title="Personal Information"
        description="Update your profile details. This information is visible to vendors when you book."
      />

      {/* Avatar */}
      <div className={styles.avatarRow}>
        <div className={styles.avatar}>
          {user.avatar ? <img src={user.avatar} alt="" /> : <span>{initials}</span>}
        </div>
        <div className={styles.avatarActions}>
          <button type="button" className={styles.secondaryBtn}>
            <Camera size={15} />
            Upload Photo
          </button>
          <button type="button" className={styles.linkDangerBtn}>
            Remove
          </button>
          <p className={styles.helperText}>JPG, PNG or GIF · Max 2MB</p>
        </div>
      </div>

      <div className={styles.divider} />

      {/* Form */}
      <div className={styles.formGrid}>
        <Field label="Full Name" required>
          <input
            type="text"
            value={user.name}
            onChange={(e) => update({ name: e.target.value })}
            className={styles.input}
          />
        </Field>

        <Field label="Email Address" required hint="We'll send booking updates here.">
          <input
            type="email"
            value={user.email}
            onChange={(e) => update({ email: e.target.value })}
            className={styles.input}
          />
        </Field>

        <Field label="Phone Number" required>
          <input
            type="tel"
            value={user.phone}
            onChange={(e) => update({ phone: e.target.value })}
            className={styles.input}
          />
        </Field>

        <Field label="Date of Birth">
          <input
            type="date"
            value={user.dob}
            onChange={(e) => update({ dob: e.target.value })}
            className={styles.input}
          />
        </Field>

        <Field label="Gender">
          <select
            value={user.gender}
            onChange={(e) => update({ gender: e.target.value })}
            className={styles.input}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer-not">Prefer not to say</option>
          </select>
        </Field>

        <Field label="Pincode">
          <input
            type="text"
            value={user.pincode}
            onChange={(e) => update({ pincode: e.target.value })}
            className={styles.input}
            maxLength={6}
          />
        </Field>

        <Field label="Address" full>
          <input
            type="text"
            value={user.address}
            onChange={(e) => update({ address: e.target.value })}
            className={styles.input}
          />
        </Field>

        <Field label="City">
          <input
            type="text"
            value={user.city}
            onChange={(e) => update({ city: e.target.value })}
            className={styles.input}
          />
        </Field>

        <Field label="State">
          <input
            type="text"
            value={user.state}
            onChange={(e) => update({ state: e.target.value })}
            className={styles.input}
          />
        </Field>
      </div>

      <FormActions />
    </form>
  );
}

/* ============ SECURITY ============ */
function SecuritySection({ onSave }) {
  const [show, setShow] = useState({ current: false, next: false, confirm: false });

  return (
    <>
      <form className={styles.card} onSubmit={onSave}>
        <SectionHeader
          title="Change Password"
          description="Use a strong password you don't reuse on other sites."
        />

        <div className={styles.formGridSingle}>
          <PasswordField
            label="Current Password"
            visible={show.current}
            onToggle={() => setShow((s) => ({ ...s, current: !s.current }))}
          />
          <PasswordField
            label="New Password"
            visible={show.next}
            onToggle={() => setShow((s) => ({ ...s, next: !s.next }))}
            hint="Min 8 characters with letters, numbers & symbols."
          />
          <PasswordField
            label="Confirm New Password"
            visible={show.confirm}
            onToggle={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
          />
        </div>

        <FormActions saveLabel="Update Password" />
      </form>

      <div className={styles.card}>
        <SectionHeader
          title="Two-Factor Authentication"
          description="Add an extra layer of security to your account."
        />
        <ToggleRow
          title="Enable 2FA"
          description="Receive a verification code on your phone for every login."
          checked={false}
          onChange={() => { }}
        />
      </div>

      <div className={`${styles.card} ${styles.cardDanger}`}>
        <SectionHeader
          title="Danger Zone"
          description="Permanently delete your account and all associated data."
          danger
        />
        <div className={styles.dangerRow}>
          <div className={styles.dangerInfo}>
            <AlertTriangle size={20} />
            <div>
              <strong>Delete Account</strong>
              <p>This action cannot be undone. All bookings, payments, and data will be erased.</p>
            </div>
          </div>
          <button type="button" className={styles.dangerBtn}>
            <Trash2 size={15} />
            Delete Account
          </button>
        </div>
      </div>
    </>
  );
}

function PasswordField({ label, visible, onToggle, hint }) {
  return (
    <Field label={label} hint={hint}>
      <div className={styles.passwordWrap}>
        <input type={visible ? "text" : "password"} className={styles.input} />
        <button type="button" onClick={onToggle} className={styles.eyeBtn} aria-label="Toggle visibility">
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </Field>
  );
}

/* ============ NOTIFICATIONS ============ */
function NotificationsSection({ prefs, updatePref, onSave }) {
  return (
    <form className={styles.card} onSubmit={onSave}>
      <SectionHeader
        title="Notification Preferences"
        description="Choose what updates you'd like to receive."
      />

      <div className={styles.toggleList}>
        <ToggleRow
          title="Email Notifications"
          description="Booking confirmations, payment receipts, and event reminders."
          checked={prefs.emailNotifications}
          onChange={(v) => updatePref({ emailNotifications: v })}
        />
        <ToggleRow
          title="SMS Notifications"
          description="Urgent updates about your upcoming events via text message."
          checked={prefs.smsNotifications}
          onChange={(v) => updatePref({ smsNotifications: v })}
        />
        <ToggleRow
          title="Promotional Emails"
          description="Offers, discounts, and curated vendor recommendations."
          checked={prefs.promotionalEmails}
          onChange={(v) => updatePref({ promotionalEmails: v })}
        />
        <ToggleRow
          title="Weekly Digest"
          description="A weekly summary of trending venues and seasonal offers."
          checked={prefs.weeklyDigest}
          onChange={(v) => updatePref({ weeklyDigest: v })}
        />
      </div>

      <FormActions saveLabel="Save Preferences" />
    </form>
  );
}

/* ============ PRIVACY ============ */
function PrivacySection() {
  return (
    <>
      <div className={styles.card}>
        <SectionHeader
          title="Privacy Settings"
          description="Control how your data is used and who can see your activity."
        />
        <div className={styles.toggleList}>
          <ToggleRow
            title="Profile Visibility"
            description="Allow vendors to see your past bookings during inquiries."
            checked
            onChange={() => { }}
          />
          <ToggleRow
            title="Show Reviews Publicly"
            description="Display your reviews on vendor profiles with your name."
            checked
            onChange={() => { }}
          />
          <ToggleRow
            title="Personalized Recommendations"
            description="Use my booking history to suggest relevant services."
            checked
            onChange={() => { }}
          />
        </div>
      </div>

      <div className={styles.card}>
        <SectionHeader
          title="Data & Downloads"
          description="Request a copy of your data or manage data sharing."
        />
        <div className={styles.dataRow}>
          <button type="button" className={styles.secondaryBtn}>
            Download My Data
          </button>
          <button type="button" className={styles.secondaryBtn}>
            View Activity Log
          </button>
        </div>
      </div>
    </>
  );
}

/* ============ REUSABLE BITS ============ */

function SectionHeader({ title, description, danger }) {
  return (
    <div className={`${styles.cardHeader} ${danger ? styles.cardHeaderDanger : ""}`}>
      <h3 className={styles.cardTitle}>{title}</h3>
      {description && <p className={styles.cardDescription}>{description}</p>}
    </div>
  );
}

function Field({ label, required, hint, full, children }) {
  return (
    <div className={`${styles.field} ${full ? styles.fieldFull : ""}`}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      {children}
      {hint && <span className={styles.hint}>{hint}</span>}
    </div>
  );
}

function ToggleRow({ title, description, checked, onChange }) {
  return (
    <div className={styles.toggleRow}>
      <div className={styles.toggleText}>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      <label className={styles.switch}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
        />
        <span className={styles.slider} />
      </label>
    </div>
  );
}

function FormActions({ saveLabel = "Save Changes" }) {
  return (
    <div className={styles.formActions}>
      <button type="button" className={styles.secondaryBtn}>
        Cancel
      </button>
      <button type="submit" className={styles.primaryBtn}>
        <Save size={15} />
        {saveLabel}
      </button>
    </div>
  );
}

export default ProfileSettings;
