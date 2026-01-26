// components/forms/AvailabilityForm.jsx
import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar, Users, Send, Loader2, Check } from "lucide-react";

import styles from "../styles/AvailabilityForm.module.css";

const eventTypes = [
  "Wedding",
  "Engagement",
  "Anniversary",
  "Birthday",
  "Corporate Event",
  "Baby Shower",
  "Sangeet",
  "Mehendi",
  "Reception",
  "Pre-wedding Shoot",
  "Destination Wedding",
  "Other",
];

export default function AvailabilityForm({ serviceName = "Wedding Planning", onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    eventDate: "",
    guestCount: "",
    eventType: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  };

  const getCleanPhone = () => form.phone.replace(/\D/g, "");

  const isPhoneValid = () => {
    const digits = getCleanPhone();
    return digits.length === 10 && /^[6-9]/.test(digits);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isPhoneValid()) return;

    setIsSubmitting(true);

    try {
      const submitData = {
        ...form,
        phone: getCleanPhone(),
        eventDate: form.eventDate ? new Date(form.eventDate) : null,
      };
      await onSubmit(submitData);

      setForm({
        name: "",
        phone: "",
        email: "",
        eventDate: "",
        guestCount: "",
        eventType: "",
        message: "",
      });
      setShowCalendar(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h3 className={styles.title}>Check Availability & Get Quote</h3>
          <p className={styles.subtitle}>
            Let's plan your <span className={styles.serviceHighlight}>{serviceName}</span> together
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.grid}>
            <input
              type="text"
              placeholder="Your Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className={styles.input}
            />

            <div className={styles.inputWrapper}>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                pattern="[6-9][0-9]{9}"
                title="Please enter a valid 10-digit Indian mobile number (starts with 6–9)"
                placeholder="Phone Number *  e.g. 98765 43210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
                maxLength={13}
                required
                className={`${styles.input} ${styles.inputWithIcon} ${
                  form.phone
                    ? isPhoneValid()
                      ? styles.inputValid
                      : styles.inputInvalid
                    : ""
                }`}
              />
              {form.phone && isPhoneValid() && (
                <Check className={styles.validIcon} size={18} />
              )}
            </div>
          </div>

          <input
            type="email"
            placeholder="Email Address *"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className={styles.input}
          />

          <div className={styles.grid}>
            <div className={styles.dateWrapper}>
              <button
                type="button"
                onClick={() => setShowCalendar((prev) => !prev)}
                className={`${styles.input} ${styles.dateTrigger} ${
                  form.eventDate ? styles.dateSelected : ""
                }`}
              >
                <Calendar className={styles.icon} />
                {form.eventDate
                  ? format(new Date(form.eventDate), "MMM dd, yyyy")
                  : "Select Your Special Date *"}
              </button>

              {showCalendar && (
                <div className={styles.calendarPopover}>
                  <input
                    type="date"
                    value={form.eventDate}
                    onChange={(e) => {
                      setForm({ ...form, eventDate: e.target.value });
                      setShowCalendar(false);
                    }}
                    min={format(today, "yyyy-MM-dd")}
                    className={styles.nativeDateInput}
                    autoFocus
                  />
                </div>
              )}
            </div>

            <div className={styles.inputWrapper}>
              <Users className={styles.inputIcon} />
              <input
                type="number"
                min="1"
                placeholder="Expected Guests *"
                value={form.guestCount}
                onChange={(e) => setForm({ ...form, guestCount: e.target.value })}
                required
                className={`${styles.input} ${styles.inputWithIcon}`}
              />
            </div>
          </div>

          <select
            value={form.eventType}
            onChange={(e) => setForm({ ...form, eventType: e.target.value })}
            required
            className={styles.select}
          >
            <option value="" disabled>
              Type of Celebration *
            </option>
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <textarea
            placeholder="Tell us more about your dream day... (optional)"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className={styles.textarea}
            rows={4}
          />

          <button
            type="submit"
            disabled={
              isSubmitting ||
              !form.name.trim() ||
              !form.phone ||
              !form.email ||
              !form.eventDate ||
              !form.guestCount ||
              !form.eventType ||
              !isPhoneValid()
            }
            className={styles.submitButton}
          >
            {isSubmitting ? (
              <>
                <Loader2 className={styles.loader} />
                Sending your request...
              </>
            ) : (
              <>
                <Send className={styles.iconSmall} />
                Send Your Request
              </>
            )}
          </button>
        </form>

        <p className={styles.privacyNote}>
          We'll get back to you within 24 hours • Your information is safe with us
        </p>
      </div>
    </div>
  );
}