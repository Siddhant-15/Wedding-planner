import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Clock3,
  Building2,
  Calendar,
  MapPin,
  Wallet,
  Users,
  FileText,
  CheckCircle2,
  Eye,
  Phone,
  Lock,
  FileSearch,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { leadsService } from "../utils/api/services/leads.service";

import styles from "./ViewRequest.module.css";

const STATUS_META = {
  new: {
    label: "New",
    cls: "stActive",
  },
  seen: {
    label: "Viewed",
    cls: "stViewed",
  },
  contacted: {
    label: "Contacted",
    cls: "stContacted",
  },
  closed: {
    label: "Closed",
    cls: "stClosed",
  },
  expired: {
    label: "Expired",
    cls: "stExpired",
  },
};

function timeAgo(ts) {
  if (!ts) return "—";

  const diff = Math.floor(
    (Date.now() - new Date(ts).getTime()) / 60000
  );

  if (diff < 1) return "just now";

  if (diff < 60) {
    return `${diff} min ago`;
  }

  const h = Math.floor(diff / 60);

  if (h < 24) {
    return `${h} hr ago`;
  }

  return `${Math.floor(h / 24)}d ago`;
}

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function buildTimeline(status) {
  return [
    {
      key: "submitted",
      label: "Request Submitted",
      icon: CheckCircle2,
      done: true,
      active: status === "new",
      ts: "Completed",
    },
    {
      key: "viewed",
      label: "Vendor Viewed Request",
      icon: Eye,
      done: ["seen", "contacted", "closed"].includes(
        status
      ),
      active: status === "seen",
      ts:
        ["seen", "contacted", "closed"].includes(
          status
        )
          ? "Completed"
          : "Pending",
    },
    {
      key: "contacted",
      label: "Vendor Contacted You",
      icon: Phone,
      done: ["contacted", "closed"].includes(status),
      active: status === "contacted",
      ts:
        ["contacted", "closed"].includes(status)
          ? "Completed"
          : "Pending",
    },
    {
      key: "closed",
      label: "Request Closed",
      icon: Lock,
      done: status === "closed",
      active: false,
      ts:
        status === "closed"
          ? "Completed"
          : "Pending",
    },
  ];
}

export default function ViewRequest() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const requestIdFromQuery =
    searchParams.get("request");

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] =
    useState(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);

      const data =
        await leadsService.getMyRequests();

      setRequests(data || []);

      if (data?.length) {
        if (requestIdFromQuery) {
          const matched = data.find(
            (item) =>
              String(item.id) ===
              String(requestIdFromQuery)
          );

          const targetId = matched
            ? matched.id
            : data[0].id;

          setExpandedId(targetId);

          setTimeout(() => {
            const el = document.getElementById(
              `request-${targetId}`
            );

            el?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }, 100);
        } else {
          setExpandedId(data[0].id);
        }
      }
    } catch (err) {
      console.error(
        "Failed to load requests",
        err
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ViewRequestSkeleton />;
  }

  if (!requests.length) {
    return <EmptyState />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* HEADER */}
        <header className={styles.pageHeader}>
          <button
            className={styles.backBtn}
            onClick={() => navigate(-1)}
            type="button"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <div>
            <h1 className={styles.pageTitle}>
              My Requests
            </h1>

            <p className={styles.pageSubtitle}>
              Track vendor responses & request
              status
            </p>
          </div>
        </header>

        {/* REQUESTS */}
        <div className={styles.requestsList}>
          {requests.map((request) => {
            const status =
              STATUS_META[request.status] ||
              STATUS_META.new;

            const isExpanded =
              expandedId === request.id;

            const timeline = buildTimeline(
              request.status
            );

            const isClosed =
              request.status === "closed" ||
              request.status === "expired";

            return (
              <div
                key={request.id}
                id={`request-${request.id}`}
                className={styles.requestCard}
              >
                {/* TOP */}
                <button
                  className={styles.requestTop}
                  onClick={() =>
                    setExpandedId(
                      isExpanded
                        ? null
                        : request.id
                    )
                  }
                  type="button"
                >
                  <div className={styles.requestLeft}>
                    <div
                      className={
                        styles.requestTitleWrap
                      }
                    >
                      <h2
                        className={
                          styles.requestTitle
                        }
                      >
                        {request.event_type}
                      </h2>

                      <span
                        className={`${styles.statusBadge} ${styles[status.cls]}`}
                      >
                        <span
                          className={styles.dot}
                        />
                        {status.label}
                      </span>
                    </div>

                    <div
                      className={styles.requestMeta}
                    >
                      <span>
                        <Building2 size={14} />
                        Vendor #
                        {request.vendor_id}
                      </span>

                      <span>
                        <Clock3 size={14} />
                        {timeAgo(
                          request.created_at
                        )}
                      </span>

                      <span>
                        <Calendar size={14} />
                        {formatDate(
                          request.event_date
                        )}
                      </span>
                    </div>
                  </div>

                  <div
                    className={styles.expandIcon}
                  >
                    {isExpanded ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </div>
                </button>

                {/* EXPANDED */}
                {isExpanded && (
                  <div
                    className={
                      styles.expandedContent
                    }
                  >
                    <div className={styles.layout}>
                      <main className={styles.main}>
                        {/* DETAILS */}
                        <section
                          className={styles.card}
                        >
                          <div
                            className={
                              styles.cardHead
                            }
                          >
                            <h3>
                              Request Details
                            </h3>
                          </div>

                          <div
                            className={
                              styles.detailGrid
                            }
                          >
                            <DetailItem
                              icon={FileText}
                              label="Event Type"
                              value={
                                request.event_type
                              }
                            />

                            <DetailItem
                              icon={Calendar}
                              label="Event Date"
                              value={formatDate(
                                request.event_date
                              )}
                            />

                            <DetailItem
                              icon={Clock3}
                              label="Event Time"
                              value={
                                request.event_time ||
                                "—"
                              }
                            />

                            <DetailItem
                              icon={MapPin}
                              label="Location"
                              value={
                                request.location
                              }
                            />

                            <DetailItem
                              icon={Wallet}
                              label="Budget"
                              value={
                                request.budget_range ||
                                "—"
                              }
                            />

                            <DetailItem
                              icon={Users}
                              label="Guests"
                              value={
                                request.guests
                                  ? `${request.guests} Guests`
                                  : "—"
                              }
                            />
                          </div>

                          <div
                            className={
                              styles.descBlock
                            }
                          >
                            <h4>
                              Requirement
                              Description
                            </h4>

                            <p>
                              {request.description ||
                                "No description provided."}
                            </p>
                          </div>
                        </section>

                        {/* TIMELINE */}
                        <section
                          className={styles.card}
                        >
                          <div
                            className={
                              styles.cardHead
                            }
                          >
                            <h3>
                              Request Timeline
                            </h3>
                          </div>

                          <ol
                            className={
                              styles.timeline
                            }
                          >
                            {timeline.map(
                              (step, idx) => {
                                const Icon =
                                  step.icon;

                                const cls =
                                  step.active
                                    ? styles.tlActive
                                    : step.done
                                      ? styles.tlDone
                                      : styles.tlPending;

                                return (
                                  <li
                                    key={step.key}
                                    className={`${styles.tlItem} ${cls}`}
                                  >
                                    <span
                                      className={
                                        styles.tlIcon
                                      }
                                    >
                                      <Icon
                                        size={16}
                                      />
                                    </span>

                                    {idx <
                                      timeline.length -
                                      1 && (
                                        <span
                                          className={
                                            styles.tlLine
                                          }
                                        />
                                      )}

                                    <div
                                      className={
                                        styles.tlBody
                                      }
                                    >
                                      <p
                                        className={
                                          styles.tlLabel
                                        }
                                      >
                                        {
                                          step.label
                                        }
                                      </p>

                                      <p
                                        className={
                                          styles.tlTime
                                        }
                                      >
                                        {step.ts}
                                      </p>
                                    </div>
                                  </li>
                                );
                              }
                            )}
                          </ol>
                        </section>

                        {/* ACTIONS */}
                        <div
                          className={styles.actions}
                        >
                          {!isClosed ? (
                            <button
                              type="button"
                              className={`${styles.btn} ${styles.btnDanger}`}
                            >
                              Close Request
                            </button>
                          ) : (
                            <button
                              type="button"
                              className={`${styles.btn} ${styles.btnPrimary}`}
                            >
                              Request Again
                            </button>
                          )}
                        </div>
                      </main>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className={styles.detailItem}>
      <span className={styles.detailIcon}>
        <Icon size={16} />
      </span>

      <div>
        <p className={styles.detailLabel}>
          {label}
        </p>

        <p className={styles.detailValue}>
          {value}
        </p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className={styles.page}>
      <div
        className={`${styles.container} ${styles.empty}`}
      >
        <FileSearch size={56} />

        <h2>No requests found</h2>

        <p>
          You haven't submitted any service
          requests yet.
        </p>
      </div>
    </div>
  );
}

function ViewRequestSkeleton() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.loadingWrap}>
          <Loader2
            size={30}
            className={styles.spinner}
          />

          <p>Loading requests...</p>
        </div>
      </div>
    </div>
  );
}