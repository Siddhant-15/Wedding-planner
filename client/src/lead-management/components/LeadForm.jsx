import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Wallet,
  Users,
  FileText,
  User,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  PartyPopper,
} from "lucide-react";
import styles from "./LeadForm.module.css";

const EVENT_TYPES = [
  "Wedding",
  "Engagement",
  "Reception",
  "Birthday",
  "Anniversary",
  "Corporate Event",
  "Other",
];

const BUDGET_RANGES = [
  "Under ₹50,000",
  "₹50,000 – ₹1,00,000",
  "₹1,00,000 – ₹3,00,000",
  "₹3,00,000 – ₹5,00,000",
  "₹5,00,000 – ₹10,00,000",
  "Above ₹10,00,000",
];

const STEPS = [
  { id: 1, label: "Event Info" },
  { id: 2, label: "Requirements" },
  { id: 3, label: "Contact" },
];

const initialForm = {
  eventType: "",
  eventDate: "",
  eventTime: "",
  location: "",
  budget: "",
  guests: "",
  description: "",
  name: "",
  phone: "",
  email: "",
};

const isValidPhone = (p) => /^[6-9]\d{9}$/.test(p.replace(/\s+/g, ""));
const isValidEmail = (e) => !e || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export default function LeadForm({
  vendorName = "this vendor",
  expectedResponseTime = "2 hours",
  onSubmit,
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const update = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validateStep = () => {
    const e = {};
    if (step === 1) {
      if (!form.eventType) e.eventType = "Please select an event type";
      if (!form.eventDate) e.eventDate = "Please select a date";
      if (!form.location.trim()) e.location = "Location is required";
    }
    if (step === 2) {
      if (!form.budget) e.budget = "Please select a budget range";
      if (!form.description.trim() || form.description.trim().length < 10)
        e.description = "Add a short description (min 10 chars)";
    }
    if (step === 3) {
      if (!form.name.trim()) e.name = "Name is required";
      if (!isValidPhone(form.phone)) e.phone = "Enter a valid 10-digit phone";
      if (!isValidEmail(form.email)) e.email = "Enter a valid email";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => validateStep() && setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validateStep()) return;
    onSubmit?.(form);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className={styles.successCard} role="status" aria-live="polite">
        <div className={styles.successIcon}>
          <PartyPopper size={36} strokeWidth={1.6} />
        </div>
        <h3 className={styles.successTitle}>Request sent successfully</h3>
        <p className={styles.successText}>
          <strong>{vendorName}</strong> will contact you within{" "}
          <strong>{expectedResponseTime}</strong>.
        </p>

        <div className={styles.successMeta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Vendor</span>
            <span className={styles.metaValue}>{vendorName}</span>
          </div>
          <div className={styles.metaDivider} />
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Expected response</span>
            <span className={styles.metaValue}>{expectedResponseTime}</span>
          </div>
        </div>

        <p className={styles.successHint}>
          <Sparkles size={14} /> We’ll notify you the moment they respond.
        </p>
      </div>
    );
  }

  const progress = (step / STEPS.length) * 100;

  return (
    <form className={styles.card} onSubmit={handleSubmit} noValidate>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Request a Quote</h2>
          <p className={styles.subtitle}>
            Tell <strong>{vendorName}</strong> about your event
          </p>
        </div>
        <span className={styles.stepBadge}>
          Step {step} of {STEPS.length}
        </span>
      </header>

      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>

      <ol className={styles.stepper}>
        {STEPS.map((s) => {
          const state =
            s.id < step ? "done" : s.id === step ? "active" : "todo";
          return (
            <li
              key={s.id}
              className={`${styles.stepItem} ${styles[`step_${state}`]}`}
            >
              <span className={styles.stepDot}>
                {state === "done" ? <CheckCircle2 size={14} /> : s.id}
              </span>
              <span className={styles.stepLabel}>{s.label}</span>
            </li>
          );
        })}
      </ol>

      <div className={styles.body}>
        {step === 1 && (
          <div className={styles.grid}>
            <Field
              label="Event Type"
              icon={<Sparkles size={16} />}
              error={errors.eventType}
              full
            >
              <select
                className={styles.input}
                value={form.eventType}
                onChange={(e) => update("eventType", e.target.value)}
              >
                <option value="">Select event type</option>
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Event Date" icon={<Calendar size={16} />} error={errors.eventDate}>
              <input
                type="date"
                className={styles.input}
                value={form.eventDate}
                onChange={(e) => update("eventDate", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </Field>

            <Field label="Event Time (optional)" icon={<Clock size={16} />}>
              <input
                type="time"
                className={styles.input}
                value={form.eventTime}
                onChange={(e) => update("eventTime", e.target.value)}
              />
            </Field>

            <Field
              label="Location"
              icon={<MapPin size={16} />}
              error={errors.location}
              full
            >
              <input
                type="text"
                className={styles.input}
                placeholder="City, venue or area"
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                maxLength={120}
              />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className={styles.grid}>
            <Field
              label="Budget Range"
              icon={<Wallet size={16} />}
              error={errors.budget}
            >
              <select
                className={styles.input}
                value={form.budget}
                onChange={(e) => update("budget", e.target.value)}
              >
                <option value="">Select budget</option>
                {BUDGET_RANGES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Guests Count (optional)" icon={<Users size={16} />}>
              <input
                type="number"
                min={0}
                className={styles.input}
                placeholder="e.g. 250"
                value={form.guests}
                onChange={(e) => update("guests", e.target.value)}
              />
            </Field>

            <Field
              label="Description"
              icon={<FileText size={16} />}
              error={errors.description}
              full
            >
              <textarea
                className={`${styles.input} ${styles.textarea}`}
                placeholder="Share your requirements, theme, preferences…"
                rows={4}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                maxLength={1000}
              />
              <span className={styles.counter}>
                {form.description.length}/1000
              </span>
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className={styles.grid}>
            <Field label="Your Name" icon={<User size={16} />} error={errors.name} full>
              <input
                type="text"
                className={styles.input}
                placeholder="Full name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                maxLength={80}
              />
            </Field>

            <Field
              label="Phone Number"
              icon={<Phone size={16} />}
              error={errors.phone}
            >
              <input
                type="tel"
                className={styles.input}
                placeholder="10-digit mobile"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                maxLength={10}
              />
            </Field>

            <Field label="Email (optional)" icon={<Mail size={16} />} error={errors.email}>
              <input
                type="email"
                className={styles.input}
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                maxLength={120}
              />
            </Field>
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnGhost}`}
          onClick={back}
          disabled={step === 1}
        >
          <ChevronLeft size={16} /> Back
        </button>

        {step < 3 ? (
          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={next}
          >
            Continue <ChevronRight size={16} />
          </button>
        ) : (
          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
            Check Availability
          </button>
        )}
      </footer>
    </form>
  );
}

function Field({ label, icon, error, full, children }) {
  return (
    <label className={`${styles.field} ${full ? styles.full : ""}`}>
      <span className={styles.label}>
        {icon}
        {label}
      </span>
      {children}
      {error && <span className={styles.error}>{error}</span>}
    </label>
  );
}
