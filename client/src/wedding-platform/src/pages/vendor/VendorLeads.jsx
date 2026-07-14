import React, { useState, useMemo, useEffect } from "react";
import {
  Inbox, CheckCircle2, Unlock, Trophy, Search, Filter,
  Calendar, MapPin, Wallet, Users, FileText, Lock, Phone,
  X, Check, CalendarX, Clock3, Sparkles,
} from "lucide-react";
import styles from "./VendorLeads.module.css";
import { mockLeads, leadStats } from "../../data/mockData";
import SubscriptionModal from "../../components/vendor/SubscriptionModal";

const FILTERS = ["All", "New", "Accepted", "Unlocked", "Won", "Lost", "Date Unavailable"];
const FREE_DAILY = 3;

const useCounter = (target) => {
  const [n, setN] = useState(0);
  useEffect(() => {
    let i = 0; const step = Math.max(1, Math.ceil(target / 25));
    const id = setInterval(() => {
      i = Math.min(target, i + step);
      setN(i); if (i >= target) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [target]);
  return n;
};

const StatCard = ({ icon: Icon, label, value, accent }) => {
  const n = useCounter(value);
  return (
    <div className={`${styles.stat} ${styles[`stat_${accent}`]}`}>
      <span className={styles.statIcon}><Icon size={20} /></span>
      <div><h4>{n}</h4><p>{label}</p></div>
    </div>
  );
};

const VendorLeads = () => {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [leads, setLeads] = useState(mockLeads);
  const [unlocksUsed, setUnlocksUsed] = useState(1);
  const [showSub, setShowSub] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, []);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const f = filter.toUpperCase().replace(" ", "_");
      const matchF = filter === "All" || l.status === f;
      const matchS = !search || l.customerName.toLowerCase().includes(search.toLowerCase())
        || l.city.toLowerCase().includes(search.toLowerCase());
      return matchF && matchS;
    });
  }, [leads, filter, search]);

  const updateStatus = (id, status) => setLeads((p) => p.map((l) => l.id === id ? { ...l, status } : l));

  const tryUnlock = (id) => {
    if (unlocksUsed >= FREE_DAILY) { setShowSub(true); return; }
    setUnlocksUsed((u) => u + 1);
    updateStatus(id, "UNLOCKED");
  };

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <h1>Leads Dashboard</h1>
          <p>Manage incoming customer requests and grow your bookings.</p>
        </div>
      </header>

      <section className={styles.statsGrid}>
        <StatCard icon={Inbox} label="New Leads" value={leadStats.newLeads} accent="brand" />
        <StatCard icon={CheckCircle2} label="Accepted" value={leadStats.accepted} accent="green" />
        <StatCard icon={Unlock} label="Contacts Unlocked" value={leadStats.unlocked} accent="violet" />
        <StatCard icon={Trophy} label="Bookings Won" value={leadStats.won} accent="gold" />
      </section>

      <section className={styles.controls}>
        <div className={styles.searchWrap}>
          <Search size={16} />
          <input className={styles.search} placeholder="Search by name or city..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className={styles.filters}>
          <Filter size={14} className={styles.fIcon} />
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`${styles.chip} ${filter === f ? styles.chipActive : ""}`}>{f}</button>
          ))}
        </div>
      </section>

      {loading ? (
        <div className={styles.list}>
          {[1, 2, 3].map((i) => <div key={i} className={styles.skeleton} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <Sparkles size={48} /><h3>No leads found</h3>
          <p>Try changing filters or check back soon for new requests.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((l) => (
            <LeadCard key={l.id} lead={l}
              onAccept={() => updateStatus(l.id, "ACCEPTED")}
              onReject={() => updateStatus(l.id, "LOST")}
              onUnavailable={() => updateStatus(l.id, "DATE_UNAVAILABLE")}
              onUnlock={() => tryUnlock(l.id)}
              onWon={() => updateStatus(l.id, "WON")}
              onLost={() => updateStatus(l.id, "LOST")}
              unlocksUsed={unlocksUsed} />
          ))}
        </div>
      )}

      <SubscriptionModal open={showSub} onClose={() => setShowSub(false)} usage={{ used: unlocksUsed, total: FREE_DAILY }} />
    </div>
  );
};

const STATUS_BADGE = {
  NEW: { label: "New", c: "blue" }, ACCEPTED: { label: "Accepted", c: "amber" },
  UNLOCKED: { label: "Unlocked", c: "violet" }, WON: { label: "Won", c: "green" },
  LOST: { label: "Lost", c: "gray" }, DATE_UNAVAILABLE: { label: "Date Unavailable", c: "red" },
};

const LeadCard = ({ lead, onAccept, onReject, onUnavailable, onUnlock, onWon, onLost, unlocksUsed }) => {
  const b = STATUS_BADGE[lead.status];
  const masked = lead.phone.slice(0, 2) + "••••••" + lead.phone.slice(-2);
  const stepIdx = lead.status === "WON" || lead.status === "LOST" ? 3
    : lead.status === "UNLOCKED" ? 2 : lead.status === "ACCEPTED" ? 1 : 0;

  return (
    <article className={styles.lead}>
      <div className={styles.leadHead}>
        <div>
          <h3>{lead.customerName}</h3>
          <p className={styles.leadSub}><Clock3 size={12} /> {lead.receivedAt}</p>
        </div>
        <span className={`${styles.badge} ${styles[`b_${b.c}`]}`}>{b.label}</span>
      </div>

      <div className={styles.leadGrid}>
        <span><Calendar size={14} /> {lead.eventType}</span>
        <span><Calendar size={14} /> {new Date(lead.eventDate).toLocaleDateString("en-IN")}</span>
        <span><Wallet size={14} /> {lead.budget}</span>
        <span><Users size={14} /> {lead.guestCount} guests</span>
        <span><MapPin size={14} /> {lead.city}</span>
      </div>

      {lead.notes && (
        <div className={styles.notes}><FileText size={14} /> {lead.notes}</div>
      )}

      <div className={styles.phoneBox}>
        {lead.status === "UNLOCKED" || lead.status === "WON" ? (
          <>
            <span className={styles.phoneOk}><Phone size={14} /> +91 {lead.phone}</span>
            <a href={`tel:${lead.phone}`} className={styles.callBtn}><Phone size={14} /> Call</a>
          </>
        ) : (
          <span className={styles.phoneMasked}><Lock size={14} /> {masked}</span>
        )}
      </div>

      <div className={styles.miniTimeline}>
        {["Received", "Accepted", "Unlocked", "Won/Lost"].map((s, i) => (
          <div key={s} className={`${styles.tlStep} ${i <= stepIdx ? styles.tlStepDone : ""}`}>
            <span className={styles.tlDot}></span>{s}
          </div>
        ))}
      </div>

      <div className={styles.leadActions}>
        {lead.status === "NEW" && (<>
          <button className={styles.primary} onClick={onAccept}><Check size={14} /> Accept Lead</button>
          <button className={styles.ghost} onClick={onReject}><X size={14} /> Reject</button>
          <button className={styles.warn} onClick={onUnavailable}><CalendarX size={14} /> Date Unavailable</button>
        </>)}
        {lead.status === "ACCEPTED" && (<>
          <button className={styles.primary} onClick={onUnlock}><Unlock size={14} /> Unlock Contact</button>
          <div className={styles.unlockMeta}>
            <small>{Math.max(0, 3 - unlocksUsed)} free unlocks remaining today</small>
            <div className={styles.bar}>
              <div style={{ width: `${(unlocksUsed / 3) * 100}%` }}></div>
            </div>
          </div>
        </>)}
        {lead.status === "UNLOCKED" && (<>
          <button className={styles.primary} onClick={onWon}><Trophy size={14} /> Mark Won</button>
          <button className={styles.ghost} onClick={onLost}><X size={14} /> Mark Lost</button>
        </>)}
      </div>
    </article>
  );
};

export default VendorLeads;
