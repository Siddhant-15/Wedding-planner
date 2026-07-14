import React, { useState, useEffect } from "react";
import {
  X, CalendarHeart, Calendar, MapPin, Wallet, Users,
  FileText, Phone, User, AlertTriangle, CheckCircle2, Loader2, Star,
} from "lucide-react";
import styles from "./GetQuoteModal.module.css";
import { eventTypes, budgetRanges } from "../../data/mockData";

const GetQuoteModal = ({ open, onClose, vendor, onSuccess }) => {
  const [step, setStep] = useState("date"); // date | form
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    eventType: "", eventDate: "", city: "", budget: "",
    guestCount: "", notes: "", name: "", phone: "",
  });

  useEffect(() => {
    if (!open) {
      setStep("date"); setAvailable(null); setChecking(false);
      setForm({ eventType: "", eventDate: "", city: "", budget: "",
        guestCount: "", notes: "", name: "", phone: "" });
    }
  }, [open]);

  if (!open) return null;

  const handleDateCheck = (date) => {
    setForm({ ...form, eventDate: date });
    if (!date) return;
    setChecking(true); setAvailable(null);
    setTimeout(() => {
      // Fake: unavailable on weekends with day === 13
      const d = new Date(date);
      const isUnavailable = d.getDate() === 13;
      setAvailable(!isUnavailable);
      setChecking(false);
      if (!isUnavailable) setStep("form");
    }, 900);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onSuccess?.({ ...form, vendor });
      onClose?.();
    }, 1200);
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className={styles.header}>
          <div className={styles.headerIcon}><CalendarHeart size={22} /></div>
          <div className={styles.vendorRow}>
            <img src={vendor?.image} alt={vendor?.name} className={styles.vendorImg} />
            <div className={styles.vendorMeta}>
              <h3>{vendor?.name}</h3>
              <p className={styles.vendorSub}>
                {vendor?.category} <span>•</span> <MapPin size={12} /> {vendor?.city}
              </p>
              <span className={styles.responseBadge}>
                <Star size={12} /> {vendor?.responseTime}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.body}>
          {step === "date" && (
            <div className={styles.dateStep}>
              <label className={styles.field}>
                <span className={styles.label}><Calendar size={16} /> Select Event Date</span>
                <input type="date" className={styles.input}
                  value={form.eventDate}
                  onChange={(e) => handleDateCheck(e.target.value)} />
              </label>
              {checking && (
                <div className={styles.checking}>
                  <Loader2 size={18} className={styles.spin} />
                  Checking vendor availability...
                </div>
              )}
              {available === true && (
                <div className={`${styles.banner} ${styles.bannerOk}`}>
                  <CheckCircle2 size={18} /> Vendor available on selected date
                </div>
              )}
              {available === false && (
                <div className={`${styles.banner} ${styles.bannerErr}`}>
                  <AlertTriangle size={18} /> Vendor unavailable on this date. Please pick another.
                </div>
              )}
            </div>
          )}

          {step === "form" && (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.grid}>
                <label className={styles.field}>
                  <span className={styles.label}><Calendar size={14} /> Event Type</span>
                  <select className={styles.input} required value={form.eventType}
                    onChange={(e) => setForm({ ...form, eventType: e.target.value })}>
                    <option value="">Select type</option>
                    {eventTypes.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </label>
                <label className={styles.field}>
                  <span className={styles.label}><Calendar size={14} /> Event Date</span>
                  <input type="date" className={styles.input} required value={form.eventDate}
                    onChange={(e) => setForm({ ...form, eventDate: e.target.value })} />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}><MapPin size={14} /> Event City</span>
                  <input type="text" className={styles.input} placeholder="e.g. Mumbai" required
                    value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}><Wallet size={14} /> Budget Range</span>
                  <select className={styles.input} required value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}>
                    <option value="">Select budget</option>
                    {budgetRanges.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </label>
                <label className={styles.field}>
                  <span className={styles.label}><Users size={14} /> Guest Count</span>
                  <input type="number" min="1" className={styles.input} placeholder="e.g. 200" required
                    value={form.guestCount} onChange={(e) => setForm({ ...form, guestCount: e.target.value })} />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}><User size={14} /> Your Name</span>
                  <input type="text" className={styles.input} required value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </label>
                <label className={`${styles.field} ${styles.full}`}>
                  <span className={styles.label}><Phone size={14} /> Phone Number</span>
                  <input type="tel" className={styles.input} pattern="[0-9]{10}" placeholder="10 digit mobile" required
                    value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </label>
                <label className={`${styles.field} ${styles.full}`}>
                  <span className={styles.label}><FileText size={14} /> Requirement Description</span>
                  <textarea className={styles.textarea} rows={3} placeholder="Tell the vendor what you need..."
                    value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </label>
              </div>

              <div className={styles.actions}>
                <button type="button" className={styles.secondary} onClick={onClose}>Cancel</button>
                <button type="submit" className={styles.primary} disabled={submitting}>
                  {submitting ? (<><Loader2 size={16} className={styles.spin} /> Sending...</>) : "Send Request"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default GetQuoteModal;
