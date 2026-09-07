import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Info } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import ConfirmModal from "../components/vendor/ConfirmModal";

import styles from "../styles/VendorSettings.module.css";

const DEFAULT_NOTIFICATIONS = {
  leadNotifications: true,
  serviceReviewNotifications: true,
  customerReviewNotifications: false,
};

export default function VendorSettings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Local-only state: no settings-persistence endpoint exists yet.
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const [profileVisible, setProfileVisible] = useState(true);
  const [deactivateOpen, setDeactivateOpen] = useState(false);

  const toggleNotification = (key) =>
    setNotifications((n) => ({ ...n, [key]: !n[key] }));

  const handleDeactivate = () => {
    // No deactivate-account endpoint exists yet — this logs the vendor
    // out locally as a stand-in. Replace with a real API call once
    // account deactivation is supported by the backend.
    setDeactivateOpen(false);
    logout?.();
    navigate("/");
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Settings</h1>
        <p>Manage your account, notifications, and privacy preferences.</p>
      </header>

      {/* Account */}
      <section className={styles.card}>
        <h2>Account</h2>
        <Row
          label="Login & Security"
          desc={user?.email ? `Signed in as ${user.email}` : "Manage your login credentials"}
          action={<button className={styles.linkBtn} onClick={() => navigate("/profile-settings")}>Manage</button>}
        />
      </section>

      {/* Business */}
      <section className={styles.card}>
        <h2>Business</h2>
        <Row
          label="Business Information"
          desc="Update your business details, contact info, and locations"
          action={<button className={styles.linkBtn} onClick={() => navigate("/vendor/profile")}>Edit</button>}
        />
      </section>

      {/* Notifications */}
      <section className={styles.card}>
        <h2>Notifications</h2>
        <Row
          label="Lead Notifications"
          desc="Get notified when a new lead comes in"
          action={
            <Toggle
              checked={notifications.leadNotifications}
              onChange={() => toggleNotification("leadNotifications")}
            />
          }
        />
        <Row
          label="Service Review Notifications"
          desc="Get notified when admin reviews one of your services"
          action={
            <Toggle
              checked={notifications.serviceReviewNotifications}
              onChange={() => toggleNotification("serviceReviewNotifications")}
            />
          }
        />
        <Row
          label="Customer Review Notifications"
          desc="Get notified when a customer leaves a review"
          action={
            <Toggle
              checked={notifications.customerReviewNotifications}
              onChange={() => toggleNotification("customerReviewNotifications")}
            />
          }
        />
      </section>

      {/* Privacy */}
      <section className={styles.card}>
        <h2>Privacy</h2>
        <Row
          label="Profile Visibility"
          desc="Make your profile visible to customers browsing the marketplace"
          action={<Toggle checked={profileVisible} onChange={() => setProfileVisible((v) => !v)} />}
        />
      </section>

      <div className={styles.notice}>
        <Info size={14} />
        Notification and privacy toggles above aren't wired to a backend yet — changes won't persist after reload.
      </div>

      {/* Danger Zone */}
      <section className={`${styles.card} ${styles.dangerCard}`}>
        <h2>Danger Zone</h2>
        <Row
          label="Deactivate Account"
          desc="Your vendor profile and services will no longer be visible to customers"
          action={
            <button className={styles.dangerBtn} onClick={() => setDeactivateOpen(true)}>
              Deactivate
            </button>
          }
        />
      </section>

      <ConfirmModal
        open={deactivateOpen}
        title="Deactivate your account?"
        message="Your profile and services will be hidden from customers. You can contact support to reactivate later."
        onConfirm={handleDeactivate}
        onCancel={() => setDeactivateOpen(false)}
      />
    </div>
  );
}

function Row({ label, desc, action }) {
  return (
    <div className={styles.row}>
      <div>
        <strong>{label}</strong>
        <p>{desc}</p>
      </div>
      {action}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`${styles.toggle} ${checked ? styles.toggleOn : ""}`}
      onClick={onChange}
    >
      <span className={styles.toggleThumb} />
    </button>
  );
}