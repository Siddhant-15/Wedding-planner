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
  AlertTriangle,
  RefreshCcw,
} from "lucide-react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import styles from "./ViewRequest.module.css";
import { leadsService } from "../../../../../utils/api/services/leads.service";

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
    label: "Vendor Contacted",
    cls: "stContacted",
  },

  won: {
    label: "Booked",
    cls: "stBooked",
  },

  customer_closed: {
    label: "Closed by You",
    cls: "stClosedByYou",
  },

  date_unavailable: {
    label: "Date Unavailable",
    cls: "stClosed",
  },

  vendor_closed: {
    label: "Closed by Vendor",
    cls: "stClosed",
  },

  vendor_rejected: {
    label: "Rejected by Vendor",
    cls: "stClosed",
  },

  vendor_lost: {
    label: "Booking Not Finalized",
    cls: "stClosed",
  },

  expired: {
    label: "Expired",
    cls: "stExpired",
  },
};

const CUSTOMER_STATUS_META = {
  REQUEST_SUBMITTED: {
    text: "Your request has been submitted successfully.",
  },

  CUSTOMER_CLOSED: {
    text: "You closed this request.",
  },

  VENDOR_CLOSED: {
    text: "Vendor closed this request.",
  },

  DATE_UNAVAILABLE: {
    text: "Vendor is unavailable on your selected event date.",
  },

  VENDOR_CONTACT_UNLOCKED: {
    text: "Vendor unlocked your contact details.",
  },

  CONTACT_SHARED: {
    text: "Vendor unlocked your contact details and contacted you.",
  },

  VENDOR_REJECTED: {
    text: "Vendor rejected your request.",
  },

  BOOKED: {
    text: "Your booking has been confirmed successfully.",
  },
  LOST: {
    text: "Vendor could not proceed with your booking request.",
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

function buildTimeline(status, customerStatus) {
  const customerClosed =
    customerStatus === "CUSTOMER_CLOSED";

  const vendorClosed =
    customerStatus === "VENDOR_CLOSED";

  // ACCEPTED STEP
  const vendorAccepted = [
    "accepted",
    "unlocked",
    "won",
    "lost",
  ].includes(status);

  // CONTACTED STEP
  const vendorContactedDone = [
    "won",
  ].includes(status);

  const isBooked =
    status === "won" ||
    customerStatus === "BOOKED";

  const dateUnavailable =
    customerStatus === "DATE_UNAVAILABLE";

  const vendorContactedActive =
    status === "unlocked";

  let closedLabel = "Request Closed";
  const vendorLost =
    status === "lost";

  if (customerClosed) {
    closedLabel = "You Closed Request";
  }

  if (vendorClosed) {
    closedLabel = "Vendor Closed Request";
  }

  if (dateUnavailable) {
    closedLabel = "Vendor Unavailable";
  }

  if (vendorLost) {
    closedLabel = "Booking Not Finalized";
  }

  return [
    {
      key: "submitted",
      label: "Request Submitted",
      icon: CheckCircle2,

      done: true,

      active:
        status === "new" &&
        !customerClosed &&
        !vendorClosed,

      ts: "Completed",
    },

    {
      key: "accepted",
      label: "Vendor Accepted Request",
      icon: Eye,

      done:
        vendorAccepted &&
        status !== "accepted",

      active:
        status === "accepted" &&
        !customerClosed &&
        !vendorClosed,

      ts: vendorAccepted
        ? "Completed"
        : "Pending",
    },

    {
      key: "contacted",
      label: "Vendor Contacted You",
      icon: Phone,

      done: vendorContactedDone,

      active:
        vendorContactedActive &&
        !customerClosed &&
        !vendorClosed,

      ts:
        vendorContactedDone
          ? "Completed"
          : vendorContactedActive
            ? "In Progress"
            : "Pending",
    },

    {
      key: "closed",
      label: isBooked
        ? "Booking Confirmed"
        : closedLabel,

      icon: Lock,

      done:
        customerClosed ||
        vendorClosed ||
        vendorLost ||
        dateUnavailable ||
        isBooked,

      active: false,

      ts:
        isBooked
          ? "Completed"
          : customerClosed ||
            vendorClosed ||
            vendorLost ||
            dateUnavailable
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

  const [closingId, setClosingId] =
    useState(null);

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

  const handleCloseRequest = async (
    requestId
  ) => {
    const confirmClose = window.confirm(
      "Are you sure you want to close this request?"
    );
    if (!confirmClose) return;

    try {
      setClosingId(requestId);

      await leadsService.CloseLead(
        requestId
      );


      setRequests((prev) =>
        prev.map((item) => {
          if (item.id !== requestId)
            return item;

          return {
            ...item,
            customer_status:
              "CUSTOMER_CLOSED",
          };
        })
      );
    } catch (err) {
      console.error(
        "Failed to close request",
        err
      );

      alert(
        "Unable to close request. Please try again."
      );
    } finally {
      setClosingId(null);
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
              Track vendor responses &
              request progress
            </p>
          </div>
        </header>

        <div className={styles.requestsList}>
          {requests.map((request) => {
            const isExpanded =
              expandedId === request.id;

            let currentStatus =
              STATUS_META[request.status] ||
              STATUS_META.new;

            if (
              request.customer_status ===
              "CUSTOMER_CLOSED"
            ) {
              currentStatus =
                STATUS_META.customer_closed;

            } else if (
              request.customer_status ===
              "VENDOR_CLOSED"
            ) {
              currentStatus =
                STATUS_META.vendor_closed;

            } else if (
              request.customer_status ===
              "VENDOR_REJECTED"
            ) {
              currentStatus =
                STATUS_META.vendor_rejected;

            } else if (
              request.customer_status ===
              "DATE_UNAVAILABLE"
            ) {
              currentStatus =
                STATUS_META.date_unavailable;

            } else if (
              request.status === "lost"
            ) {
              currentStatus =
                STATUS_META.vendor_lost;

            }
            else if (
              request.customer_status === "BOOKED" ||
              request.status === "won"
            ) {
              currentStatus = STATUS_META.won;

            } else if (
              request.customer_status ===
              "CONTACT_SHARED" ||
              request.customer_status ===
              "VENDOR_CONTACT_UNLOCKED" ||
              request.status === "unlocked"
            ) {
              currentStatus =
                STATUS_META.contacted;

            } else if (
              request.status === "accepted"
            ) {
              currentStatus =
                STATUS_META.seen;

            } else if (
              request.status === "new"
            ) {
              currentStatus =
                STATUS_META.new;
            }

            const timeline = buildTimeline(
              request.status,
              request.customer_status
            );

            const isBooked =
              request.customer_status === "BOOKED" ||
              request.status === "won";

            const isClosed =
              request.customer_status ===
              "CUSTOMER_CLOSED" ||
              request.customer_status ===
              "VENDOR_CLOSED" ||
              request.customer_status ===
              "VENDOR_REJECTED" ||
              request.customer_status ===
              "DATE_UNAVAILABLE" ||
              request.status === "lost" ||
              request.status === "closed" ||
              request.status === "expired" ||
              isBooked;

            const contextText =
              CUSTOMER_STATUS_META[
                request.customer_status
              ]?.text ||
              "Your request is active.";

            return (
              <div
                key={request.id}
                id={`request-${request.id}`}
                className={styles.requestCard}
              >
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
                        className={`${styles.statusBadge} ${styles[currentStatus.cls]}`}
                      >
                        <span
                          className={styles.dot}
                        />

                        {currentStatus.label}
                      </span>
                    </div>

                    <div
                      className={styles.requestMeta}
                    >
                      <span>
                        <Building2 size={14} />

                        {request.service_name}
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

                {isExpanded && (
                  <div
                    className={
                      styles.expandedContent
                    }
                  >
                    <div className={styles.layout}>
                      <main className={styles.main}>
                        {/* CONTEXT */}
                        <section
                          className={`${styles.card} ${styles.contextCard}`}
                        >
                          <div
                            className={
                              styles.contextRow
                            }
                          >
                            <AlertTriangle
                              size={18}
                            />

                            <p>{contextText}</p>
                          </div>
                        </section>

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
                        <div className={styles.actions}>
                          {!isClosed ? (
                            <button
                              type="button"
                              disabled={
                                closingId === request.id
                              }
                              onClick={() =>
                                handleCloseRequest(
                                  request.id
                                )
                              }
                              className={`${styles.btn} ${styles.btnDanger}`}
                            >
                              {closingId ===
                                request.id ? (
                                <>
                                  <Loader2
                                    size={16}
                                    className={
                                      styles.btnSpinner
                                    }
                                  />
                                  Closing...
                                </>
                              ) : (
                                <>
                                  <Lock
                                    size={16}
                                  />
                                  Close Request
                                </>
                              )}
                            </button>
                          ) : request.customer_status ===
                            "CUSTOMER_CLOSED" ? (
                            <button
                              type="button"
                              className={`${styles.btn} ${styles.btnPrimary}`}
                            >
                              <RefreshCcw
                                size={16}
                              />
                              Request Again
                            </button>
                          ) : null}
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