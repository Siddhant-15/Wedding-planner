import React, { useMemo, useState } from "react";
import {
  ArrowLeft, Calendar, Wallet, Users, MapPin, FileText,
  CheckCircle2, Clock3, Phone, Trophy, AlertCircle, Star, FileSearch,
  Edit3, XCircle, RotateCw, LifeBuoy,
} from "lucide-react";
import styles from "./ViewRequest.module.css";
import { mockRequest } from "../../data/mockData";

const STATUS_META = {
  REQUEST_SUBMITTED: { label: "Submitted", color: "blue" },
  VENDOR_REVIEWING: { label: "Vendor Reviewing", color: "amber" },
  CONTACT_SHARED: { label: "Contact Shared", color: "violet" },
  BOOKED: { label: "Booked", color: "green" },
  CLOSED: { label: "Closed", color: "gray" },
  EXPIRED: { label: "Expired", color: "gray" },
  DATE_UNAVAILABLE: { label: "Date Unavailable", color: "red" },
};

const TIMELINE = [
  { key: "submitted", label: "Request submitted", icon: CheckCircle2 },
  { key: "reviewing", label: "Vendor reviewing", icon: Clock3 },
  { key: "unlocked", label: "Contact unlocked", icon: Phone },
  { key: "won", label: "Booking completed", icon: Trophy },
];

const EDIT_WINDOW_MIN = 20;

const ViewRequest = ({ request = mockRequest, onBack }) => {
  const [closed, setClosed] = useState(false);
  const status = closed ? "CLOSED" : request.status;
  const meta = STATUS_META[status] || STATUS_META.REQUEST_SUBMITTED;

  const minutesSince = useMemo(() => {
    return Math.floor((Date.now() - new Date(request.submittedAt).getTime()) / 60000);
  }, [request.submittedAt]);
  const editLeft = Math.max(0, EDIT_WINDOW_MIN - minutesSince);
  const canEdit = editLeft > 0 && (status === "REQUEST_SUBMITTED" || status === "VENDOR_REVIEWING");

  const activeStep = useMemo(() => {
    if (status === "BOOKED") return 3;
    if (status === "CONTACT_SHARED") return 2;
    if (status === "VENDOR_REVIEWING") return 1;
    return 0;
  }, [status]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={onBack}><ArrowLeft size={18} /> Back</button>
        <nav className={styles.crumbs}>
          <span>Home</span> / <span>My Requests</span> / <strong>#{request.id}</strong>
        </nav>
        <span className={`${styles.badge} ${styles[`b_${meta.color}`]}`}>{meta.label}</span>
      </div>

      <div className={styles.layout}>
        <main className={styles.main}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Request Details</h2>
            <div className={styles.detailGrid}>
              <Detail icon={<Calendar size={16} />} label="Event Type" value={request.eventType} />
              <Detail icon={<Calendar size={16} />} label="Event Date"
                value={new Date(request.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} />
              <Detail icon={<Wallet size={16} />} label="Budget" value={request.budget} />
              <Detail icon={<Users size={16} />} label="Guest Count" value={`${request.guestCount} guests`} />
              <Detail icon={<MapPin size={16} />} label="City" value={request.city} />
              <Detail icon={<FileText size={16} />} label="Notes" value={request.notes} full />
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Status Timeline</h2>
            <ol className={styles.timeline}>
              {TIMELINE.map((s, i) => {
                const Icon = s.icon;
                const state = i < activeStep ? "done" : i === activeStep ? "active" : "todo";
                return (
                  <li key={s.key} className={`${styles.tlItem} ${styles[`tl_${state}`]}`}>
                    <span className={styles.tlIcon}><Icon size={16} /></span>
                    <span className={styles.tlLabel}>{s.label}</span>
                    {i < TIMELINE.length - 1 && <span className={styles.tlLine}></span>}
                  </li>
                );
              })}
            </ol>
          </section>

          <section className={styles.card}>
            <div className={styles.editBanner}>
              <AlertCircle size={16} />
              <span>{canEdit
                ? `Editing allowed for ${editLeft} more minute${editLeft !== 1 ? "s" : ""}.`
                : "Edit window has expired."}</span>
            </div>
            <div className={styles.actionsRow}>
              {(status !== "CLOSED" && status !== "EXPIRED") ? (
                <>
                  <button className={styles.primary} disabled={!canEdit}>
                    <Edit3 size={16} /> Edit Request
                  </button>
                  <button className={styles.danger} onClick={() => setClosed(true)}>
                    <XCircle size={16} /> Close Request
                  </button>
                </>
              ) : (
                <button className={styles.primary}>
                  <RotateCw size={16} /> Request Again
                </button>
              )}
            </div>
          </section>
        </main>

        <aside className={styles.side}>
          <div className={styles.card}>
            <div className={styles.vendorCard}>
              <img src={request.vendor.image} alt={request.vendor.name} />
              <h4>{request.vendor.name}</h4>
              <p>{request.vendor.category} <span>•</span> <MapPin size={12} /> {request.vendor.city}</p>
              <div className={styles.rating}>
                <Star size={14} fill="currentColor" /> {request.vendor.rating}
                <span className={styles.reviews}>({request.vendor.reviews} reviews)</span>
              </div>
              <div className={styles.vendorActions}>
                <button className={styles.secondary}>View Vendor</button>
                <button className={styles.primarySm}><Phone size={14} /> Call Vendor</button>
              </div>
            </div>
          </div>

          <div className={`${styles.card} ${styles.support}`}>
            <LifeBuoy size={20} />
            <div>
              <strong>Need help?</strong>
              <p>Our team is here to help with your request.</p>
            </div>
            <button className={styles.secondary}>Contact Support</button>
          </div>
        </aside>
      </div>
    </div>
  );
};

const Detail = ({ icon, label, value, full }) => (
  <div className={`${styles.detailItem} ${full ? styles.fullCol : ""}`}>
    <span className={styles.detailLabel}>{icon} {label}</span>
    <span className={styles.detailValue}>{value}</span>
  </div>
);

export const ViewRequestEmpty = () => (
  <div className={styles.empty}>
    <FileSearch size={56} />
    <h3>No request found</h3>
    <p>You haven't sent any requests yet.</p>
  </div>
);

export default ViewRequest;
