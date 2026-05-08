import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  MapPin,
  Wallet,
  Users,
  Phone,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  MessageSquare,
  FileText,
  Lock,
  Unlock,
  Trophy,
  TrendingDown,
  Send,
  Inbox,
} from "lucide-react";

import styles from "../styles/VendorLeads.module.css";
import { leadsService } from "../../../utils/api/services/leads.service";

const FILTERS = [
  { id: "all", label: "All Leads", Icon: Inbox },
  { id: "new", label: "New", Icon: Send },
  { id: "accepted", label: "Accepted", Icon: CheckCircle2 },
  { id: "won", label: "Won", Icon: Trophy },
  { id: "lost", label: "Lost", Icon: TrendingDown },
];

const STATUS_LABELS = {
  contacted: "Contacted",
  quoted: "Quote Sent",
  won: "Won",
  lost: "Lost",
};

export default function VendorLeads() {
  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ FETCH FROM BACKEND
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const data = await leadsService.getAllLeads();

        // 🔥 normalize backend → frontend format
        const formatted = data.map((l) => ({
          id: l.id,
          customerName: l.name,
          eventType: l.event_type,
          eventDate: l.event_date,
          location: l.location,
          budget: l.budget_range,
          guests: l.guests,
          description: l.description,
          phone: maskPhone(l.phone),
          fullPhone: l.phone,
          receivedAt: timeAgo(l.created_at),
          stage: l.status === "new" ? "new" : "accepted",
          status: null,
        }));

        setLeads(formatted);
      } catch (err) {
        console.error("Failed to fetch leads", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const update = (id, patch) =>
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const counts = useMemo(() => {
    const c = { all: leads.length, new: 0, accepted: 0, won: 0, lost: 0 };

    leads.forEach((l) => {
      if (l.status === "won") c.won++;
      else if (l.status === "lost") c.lost++;
      else if (l.stage === "accepted" || l.stage === "unlocked") c.accepted++;
      else if (l.stage === "new") c.new++;
    });

    return c;
  }, [leads]);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchesQ =
        !query ||
        [l.customerName, l.eventType, l.location, l.description]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase());

      if (!matchesQ) return false;

      if (filter === "all") return true;
      if (filter === "new") return l.stage === "new";
      if (filter === "accepted")
        return l.stage === "accepted" || l.stage === "unlocked";
      if (filter === "won") return l.status === "won";
      if (filter === "lost") return l.status === "lost";

      return true;
    });
  }, [leads, filter, query]);

  if (loading) {
    return <div className={styles.page}>Loading leads...</div>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Lead Management</h1>
          <p className={styles.pageSubtitle}>
            Manage incoming customer inquiries and convert them to bookings
          </p>
        </div>

        <div className={styles.search}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by customer, event, location…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </header>

      <div className={styles.filters}>
        <span className={styles.filtersLabel}>
          <Filter size={14} /> Filter
        </span>

        <div className={styles.filterChips}>
          {FILTERS.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`${styles.chip} ${filter === id ? styles.chipActive : ""
                }`}
              onClick={() => setFilter(id)}
            >
              <Icon size={14} />
              {label}
              <span className={styles.chipCount}>{counts[id]}</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <Inbox size={36} />
          <h3>No leads</h3>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onUpdate={update} />
          ))}
        </div>
      )}
    </div>
  );
}

function LeadCard({ lead, onUpdate }) {
  const [message, setMessage] = useState("");
  const [quote, setQuote] = useState("");

  const accept = () => onUpdate(lead.id, { stage: "accepted" });
  const unlock = () => onUpdate(lead.id, { stage: "unlocked" });
  const setStatus = (status) => onUpdate(lead.id, { status });

  const isUnlocked = lead.stage === "unlocked";
  const isAccepted = lead.stage === "accepted" || lead.stage === "unlocked";

  const statusVariant = {
    contacted: styles.statusContacted,
    quoted: styles.statusQuoted,
    won: styles.statusWon,
    lost: styles.statusLost,
  }[lead.status];

  return (
    <article className={styles.card}>
      {/* HEADER */}
      <header className={styles.cardHeader}>
        <div>
          <h3 className={styles.customerName}>{lead.customerName}</h3>
          <span className={styles.cardMeta}>{lead.receivedAt}</span>
        </div>
        <span className={styles.eventBadge}>{lead.eventType}</span>
      </header>

      {/* META LIST ✅ FIXED */}
      <ul className={styles.metaList}>
        <li>
          <Calendar size={14} />
          {new Date(lead.eventDate).toLocaleDateString("en-IN")}
        </li>
        <li>
          <MapPin size={14} /> {lead.location}
        </li>
        <li>
          <Wallet size={14} /> {lead.budget}
        </li>
        <li>
          <Users size={14} /> {lead.guests}
        </li>
      </ul>

      {/* DESCRIPTION */}
      <p className={styles.description}>{lead.description}</p>

      {/* PHONE ROW ✅ FIXED */}
      <div className={styles.phoneRow}>
        <span className={styles.phoneLabel}>
          {isUnlocked ? <Unlock size={14} /> : <Lock size={14} />} Phone
        </span>
        <span className={styles.phoneValue}>
          {isUnlocked ? lead.fullPhone : lead.phone}
        </span>
      </div>

      {/* STATUS */}
      {lead.status && (
        <span className={`${styles.statusPill} ${statusVariant}`}>
          {STATUS_LABELS[lead.status]}
        </span>
      )}

      {/* ACTIONS ✅ FIXED */}
      <div className={styles.actions}>
        {lead.stage === "new" && (
          <>
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={accept}
            >
              <CheckCircle2 size={16} /> Accept Lead
            </button>

            <button
              className={`${styles.btn} ${styles.btnGhost}`}
              onClick={() => onUpdate(lead.id, { stage: "rejected" })}
            >
              <XCircle size={16} /> Reject
            </button>
          </>
        )}

        {isAccepted && (
          <>
            {/* MESSAGE */}
            <div className={styles.inlineInput}>
              <MessageSquare size={14} />
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <button className={styles.iconBtn}>
                <Send size={14} />
              </button>
            </div>

            {/* QUOTE */}
            <div className={styles.inlineInput}>
              <FileText size={14} />
              <input
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="Send quote"
              />
              <button className={styles.iconBtn}>
                <Send size={14} />
              </button>
            </div>

            {/* UNLOCK */}
            {!isUnlocked && (
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={unlock}
              >
                <Unlock size={16} /> Unlock Contact
              </button>
            )}

            {/* STATUS ACTIONS */}
            <div className={styles.statusActions}>
              <button
                className={`${styles.statusBtn} ${lead.status === "contacted" ? styles.statusActive : ""
                  }`}
                onClick={() => setStatus("contacted")}
              >
                <Phone size={13} /> Contacted
              </button>

              <button
                className={`${styles.statusBtn} ${lead.status === "quoted" ? styles.statusActive : ""
                  }`}
                onClick={() => setStatus("quoted")}
              >
                <FileText size={13} /> Quote Sent
              </button>

              <button
                className={`${styles.statusBtn} ${lead.status === "won" ? styles.statusActive : ""
                  }`}
                onClick={() => setStatus("won")}
              >
                <Trophy size={13} /> Won
              </button>

              <button
                className={`${styles.statusBtn} ${lead.status === "lost" ? styles.statusActive : ""
                  }`}
                onClick={() => setStatus("lost")}
              >
                <TrendingDown size={13} /> Lost
              </button>
            </div>
          </>
        )}
      </div>
    </article>
  );
}

/* ------------------ HELPERS ------------------ */

function maskPhone(phone) {
  return phone?.replace(/(\d{2})\d{6}(\d{2})/, "$1••••••$2");
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;

  return `${Math.floor(diff / 86400)} day ago`;
}