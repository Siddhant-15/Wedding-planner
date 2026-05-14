import React, { useState, useMemo } from "react";
import { CalendarX, ChevronLeft, ChevronRight, Save, Trash2, Calendar } from "lucide-react";
import styles from "./VendorAvailability.module.css";

const fmt = (d) => d.toISOString().slice(0, 10);

const VendorAvailability = () => {
  const [view, setView] = useState(() => new Date());
  const [blocked, setBlocked] = useState(new Set([fmt(new Date(Date.now() + 86400000 * 5))]));
  const [selected, setSelected] = useState(new Set());

  const days = useMemo(() => {
    const y = view.getFullYear(), m = view.getMonth();
    const first = new Date(y, m, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const arr = [];
    for (let i = 0; i < startDay; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(new Date(y, m, d));
    return arr;
  }, [view]);

  const toggle = (date) => {
    const k = fmt(date);
    const s = new Set(selected); s.has(k) ? s.delete(k) : s.add(k);
    setSelected(s);
  };

  const save = () => {
    const next = new Set(blocked);
    selected.forEach((k) => next.has(k) ? next.delete(k) : next.add(k));
    setBlocked(next); setSelected(new Set());
  };

  const blockedList = useMemo(() => [...blocked].sort()
    .filter((k) => new Date(k) >= new Date(new Date().toDateString())), [blocked]);

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1>Manage Availability</h1>
        <p>Block dates when you are unavailable.</p>
      </header>

      <div className={styles.layout}>
        <div className={styles.calCard}>
          <div className={styles.calHead}>
            <button onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}>
              <ChevronLeft size={18} />
            </button>
            <h3>{view.toLocaleString("en-US", { month: "long", year: "numeric" })}</h3>
            <button onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}>
              <ChevronRight size={18} />
            </button>
          </div>
          <div className={styles.weekRow}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) =>
              <span key={d}>{d}</span>)}
          </div>
          <div className={styles.grid}>
            {days.map((d, i) => {
              if (!d) return <span key={i} className={styles.empty} />;
              const k = fmt(d);
              const isBlocked = blocked.has(k);
              const isSelected = selected.has(k);
              const isPast = d < new Date(new Date().toDateString());
              return (
                <button key={k} disabled={isPast} onClick={() => toggle(d)}
                  className={`${styles.day}
                    ${isBlocked ? styles.blocked : ""}
                    ${isSelected ? styles.selected : ""}
                    ${isPast ? styles.past : ""}`}>
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          <div className={styles.legend}>
            <span><i className={styles.dotAvail} /> Available</span>
            <span><i className={styles.dotBlocked} /> Blocked</span>
            <span><i className={styles.dotSel} /> Selected</span>
          </div>

          <div className={styles.actions}>
            <button className={styles.secondary} onClick={() => setSelected(new Set())}>
              <Trash2 size={14} /> Clear Selection
            </button>
            <button className={styles.primary} onClick={save} disabled={!selected.size}>
              <Save size={14} /> Save Changes
            </button>
          </div>
        </div>

        <aside className={styles.side}>
          <div className={styles.sideHead}><CalendarX size={18} /><h3>Upcoming Blocked Dates</h3></div>
          {blockedList.length === 0 ? (
            <p className={styles.emptyMsg}>No blocked dates.</p>
          ) : (
            <ul className={styles.dateList}>
              {blockedList.map((k) => (
                <li key={k}>
                  <Calendar size={14} />
                  {new Date(k).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                  <button onClick={() => { const n = new Set(blocked); n.delete(k); setBlocked(n); }}>
                    <Trash2 size={12} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
};

export default VendorAvailability;
