import React, { useMemo, useState } from "react";
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

const MOCK_LEADS = [
  {
    id: "L-1024",
    customerName: "Riya Sharma",
    eventType: "Wedding",
    eventDate: "2026-06-12",
    location: "Jaipur, Rajasthan",
    budget: "₹3,00,000 – ₹5,00,000",
    guests: 320,
    description:
      "Looking for a destination wedding setup with floral décor, royal stage, and stage lighting.",
    phone: "+91 98••• •••12",
    fullPhone: "+91 98765 43212",
    receivedAt: "2 hours ago",
    stage: "new",
    status: null,
  },
  {
    id: "L-1025",
    customerName: "Aman Verma",
    eventType: "Reception",
    eventDate: "2026-05-04",
    location: "Mumbai, Maharashtra",
    budget: "₹1,00,000 – ₹3,00,000",
    guests: 180,
    description:
      "Need an elegant reception décor with pastel theme and entrance gate.",
    phone: "+91 99••• •••44",
    fullPhone: "+91 99876 54344",
    receivedAt: "5 hours ago",
    stage: "accepted",
    status: "contacted",
  },
  {
    id: "L-1026",
    customerName: "Neha Patel",
    eventType: "Engagement",
    eventDate: "2026-04-18",
    location: "Ahmedabad, Gujarat",
    budget: "Under ₹50,000",
    guests: 80,
    description: "Intimate engagement at home, soft lighting and minimal floral.",
    phone: "+91 90••• •••77",
    fullPhone: "+91 90123 45677",
    receivedAt: "1 day ago",
    stage: "new",
    status: null,
  },
];

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
  const [leads, setLeads] = useState(MOCK_LEADS);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const update = (id, patch) =>
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const counts = useMemo(() => {
    const c = { all: leads.length, new: 0, accepted: 0, won: 0, lost: 0 };
    leads.forEach((l) => {
      if (l.stage === "rejected") return;
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

      if (filter === "all") return l.stage !== "rejected";
      if (filter === "new") return l.stage === "new";
      if (filter === "accepted")
        return (
          (l.stage === "accepted" || l.stage === "unlocked") &&
          l.status !== "won" &&
          l.status !== "lost"
        );
      if (filter === "won") return l.status === "won";
      if (filter === "lost") return l.status === "lost";
      return true;
    });
  }, [leads, filter, query]);

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
              type="button"
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
          <Inbox size={36} strokeWidth={1.4} />
          <h3>No leads to show</h3>
          <p>Try changing filters or check back soon.</p>
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
  const reject = () => onUpdate(lead.id, { stage: "rejected" });
  const unlock = () => onUpdate(lead.id, { stage: "unlocked" });
  const setStatus = (status) => onUpdate(lead.id, { status });
  const sendMessage = () => {
    if (!message.trim()) return;
    setStatus("contacted");
    setMessage("");
  };
  const sendQuote = () => {
    if (!quote.trim()) return;
    setStatus("quoted");
    setQuote("");
  };

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
      <header className={styles.cardHeader}>
        <div>
          <h3 className={styles.customerName}>{lead.customerName}</h3>
          <span className={styles.cardMeta}>
            {lead.id} · {lead.receivedAt}
          </span>
        </div>
        <span className={styles.eventBadge}>{lead.eventType}</span>
      </header>

      <ul className={styles.metaList}>
        <li>
          <Calendar size={14} />
          {new Date(lead.eventDate).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </li>
        <li>
          <MapPin size={14} /> {lead.location}
        </li>
        <li>
          <Wallet size={14} /> {lead.budget}
        </li>
        {lead.guests && (
          <li>
            <Users size={14} /> {lead.guests} guests
          </li>
        )}
      </ul>

      <p className={styles.description}>{lead.description}</p>

      <div className={styles.phoneRow}>
        <span className={styles.phoneLabel}>
          {isUnlocked ? <Unlock size={14} /> : <Lock size={14} />} Phone
        </span>
        <span className={styles.phoneValue}>
          {isUnlocked ? lead.fullPhone : lead.phone}
        </span>
      </div>

      {lead.status && (
        <span className={`${styles.statusPill} ${statusVariant}`}>
          {STATUS_LABELS[lead.status]}
        </span>
      )}

      <div className={styles.actions}>
        {lead.stage === "new" && (
          <>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={accept}
            >
              <CheckCircle2 size={16} /> Accept Lead
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnGhost}`}
              onClick={reject}
            >
              <XCircle size={16} /> Reject
            </button>
          </>
        )}

        {isAccepted && (
          <>
            <div className={styles.inlineInput}>
              <MessageSquare size={14} />
              <input
                type="text"
                placeholder="Type a quick message…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                type="button"
                className={styles.iconBtn}
                onClick={sendMessage}
                aria-label="Send message"
                disabled={!message.trim()}
              >
                <Send size={14} />
              </button>
            </div>

            <div className={styles.inlineInput}>
              <FileText size={14} />
              <input
                type="text"
                placeholder="Send a quote (e.g. ₹2,50,000)"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
              />
              <button
                type="button"
                className={styles.iconBtn}
                onClick={sendQuote}
                aria-label="Send quote"
                disabled={!quote.trim()}
              >
                <Send size={14} />
              </button>
            </div>

            {!isUnlocked && (
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={unlock}
              >
                <Unlock size={16} /> Unlock Contact
              </button>
            )}

            <div className={styles.statusActions}>
              <button
                type="button"
                className={`${styles.statusBtn} ${lead.status === "contacted" ? styles.statusActive : ""
                  }`}
                onClick={() => setStatus("contacted")}
              >
                <Phone size={13} /> Contacted
              </button>
              <button
                type="button"
                className={`${styles.statusBtn} ${lead.status === "quoted" ? styles.statusActive : ""
                  }`}
                onClick={() => setStatus("quoted")}
              >
                <FileText size={13} /> Quote Sent
              </button>
              <button
                type="button"
                className={`${styles.statusBtn} ${lead.status === "won" ? styles.statusActive : ""
                  }`}
                onClick={() => setStatus("won")}
              >
                <Trophy size={13} /> Won
              </button>
              <button
                type="button"
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
