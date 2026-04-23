// components/forms/AvailabilityForm.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  format,
  addDays,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  startOfDay,
} from "date-fns";
import {
  Calendar,
  Users,
  Send,
  Loader2,
  CheckCircle2,
  User,
  Phone,
  Mail,
  Sparkles,
  ShieldCheck,
  Clock,
  MailCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

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

const guestPresets = [50, 100, 250, 500];
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MAX_MESSAGE = 500;

function generateRefId() {
  return (
    "REQ-" +
    Math.random().toString(36).slice(2, 7).toUpperCase()
  );
}

export default function AvailabilityForm({
  serviceName = "Service",
  unavailableDates = [],
  onSubmit,
  contactPhone = "+91 98765 43210",
}) {
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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [refId, setRefId] = useState("");
  const [submittedSnapshot, setSubmittedSnapshot] = useState(null);

  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(startOfMonth(new Date()));
  const calendarWrapperRef = useRef(null);

  // ---------- Validation ----------
  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  };

  const cleanPhone = form.phone.replace(/\D/g, "");
  const isPhoneValid = cleanPhone.length === 10 && /^[6-9]/.test(cleanPhone);
  const isPhoneInvalid = form.phone.length > 0 && !isPhoneValid;

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const isEmailInvalid = form.email.length > 0 && !isEmailValid;

  const normalizedUnavailable = useMemo(
    () =>
      unavailableDates
        .map((d) => {
          const dt = new Date(d);
          return isNaN(dt.getTime()) ? null : startOfDay(dt).getTime();
        })
        .filter(Boolean),
    [unavailableDates]
  );

  const isDateUnavailable = (date) =>
    normalizedUnavailable.includes(startOfDay(date).getTime());

  const isDateDisabled = (date) => {
    if (isBefore(startOfDay(date), startOfDay(new Date()))) return true;
    return isDateUnavailable(date);
  };

  // ---------- Calendar grid ----------
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(calendarMonth));
    const end = endOfWeek(endOfMonth(calendarMonth));
    return eachDayOfInterval({ start, end });
  }, [calendarMonth]);

  // Close calendar on outside click / Esc
  useEffect(() => {
    if (!showCalendar) return;
    const handleClick = (e) => {
      if (
        calendarWrapperRef.current &&
        !calendarWrapperRef.current.contains(e.target)
      ) {
        setShowCalendar(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setShowCalendar(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [showCalendar]);

  const selectedDate = form.eventDate ? new Date(form.eventDate) : null;

  const handleSelectDate = (date) => {
    if (isDateDisabled(date)) return;
    setForm((f) => ({ ...f, eventDate: format(date, "yyyy-MM-dd") }));
    setShowCalendar(false);
  };

  // ---------- Submit ----------
  const isFormReady =
    form.name.trim() &&
    isPhoneValid &&
    isEmailValid &&
    form.eventDate &&
    form.guestCount &&
    form.eventType;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormReady) return;

    setIsSubmitting(true);
    try {
      const submitData = {
        ...form,
        phone: cleanPhone,
        eventDate: new Date(form.eventDate),
      };

      if (typeof onSubmit === "function") {
        await onSubmit(submitData);
      } else {
        await new Promise((r) => setTimeout(r, 1100));
      }

      setSubmittedSnapshot({
        eventDate: submitData.eventDate,
        guestCount: form.guestCount,
        eventType: form.eventType,
        name: form.name,
      });
      setRefId(generateRefId());
      setIsSubmitted(true);
      setForm({
        name: "",
        phone: "",
        email: "",
        eventDate: "",
        guestCount: "",
        eventType: "",
        message: "",
      });
    } catch (err) {
      console.error("Submission failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setRefId("");
    setSubmittedSnapshot(null);
  };

  // ---------- Render ----------
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {!isSubmitted ? (
          <>
            {/* Header */}
            <div className={styles.header}>
              <span className={styles.eyebrow}>
                <Sparkles size={12} /> Booking Inquiry
              </span>
              <h3 className={styles.title}>Check availability</h3>
              <p className={styles.subtitle}>
                Get a personalised quote for{" "}
                <span className={styles.highlight}>{serviceName}</span>
              </p>

              <div className={styles.trustRow}>
                <span className={styles.trustItem}>
                  <Clock size={14} /> Reply in 24h
                </span>
                <span className={styles.trustDot} />
                <span className={styles.trustItem}>
                  <ShieldCheck size={14} /> Secure
                </span>
                <span className={styles.trustDot} />
                <span className={styles.trustItem}>
                  <MailCheck size={14} /> No spam
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              {/* Name + Phone */}
              <div className={styles.grid}>
                <div className={styles.field}>
                  <label htmlFor="af-name" className={styles.label}>
                    Full name
                  </label>
                  <div className={styles.inputWrapper}>
                    <User className={styles.inputIcon} size={16} />
                    <input
                      id="af-name"
                      type="text"
                      placeholder="Priya Sharma"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      required
                      className={`${styles.input} ${styles.inputWithIcon}`}
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="af-phone" className={styles.label}>
                    Phone number
                  </label>
                  <div
                    className={`${styles.phoneWrapper} ${isPhoneInvalid ? styles.invalid : ""
                      } ${isPhoneValid ? styles.valid : ""}`}
                  >
                    <span className={styles.phonePrefix}>
                      <Phone size={14} /> +91
                    </span>
                    <input
                      id="af-phone"
                      type="tel"
                      placeholder="98765 43210"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          phone: formatPhone(e.target.value),
                        })
                      }
                      maxLength={11}
                      required
                      aria-invalid={isPhoneInvalid}
                      aria-describedby="af-phone-help"
                      className={styles.phoneInput}
                    />
                    {isPhoneValid && (
                      <CheckCircle2
                        className={styles.validIcon}
                        size={18}
                        aria-hidden
                      />
                    )}
                  </div>
                  {isPhoneInvalid && (
                    <p id="af-phone-help" className={styles.errorText}>
                      <AlertCircle size={12} /> Enter a valid 10-digit Indian
                      mobile
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className={styles.field}>
                <label htmlFor="af-email" className={styles.label}>
                  Email address
                </label>
                <div className={styles.inputWrapper}>
                  <Mail className={styles.inputIcon} size={16} />
                  <input
                    id="af-email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    required
                    aria-invalid={isEmailInvalid}
                    aria-describedby="af-email-help"
                    className={`${styles.input} ${styles.inputWithIcon} ${isEmailInvalid ? styles.invalid : ""
                      } ${form.email && isEmailValid ? styles.valid : ""}`}
                  />
                  {form.email && isEmailValid && (
                    <CheckCircle2
                      className={styles.validIcon}
                      size={18}
                      aria-hidden
                    />
                  )}
                </div>
                {isEmailInvalid && (
                  <p id="af-email-help" className={styles.errorText}>
                    <AlertCircle size={12} /> Please enter a valid email address
                  </p>
                )}
              </div>

              {/* Date + Guests */}
              <div className={styles.grid}>
                {/* Date */}
                <div className={styles.field} ref={calendarWrapperRef}>
                  <label htmlFor="af-date" className={styles.label}>
                    Event date
                  </label>
                  <button
                    id="af-date"
                    type="button"
                    onClick={() => setShowCalendar((s) => !s)}
                    className={`${styles.input} ${styles.dateTrigger} ${form.eventDate ? styles.dateSelected : ""
                      }`}
                    aria-haspopup="dialog"
                    aria-expanded={showCalendar}
                  >
                    <Calendar size={16} />
                    <span>
                      {form.eventDate
                        ? format(new Date(form.eventDate), "dd MMM yyyy")
                        : "Select a date"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`${styles.chevron} ${showCalendar ? styles.chevronOpen : ""
                        }`}
                    />
                  </button>

                  {showCalendar && (
                    <div
                      className={styles.calendarPopover}
                      role="dialog"
                      aria-label="Choose event date"
                    >
                      <div className={styles.calendarHeader}>
                        <button
                          type="button"
                          className={styles.calNavBtn}
                          onClick={() =>
                            setCalendarMonth((m) => subMonths(m, 1))
                          }
                          aria-label="Previous month"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <span className={styles.calMonthLabel}>
                          {format(calendarMonth, "MMMM yyyy")}
                        </span>
                        <button
                          type="button"
                          className={styles.calNavBtn}
                          onClick={() =>
                            setCalendarMonth((m) => addMonths(m, 1))
                          }
                          aria-label="Next month"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>

                      <div className={styles.calWeekRow}>
                        {WEEKDAYS.map((d, i) => (
                          <span key={i} className={styles.calWeekday}>
                            {d}
                          </span>
                        ))}
                      </div>

                      <div className={styles.calGrid}>
                        {calendarDays.map((day) => {
                          const inMonth = isSameMonth(day, calendarMonth);
                          const disabled = isDateDisabled(day);
                          const unavailable = isDateUnavailable(day);
                          const selected =
                            selectedDate && isSameDay(day, selectedDate);
                          const today = isToday(day);

                          return (
                            <button
                              key={day.toISOString()}
                              type="button"
                              disabled={disabled}
                              onClick={() => handleSelectDate(day)}
                              aria-selected={!!selected}
                              aria-disabled={disabled}
                              className={[
                                styles.calDay,
                                !inMonth && styles.calDayMuted,
                                today && styles.calDayToday,
                                selected && styles.calDaySelected,
                                unavailable && styles.calDayUnavailable,
                                disabled &&
                                !unavailable &&
                                styles.calDayDisabled,
                              ]
                                .filter(Boolean)
                                .join(" ")}
                            >
                              {format(day, "d")}
                            </button>
                          );
                        })}
                      </div>

                      <div className={styles.calLegend}>
                        <span className={styles.legendItem}>
                          <i className={styles.dotAvailable} /> Available
                        </span>
                        <span className={styles.legendItem}>
                          <i className={styles.dotSelected} /> Selected
                        </span>
                        <span className={styles.legendItem}>
                          <i className={styles.dotUnavailable} /> Unavailable
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Guests */}
                <div className={styles.field}>
                  <label htmlFor="af-guests" className={styles.label}>
                    Number of guests
                  </label>
                  <div className={styles.inputWrapper}>
                    <Users className={styles.inputIcon} size={16} />
                    <input
                      id="af-guests"
                      type="number"
                      placeholder="e.g. 150"
                      value={form.guestCount}
                      onChange={(e) =>
                        setForm({ ...form, guestCount: e.target.value })
                      }
                      min="1"
                      required
                      className={`${styles.input} ${styles.inputWithIcon}`}
                    />
                  </div>
                  <div className={styles.chipRow}>
                    {guestPresets.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() =>
                          setForm({ ...form, guestCount: String(g) })
                        }
                        className={`${styles.chip} ${form.guestCount === String(g) ? styles.chipActive : ""
                          }`}
                      >
                        {g === 500 ? "500+" : g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Event type */}
              <div className={styles.field}>
                <label htmlFor="af-type" className={styles.label}>
                  Event type
                </label>
                <div className={styles.selectWrapper}>
                  <select
                    id="af-type"
                    value={form.eventType}
                    onChange={(e) =>
                      setForm({ ...form, eventType: e.target.value })
                    }
                    required
                    className={styles.select}
                  >
                    <option value="" disabled>
                      Choose an event type
                    </option>
                    {eventTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className={styles.selectChevron} />
                </div>
              </div>

              {/* Message */}
              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <label htmlFor="af-message" className={styles.label}>
                    Additional details{" "}
                    <span className={styles.optional}>(optional)</span>
                  </label>
                  <span className={styles.counter}>
                    {form.message.length} / {MAX_MESSAGE}
                  </span>
                </div>
                <textarea
                  id="af-message"
                  placeholder="Venue, theme, special requirements, music preferences…"
                  value={form.message}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      message: e.target.value.slice(0, MAX_MESSAGE),
                    })
                  }
                  className={styles.textarea}
                  rows={4}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || !isFormReady}
                className={styles.submitButton}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className={styles.spinner} size={18} />
                    Sending request…
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Send availability request
                  </>
                )}
              </button>

              {!isFormReady && !isSubmitting && (
                <p className={styles.hintText}>
                  Complete the required fields to continue
                </p>
              )}

              <p className={styles.note}>
                Prefer to talk?{" "}
                <a href={`tel:${contactPhone.replace(/\s/g, "")}`} className={styles.callLink}>
                  Call {contactPhone}
                </a>
              </p>
            </form>
          </>
        ) : (
          /* Success */
          <div className={styles.successState}>
            <div className={styles.successIconWrap}>
              <CheckCircle2 size={48} className={styles.successIcon} />
            </div>
            <h3 className={styles.successTitle}>Request received</h3>
            <p className={styles.successSubtitle}>
              Thanks{submittedSnapshot?.name ? `, ${submittedSnapshot.name}` : ""}.
              Our team will reach out within 24 hours regarding{" "}
              <strong>{serviceName}</strong>.
            </p>

            {submittedSnapshot && (
              <div className={styles.summaryCard}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryKey}>Event</span>
                  <span className={styles.summaryVal}>
                    {submittedSnapshot.eventType}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryKey}>Date</span>
                  <span className={styles.summaryVal}>
                    {format(submittedSnapshot.eventDate, "dd MMM yyyy")}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryKey}>Guests</span>
                  <span className={styles.summaryVal}>
                    {submittedSnapshot.guestCount}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryKey}>Service</span>
                  <span className={styles.summaryVal}>{serviceName}</span>
                </div>
              </div>
            )}

            <p className={styles.refLine}>
              Reference ID: <span className={styles.refId}>{refId}</span>
            </p>

            <div className={styles.successActions}>
              <button onClick={resetForm} className={styles.ghostButton}>
                Send another request
              </button>
              <a href="/services" className={styles.outlineButton}>
                Back to services <ArrowRight size={16} />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
