import React, { useMemo, useState } from "react";
import {
  CreditCard,
  Search,
  Download,
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trash2,
  Star,
} from "lucide-react";
import PageShell from "./components/PageShell";
import SideNav from "./components/SideNav";
import EmptyState from "./components/EmptyState";
import { MOCK_PAYMENTS, MOCK_PAYMENT_METHODS } from "./data/mockData";
import styles from "./styles/Payments.module.css";

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Math.abs(n));

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const STATUS_FILTERS = [
  { key: "all", label: "All Transactions" },
  { key: "success", label: "Successful" },
  { key: "refunded", label: "Refunds" },
  { key: "failed", label: "Failed" },
];

function Payments() {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let list = [...MOCK_PAYMENTS];
    if (filter !== "all") list = list.filter((p) => p.status === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.description.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.bookingId.toLowerCase().includes(q),
      );
    }
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [filter, query]);

  const totals = useMemo(() => {
    const success = MOCK_PAYMENTS.filter((p) => p.status === "success");
    const refunds = MOCK_PAYMENTS.filter((p) => p.status === "refunded");
    return {
      totalSpent: success.reduce((s, p) => s + p.amount, 0),
      totalRefunded: refunds.reduce((s, p) => s + Math.abs(p.amount), 0),
      txnCount: MOCK_PAYMENTS.length,
    };
  }, []);

  return (
    <PageShell
      title="Payments"
      subtitle="View transactions, manage payment methods, and download invoices."
      breadcrumbs={[{ label: "Payments" }]}
      sidebar={<SideNav active="payments" />}
    >
      {/* Summary cards */}
      <div className={styles.summary}>
        <SummaryCard
          icon={Wallet}
          label="Total Spent"
          value={formatINR(totals.totalSpent)}
          trend="+12% this month"
          trendUp
          accent
        />
        <SummaryCard
          icon={RotateCcw}
          label="Total Refunded"
          value={formatINR(totals.totalRefunded)}
          trend="2 refunds"
        />
        <SummaryCard icon={Receipt} label="Transactions" value={totals.txnCount} trend="All time" />
      </div>

      {/* Payment methods */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Payment Methods</h2>
            <p className={styles.sectionSubtitle}>Manage your saved cards and UPI handles.</p>
          </div>
          <button className={styles.primaryBtn}>
            <Plus size={16} />
            <span>Add Method</span>
          </button>
        </div>

        <div className={styles.methodsGrid}>
          {MOCK_PAYMENT_METHODS.map((m) => (
            <PaymentMethodCard key={m.id} method={m} />
          ))}
        </div>
      </section>

      {/* Transactions */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Transaction History</h2>
            <p className={styles.sectionSubtitle}>{filtered.length} transactions</p>
          </div>
          <button className={styles.ghostBtn}>
            <Download size={15} />
            <span>Export</span>
          </button>
        </div>

        {/* Toolbar */}
        <div className={styles.txnToolbar}>
          <div className={styles.filterPills}>
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`${styles.pill} ${filter === f.key ? styles.pillActive : ""}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by ID, booking, description..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        {/* Table — desktop, Cards — mobile */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No transactions found"
            description="No payments match your current filter or search."
          />
        ) : (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Transaction</th>
                    <th>Date</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th className={styles.right}>Amount</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className={styles.txnDesc}>
                          <span className={styles.txnTitle}>{p.description}</span>
                          <span className={styles.txnIds}>
                            {p.id} · Booking {p.bookingId}
                          </span>
                        </div>
                      </td>
                      <td className={styles.muted}>{formatDate(p.date)}</td>
                      <td>
                        <div className={styles.methodCell}>
                          <span className={styles.methodTag}>{p.method}</span>
                          <span className={styles.muted}>{p.methodDetail}</span>
                        </div>
                      </td>
                      <td>
                        <TxnStatus status={p.status} />
                      </td>
                      <td className={`${styles.right} ${styles.amountCell} ${p.amount < 0 ? styles.amountNegative : ""}`}>
                        {p.amount < 0 ? "−" : ""}
                        {formatINR(p.amount)}
                      </td>
                      <td className={styles.right}>
                        {p.invoice && (
                          <button className={styles.iconBtn} aria-label="Download invoice">
                            <Download size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className={styles.txnCards}>
              {filtered.map((p) => (
                <TxnMobileCard key={p.id} txn={p} />
              ))}
            </div>
          </>
        )}
      </section>
    </PageShell>
  );
}

/* ---------- Subcomponents ---------- */

function SummaryCard({ icon: Icon, label, value, trend, trendUp, accent }) {
  return (
    <div className={`${styles.summaryCard} ${accent ? styles.summaryAccent : ""}`}>
      <div className={styles.summaryIcon}>
        <Icon size={20} />
      </div>
      <div className={styles.summaryBody}>
        <span className={styles.summaryLabel}>{label}</span>
        <span className={styles.summaryValue}>{value}</span>
        {trend && (
          <span className={styles.summaryTrend}>
            {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

function PaymentMethodCard({ method }) {
  const isCard = method.type === "card";
  return (
    <div className={`${styles.methodCard} ${method.primary ? styles.methodPrimary : ""}`}>
      <div className={styles.methodTop}>
        <div className={styles.methodIconWrap}>
          <CreditCard size={20} />
        </div>
        {method.primary && (
          <span className={styles.primaryTag}>
            <Star size={11} fill="currentColor" /> Primary
          </span>
        )}
      </div>

      <div className={styles.methodInfo}>
        {isCard ? (
          <>
            <span className={styles.methodBrand}>{method.brand}</span>
            <span className={styles.methodNumber}>•••• •••• •••• {method.last4}</span>
            <span className={styles.methodMeta}>Expires {method.expiry}</span>
          </>
        ) : (
          <>
            <span className={styles.methodBrand}>UPI</span>
            <span className={styles.methodNumber}>{method.handle}</span>
            <span className={styles.methodMeta}>Linked account</span>
          </>
        )}
      </div>

      <div className={styles.methodActions}>
        {!method.primary && <button className={styles.linkBtn}>Set as primary</button>}
        <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} aria-label="Remove">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function TxnStatus({ status }) {
  const map = {
    success: { label: "Success", icon: CheckCircle2, className: styles.statusSuccess },
    refunded: { label: "Refunded", icon: RotateCcw, className: styles.statusRefunded },
    failed: { label: "Failed", icon: XCircle, className: styles.statusFailed },
  };
  const s = map[status];
  const Icon = s.icon;
  return (
    <span className={`${styles.statusPill} ${s.className}`}>
      <Icon size={12} />
      {s.label}
    </span>
  );
}

function TxnMobileCard({ txn }) {
  return (
    <div className={styles.txnCard}>
      <div className={styles.txnCardTop}>
        <div className={styles.txnDesc}>
          <span className={styles.txnTitle}>{txn.description}</span>
          <span className={styles.txnIds}>{txn.id}</span>
        </div>
        <span className={`${styles.txnCardAmount} ${txn.amount < 0 ? styles.amountNegative : ""}`}>
          {txn.amount < 0 ? "−" : ""}
          {formatINR(txn.amount)}
        </span>
      </div>
      <div className={styles.txnCardBottom}>
        <TxnStatus status={txn.status} />
        <span className={styles.muted}>{formatDate(txn.date)}</span>
        <span className={styles.methodTag}>{txn.method}</span>
        {txn.invoice && (
          <button className={styles.iconBtn} aria-label="Download invoice">
            <Download size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export default Payments;
