import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";

import {
  Inbox,
  CheckCircle2,
  Unlock,
  Trophy,
  Search,
  Filter,
  Calendar,
  MapPin,
  Wallet,
  Users,
  FileText,
  Lock,
  Phone,
  X,
  Check,
  CalendarX,
  Clock3,
  Sparkles,
  Loader2,
} from "lucide-react";

import styles from "../styles/VendorLeads.module.css";

import SubscriptionModal from "../components/vendor/SubscriptionModal";

import { leadsService } from "../../../utils/api/services/leads.service";

const FILTERS = [
  "All",
  "New",
  "Accepted",
  "Unlocked",
  "Won",
  "Lost",
  "Date Unavailable",
];

const FREE_DAILY = 3;

const STATUS_BADGE = {
  NEW: {
    label: "New",
    c: "blue",
  },

  ACCEPTED: {
    label: "Accepted",
    c: "amber",
  },

  UNLOCKED: {
    label: "Unlocked",
    c: "violet",
  },

  WON: {
    label: "Won",
    c: "green",
  },

  LOST: {
    label: "Lost",
    c: "gray",
  },

  DATE_UNAVAILABLE: {
    label: "Date Unavailable",
    c: "red",
  },

  CUSTOMER_CLOSED: {
    label: "Closed By Customer",
    c: "gray",
  },

  VENDOR_REJECTED: {
    label: "Rejected",
    c: "red",
  },
};

const ACTION_STATUS_MAP = {
  accept: "ACCEPTED",
  reject: "LOST",
  unavailable: "DATE_UNAVAILABLE",
  unlock: "UNLOCKED",
  won: "WON",
  lost: "LOST",
};

const useCounter = (target) => {
  const [n, setN] = useState(0);

  useEffect(() => {
    let i = 0;

    const step = Math.max(
      1,
      Math.ceil((target || 0) / 25)
    );

    const id = setInterval(() => {
      i = Math.min(target || 0, i + step);

      setN(i);

      if (i >= (target || 0)) {
        clearInterval(id);
      }
    }, 30);

    return () => clearInterval(id);
  }, [target]);

  return n;
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  accent,
}) => {
  const n = useCounter(value);

  return (
    <div
      className={`${styles.stat} ${styles[`stat_${accent}`]}`}
    >
      <span className={styles.statIcon}>
        <Icon size={20} />
      </span>

      <div>
        <h4>{n}</h4>
        <p>{label}</p>
      </div>
    </div>
  );
};

const VendorLeads = () => {
  const [filter, setFilter] = useState("All");

  const [search, setSearch] = useState("");

  const [leads, setLeads] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showSub, setShowSub] = useState(false);

  const [unlocksUsed, setUnlocksUsed] =
    useState(0);

  const [actionLoading, setActionLoading] =
    useState({});

  // FETCH LEADS
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);

      const data =
        await leadsService.getAllLeads();

      const mapped = (data || []).map((lead) => ({
        id: lead.id,

        customerName:
          lead.customer_name ||
          lead.name ||
          "Customer",

        eventType:
          lead.event_type || "Event",

        eventDate: lead.event_date,

        budget:
          lead.budget_range ||
          lead.budget ||
          "Not specified",

        guestCount:
          lead.guests || lead.guest_count || 0,

        city:
          lead.city ||
          lead.location ||
          "Unknown",

        notes:
          lead.description ||
          lead.notes ||
          "",

        phone:
          lead.phone ||
          lead.customer_phone ||
          "0000000000",

        receivedAt:
          lead.created_at
            ? new Date(
              lead.created_at
            ).toLocaleString("en-IN")
            : "Recently",

        customerStatus:
          lead.customer_status,

        status:
          lead.customer_status ===
            "CUSTOMER_CLOSED"
            ? "CUSTOMER_CLOSED"
            : lead.customer_status ===
              "VENDOR_REJECTED"
              ? "VENDOR_REJECTED"
              : lead.customer_status ===
                "DATE_UNAVAILABLE"
                ? "DATE_UNAVAILABLE"
                : lead.status?.toUpperCase() ||
                "NEW",
      }));

      setLeads(mapped);

      const unlocked = mapped.filter((l) =>
        ["UNLOCKED", "WON"].includes(l.status)
      ).length;

      setUnlocksUsed(unlocked);
    } catch (err) {
      console.error(
        "Failed to fetch leads",
        err
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // STATS
  const stats = useMemo(() => {
    return {
      newLeads: leads.filter(
        (l) => l.status === "NEW"
      ).length,

      accepted: leads.filter(
        (l) => l.status === "ACCEPTED"
      ).length,

      unlocked: leads.filter((l) =>
        ["UNLOCKED", "WON"].includes(
          l.status
        )
      ).length,

      won: leads.filter(
        (l) => l.status === "WON"
      ).length,
    };
  }, [leads]);

  // FILTER
  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const f = filter
        .toUpperCase()
        .replaceAll(" ", "_");

      const matchFilter =
        filter === "All" ||
        l.status === f;

      const q = search.toLowerCase();

      const matchSearch =
        !search ||
        l.customerName
          ?.toLowerCase()
          .includes(q) ||
        l.city?.toLowerCase().includes(q) ||
        l.eventType
          ?.toLowerCase()
          .includes(q);

      return matchFilter && matchSearch;
    });
  }, [filter, search, leads]);

  // LOCAL STATUS UPDATE
  const updateStatus = (id, status) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, status }
          : l
      )
    );
  };

  // API ACTION
  const handleLeadAction = async (
    id,
    action
  ) => {
    try {
      setActionLoading((prev) => ({
        ...prev,
        [id]: action,
      }));

      if (
        action === "unlock" &&
        unlocksUsed >= FREE_DAILY
      ) {
        setShowSub(true);
        return;
      }

      await leadsService.updateVendor(
        id,
        action,
        {}
      );

      const updatedStatus =
        ACTION_STATUS_MAP[action];

      updateStatus(id, updatedStatus);

      if (action === "unlock") {
        setUnlocksUsed((u) => u + 1);
      }
    } catch (err) {
      console.error(
        `Failed to ${action} lead`,
        err
      );

      alert(
        `Unable to ${action} lead. Please try again.`
      );
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [id]: null,
      }));
    }
  };

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <header className={styles.head}>
        <div>
          <h1>Leads Dashboard</h1>

          <p>
            Manage incoming customer
            requests and grow your
            bookings.
          </p>
        </div>
      </header>

      {/* STATS */}
      <section className={styles.statsGrid}>
        <StatCard
          icon={Inbox}
          label="New Leads"
          value={stats.newLeads}
          accent="brand"
        />

        <StatCard
          icon={CheckCircle2}
          label="Accepted"
          value={stats.accepted}
          accent="green"
        />

        <StatCard
          icon={Unlock}
          label="Contacts Unlocked"
          value={stats.unlocked}
          accent="violet"
        />

        <StatCard
          icon={Trophy}
          label="Bookings Won"
          value={stats.won}
          accent="gold"
        />
      </section>

      {/* CONTROLS */}
      <section className={styles.controls}>
        <div className={styles.searchWrap}>
          <Search size={16} />

          <input
            className={styles.search}
            placeholder="Search by customer, city, event..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <div className={styles.filters}>
          <Filter
            size={14}
            className={styles.fIcon}
          />

          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`${styles.chip} ${filter === f
                ? styles.chipActive
                : ""
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      {/* LOADING */}
      {loading ? (
        <div className={styles.loadingWrap}>
          <Loader2
            size={28}
            className={styles.spinner}
          />

          <p>Loading leads...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <Sparkles size={48} />

          <h3>No leads found</h3>

          <p>
            Try changing filters or
            check back soon for new
            requests.
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              loadingAction={
                actionLoading[lead.id]
              }
              onAccept={() =>
                handleLeadAction(
                  lead.id,
                  "accept"
                )
              }
              onReject={() =>
                handleLeadAction(
                  lead.id,
                  "reject"
                )
              }
              onUnavailable={() =>
                handleLeadAction(
                  lead.id,
                  "date-unavailable"
                )
              }
              onUnlock={() =>
                handleLeadAction(
                  lead.id,
                  "unlock"
                )
              }
              onWon={() =>
                handleLeadAction(
                  lead.id,
                  "won"
                )
              }
              onLost={() =>
                handleLeadAction(
                  lead.id,
                  "lost"
                )
              }
              unlocksUsed={unlocksUsed}
            />
          ))}
        </div>
      )}

      <SubscriptionModal
        open={showSub}
        onClose={() => setShowSub(false)}
        usage={{
          used: unlocksUsed,
          total: FREE_DAILY,
        }}
      />
    </div>
  );
};

const LeadCard = ({
  lead,
  onAccept,
  onReject,
  onUnavailable,
  onUnlock,
  onWon,
  onLost,
  unlocksUsed,
  loadingAction,
}) => {
  const b =
    STATUS_BADGE[lead.status] ||
    STATUS_BADGE.NEW;

  const isLoading = !!loadingAction;
  const isClosedByCustomer =
    lead.status === "CUSTOMER_CLOSED" ||
    lead.status === "VENDOR_REJECTED" ||
    lead.status === "DATE_UNAVAILABLE";

  const masked =
    lead.phone?.slice(0, 2) +
    "••••••" +
    lead.phone?.slice(-2);

  const stepIdx =
    lead.status === "WON" ||
      lead.status === "LOST"
      ? 3
      : lead.status === "UNLOCKED"
        ? 2
        : lead.status === "ACCEPTED"
          ? 1
          : 0;

  const BtnLoader = () => (
    <Loader2
      size={14}
      className={styles.spinner}
    />
  );

  return (
    <article
      className={`${styles.lead} ${isClosedByCustomer
        ? styles.leadDisabled
        : ""
        }`}
    >
      {/* TOP */}
      <div className={styles.leadHead}>
        <div>
          <h3>{lead.customerName}</h3>

          <p className={styles.leadSub}>
            <Clock3 size={12} />
            {lead.receivedAt}
          </p>
        </div>

        <span
          className={`${styles.badge} ${styles[`b_${b.c}`]
            }`}
        >
          {b.label}
        </span>
      </div>

      {/* GRID */}
      <div className={styles.leadGrid}>
        <span>
          <Calendar size={14} />
          {lead.eventType}
        </span>

        <span>
          <Calendar size={14} />
          {lead.eventDate
            ? new Date(
              lead.eventDate
            ).toLocaleDateString(
              "en-IN"
            )
            : "N/A"}
        </span>

        <span>
          <Wallet size={14} />
          {lead.budget}
        </span>

        <span>
          <Users size={14} />
          {lead.guestCount} guests
        </span>

        <span>
          <MapPin size={14} />
          {lead.city}
        </span>
      </div>

      {/* NOTES */}
      {lead.notes && (
        <div className={styles.notes}>
          <FileText size={14} />
          {lead.notes}
        </div>
      )}

      {/* PHONE */}
      <div className={styles.phoneBox}>
        {lead.status === "UNLOCKED" ||
          lead.status === "WON" ? (
          <>
            <span
              className={styles.phoneOk}
            >
              <Phone size={14} />
              +91 {lead.phone}
            </span>

            <a
              href={`tel:${lead.phone}`}
              className={styles.callBtn}
            >
              <Phone size={14} />
              Call
            </a>
          </>
        ) : (
          <span
            className={
              styles.phoneMasked
            }
          >
            <Lock size={14} />
            {masked}
          </span>
        )}
      </div>

      {/* TIMELINE */}
      <div className={styles.miniTimeline}>
        {[
          "Received",
          "Accepted",
          "Unlocked",
          "Won/Lost",
        ].map((s, i) => (
          <div
            key={s}
            className={`${styles.tlStep} ${i <= stepIdx
              ? styles.tlStepDone
              : ""
              }`}
          >
            <span
              className={styles.tlDot}
            />

            {s}
          </div>
        ))}
      </div>

      {isClosedByCustomer && (
        <div className={styles.closedBanner}>
          <Lock size={14} />

          {lead.status === "VENDOR_REJECTED"
            ? "You rejected this lead"
            : lead.status ===
              "DATE_UNAVAILABLE"
              ? "You marked yourself unavailable for this date"
              : "This lead was closed by customer"}
        </div>
      )}

      {/* ACTIONS */}
      {!isClosedByCustomer && (
        <div className={styles.leadActions}>
          {lead.status === "NEW" && (
            <>
              <button
                className={styles.primary}
                onClick={onAccept}
                disabled={isLoading}
              >
                {loadingAction ===
                  "accept" ? (
                  <BtnLoader />
                ) : (
                  <Check size={14} />
                )}

                Accept Lead
              </button>

              <button
                className={styles.ghost}
                onClick={onReject}
                disabled={isLoading}
              >
                {loadingAction ===
                  "reject" ? (
                  <BtnLoader />
                ) : (
                  <X size={14} />
                )}

                Reject
              </button>

              <button
                className={styles.warn}
                onClick={onUnavailable}
                disabled={isLoading}
              >
                {loadingAction ===
                  "unavailable" ? (
                  <BtnLoader />
                ) : (
                  <CalendarX size={14} />
                )}

                Date Unavailable
              </button>
            </>
          )}

          {lead.status === "ACCEPTED" && (
            <>
              <button
                className={styles.primary}
                onClick={onUnlock}
                disabled={isLoading}
              >
                {loadingAction ===
                  "unlock" ? (
                  <BtnLoader />
                ) : (
                  <Unlock size={14} />
                )}

                Unlock Contact
              </button>

              <button
                className={styles.ghost}
                onClick={onReject}
                disabled={isLoading}
              >
                {loadingAction ===
                  "reject" ? (
                  <BtnLoader />
                ) : (
                  <X size={14} />
                )}

                Reject Lead
              </button>

              <div
                className={styles.unlockMeta}
              >
                <small>
                  {Math.max(
                    0,
                    FREE_DAILY -
                    unlocksUsed
                  )}{" "}
                  free unlocks remaining
                  today
                </small>

                <div className={styles.bar}>
                  <div
                    style={{
                      width: `${(unlocksUsed /
                        FREE_DAILY) *
                        100
                        }%`,
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {lead.status === "UNLOCKED" && (
            <>
              <button
                className={styles.primary}
                onClick={onWon}
                disabled={isLoading}
              >
                {loadingAction ===
                  "won" ? (
                  <BtnLoader />
                ) : (
                  <Trophy size={14} />
                )}

                Mark Won
              </button>

              <button
                className={styles.ghost}
                onClick={onLost}
                disabled={isLoading}
              >
                {loadingAction ===
                  "lost" ? (
                  <BtnLoader />
                ) : (
                  <X size={14} />
                )}

                Mark Lost
              </button>
            </>
          )}
        </div>
      )}
    </article>
  );
};

export default VendorLeads;