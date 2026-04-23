import React, { useMemo, useState } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  XCircle,
  ChevronDown,
  CalendarPlus,
} from "lucide-react";
import PageShell from "./components/PageShell";
import SideNav from "./components/SideNav";
import EmptyState from "./components/EmptyState";
import { MOCK_BOOKINGS } from "./data/mockData";
import styles from "./styles/MyBookings.module.css";

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "confirmed", label: "Confirmed" },
  { key: "pending", label: "Pending" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

function MyBookings() {
  const [activeTab, setActiveTab] = useState("all");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  const filtered = useMemo(() => {
    let list = [...MOCK_BOOKINGS];
    if (activeTab !== "all") list = list.filter((b) => b.status === activeTab);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (b) =>
          b.serviceName.toLowerCase().includes(q) ||
          b.vendor.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q),
      );
    }
    if (sortBy === "recent") list.sort((a, b) => new Date(b.bookedOn) - new Date(a.bookedOn));
    if (sortBy === "amount") list.sort((a, b) => b.amount - a.amount);
    if (sortBy === "upcoming") list.sort((a, b) => new Date(a.date) - new Date(b.date));
    return list;
  }, [activeTab, query, sortBy]);

  const counts = useMemo(() => {
    const map = { all: MOCK_BOOKINGS.length };
    STATUS_TABS.slice(1).forEach((t) => {
      map[t.key] = MOCK_BOOKINGS.filter((b) => b.status === t.key).length;
    });
    return map;
  }, []);

  return (
    <PageShell
      title="My Bookings"
      subtitle="Manage all your wedding service bookings in one place."
      breadcrumbs={[{ label: "My Bookings" }]}
      sidebar={<SideNav active="bookings" />}
      actions={
        <button className={styles.primaryBtn}>
          <CalendarPlus size={16} />
          <span>New Booking</span>
        </button>
      }
    >
      {/* Stats summary */}
      <div className={styles.stats}>
        <StatCard label="Total Bookings" value={MOCK_BOOKINGS.length} />
        <StatCard label="Upcoming" value={counts.confirmed + counts.pending} accent />
        <StatCard label="Completed" value={counts.completed} />
        <StatCard
          label="Total Spent"
          value={formatINR(MOCK_BOOKINGS.filter((b) => b.status !== "cancelled").reduce((s, b) => s + b.amount, 0))}
        />
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.tabs} role="tablist">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ""}`}
            >
              {tab.label}
              <span className={styles.tabCount}>{counts[tab.key] ?? 0}</span>
            </button>
          ))}
        </div>

        <div className={styles.controls}>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search bookings, vendors, ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.selectWrap}>
            <Filter size={14} className={styles.selectIcon} />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={styles.select}>
              <option value="recent">Recently booked</option>
              <option value="upcoming">Upcoming first</option>
              <option value="amount">Highest amount</option>
            </select>
            <ChevronDown size={14} className={styles.selectChevron} />
          </div>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No bookings found"
          description="Try adjusting your filters or explore our services to make your first booking."
          action={<button className={styles.primaryBtn}>Explore Services</button>}
        />
      ) : (
        <div className={styles.list}>
          {filtered.map((b) => (
            <BookingCard key={b.id} booking={b} />
          ))}
        </div>
      )}
    </PageShell>
  );
}

/* ---------- Subcomponents ---------- */

function StatCard({ label, value, accent }) {
  return (
    <div className={`${styles.statCard} ${accent ? styles.statCardAccent : ""}`}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
    </div>
  );
}

function BookingCard({ booking }) {
  const isUpcoming = booking.status === "confirmed" || booking.status === "pending";

  return (
    <article className={styles.card}>
      <div className={styles.cardImageWrap}>
        <img src={booking.image} alt={booking.serviceName} className={styles.cardImage} loading="lazy" />
        <span className={styles.cardCategory}>{booking.category}</span>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardTopRow}>
          <div className={styles.cardTitleBlock}>
            <h3 className={styles.cardTitle}>{booking.serviceName}</h3>
            <p className={styles.cardVendor}>by {booking.vendor}</p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className={styles.cardMeta}>
          <MetaItem icon={Calendar} label={formatDate(booking.date)} />
          <MetaItem icon={Clock} label={booking.time} />
          <MetaItem icon={MapPin} label={booking.location} />
          {booking.guests && <MetaItem icon={Users} label={`${booking.guests} guests`} />}
        </div>

        <div className={styles.cardFooter}>
          <div className={styles.cardPriceBlock}>
            <span className={styles.cardPriceLabel}>Total Amount</span>
            <span className={styles.cardPrice}>{formatINR(booking.amount)}</span>
          </div>

          <div className={styles.cardActions}>
            <button className={styles.ghostBtn}>
              <Eye size={15} />
              <span>View</span>
            </button>
            <button className={styles.ghostBtn}>
              <Download size={15} />
              <span>Invoice</span>
            </button>
            {isUpcoming && (
              <button className={`${styles.ghostBtn} ${styles.dangerBtn}`}>
                <XCircle size={15} />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function MetaItem({ icon: Icon, label }) {
  return (
    <span className={styles.metaItem}>
      <Icon size={14} />
      <span>{label}</span>
    </span>
  );
}

function StatusBadge({ status }) {
  const styleMap = {
    confirmed: styles.badgeSuccess,
    pending: styles.badgeWarning,
    completed: styles.badgeMuted,
    cancelled: styles.badgeDanger,
  };
  const labelMap = {
    confirmed: "Confirmed",
    pending: "Pending",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return <span className={`${styles.badge} ${styleMap[status]}`}>{labelMap[status]}</span>;
}

export default MyBookings;
