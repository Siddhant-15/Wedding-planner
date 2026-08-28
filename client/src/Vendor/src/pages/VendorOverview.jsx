import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Eye,
    Inbox,
    Zap,
    Clock3,
    AlertTriangle,
    ChevronRight,
    Loader2,
} from "lucide-react";

import { leadsService } from "../../../utils/api/services/leads.service";
import {
    actionRequiredMock,
    serviceHealthMock,
    performanceSeriesMock,
} from "../mock/Vendordashboardmock";

import { vendorService } from "../../../utils/api/services/vendor.service";

import styles from "../styles/VendorOverview.module.css";

const RANGES = ["7D", "30D", "3M", "6M", "1Y"];

const SERVICE_STATUS_TONE = {
    Published: "green",
    "Under Review": "amber",
    "Changes Requested": "red",
    Draft: "gray",
};



export default function VendorOverview() {
    const navigate = useNavigate();

    const [recentLeads, setRecentLeads] = useState([]);
    const [leadsLoading, setLeadsLoading] = useState(true);
    const [leadsError, setLeadsError] = useState(false);

    const [kpis, setKpis] = useState(null);
    const [kpisLoading, setKpisLoading] = useState(true);
    const [kpisError, setKpisError] = useState(false);

    const [range, setRange] = useState("7D");

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                setLeadsLoading(true);
                setLeadsError(false);

                const data = await leadsService.getAllLeads();

                const mapped = (data || [])
                    .map((lead) => ({
                        id: lead.id,
                        customerName: lead.customer_name || lead.name || "Customer",
                        eventType: lead.event_type || "Event",
                        eventDate: lead.event_date,
                        budget: lead.budget_range || lead.budget || "Not specified",
                        status:
                            lead.customer_status === "CUSTOMER_CLOSED"
                                ? "CUSTOMER_CLOSED"
                                : lead.customer_status === "VENDOR_REJECTED"
                                    ? "VENDOR_REJECTED"
                                    : lead.customer_status === "DATE_UNAVAILABLE"
                                        ? "DATE_UNAVAILABLE"
                                        : lead.status?.toUpperCase() || "NEW",
                        createdAt: lead.created_at ? new Date(lead.created_at) : null,
                    }))
                    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
                    .slice(0, 4);

                if (!cancelled) setRecentLeads(mapped);
            } catch (err) {
                console.error("Failed to fetch recent leads:", err);
                if (!cancelled) setLeadsError(true);
            } finally {
                if (!cancelled) setLeadsLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
    let cancelled = false;

    const fetchKPIs = async () => {
        try {
            setKpisLoading(true);
            setKpisError(false);

            const data = await vendorService.getKPIs();

            if (!cancelled) {
                setKpis(data);
            }
        } catch (err) {
            console.error("Failed to fetch vendor dashboard KPIs:", err);

            if (!cancelled) {
                setKpisError(true);
            }
        } finally {
            if (!cancelled) {
                setKpisLoading(false);
            }
        }
    };

    fetchKPIs();

    return () => {
        cancelled = true;
    };
}, []);

    const series = performanceSeriesMock[range] || [];
    const maxSeries = Math.max(1, ...series);

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1>Overview</h1>
                    <p>A quick look at how your business is performing.</p>
                </div>
            </header>

            {/* KPIs */}
            <section className={styles.kpiGrid}>
                <KpiCard
                    icon={Inbox}
                    label="Total Leads"
                    value={(kpis?.total_leads ?? 0).toLocaleString()}
                />

                <KpiCard
                    icon={Zap}
                    label="New Leads"
                    value={(kpis?.new_leads ?? 0).toLocaleString()}
                    accent="brand"
                />

                <KpiCard
                    icon={Eye}
                    label="Service Views"
                    value={(kpis?.total_views ?? 0).toLocaleString()}
                />

                <KpiCard
                    icon={Clock3}
                    label="Live Services"
                    value={`${kpis?.live_services ?? 0} / ${kpis?.total_services ?? 0}`}
                />

                <KpiCard
                    icon={Zap}
                    label="Average Rating"
                    value={Number(kpis?.average_rating ?? 0).toFixed(1)}
                />

                <KpiCard
                    icon={Inbox}
                    label="Reviews"
                    value={(kpis?.total_reviews ?? 0).toLocaleString()}
                />
            </section>

            <div className={styles.twoCol}>
                {/* Recent Leads */}
                <section className={styles.card}>
                    <div className={styles.cardHead}>
                        <h2>Recent Leads</h2>
                        <button className={styles.linkBtn} onClick={() => navigate("/vendor/leads")}>
                            View all <ChevronRight size={14} />
                        </button>
                    </div>

                    {leadsLoading ? (
                        <div className={styles.loadingRow}>
                            <Loader2 size={18} className={styles.spinner} />
                            Loading leads...
                        </div>
                    ) : leadsError ? (
                        <p className={styles.errorText}>We couldn't load your leads. Please try again later.</p>
                    ) : recentLeads.length === 0 ? (
                        <p className={styles.emptyText}>No leads yet. New requests will show up here.</p>
                    ) : (
                        <ul className={styles.leadList}>
                            {recentLeads.map((lead) => (
                                <li key={lead.id} className={styles.leadRow} onClick={() => navigate("/vendor/leads")}>
                                    <div>
                                        <strong>{lead.customerName}</strong>
                                        <span className={styles.leadMeta}>{lead.eventType}</span>
                                    </div>
                                    <div className={styles.leadRight}>
                                        <span className={styles.leadBudget}>{lead.budget}</span>
                                        <span className={`${styles.badge} ${styles[`b_${(lead.status || "").toLowerCase()}`] || ""}`}>
                                            {lead.status}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* Action Required */}
                <section className={styles.card}>
                    <div className={styles.cardHead}>
                        <h2>Action Required</h2>
                    </div>
                    <ul className={styles.actionList}>
                        {actionRequiredMock.map((item) => (
                            <li key={item.id} className={styles.actionRow} onClick={() => navigate(item.to)}>
                                <AlertTriangle size={16} className={styles.actionIcon} />
                                <div>
                                    <strong>{item.title}</strong>
                                    <span>{item.detail}</span>
                                </div>
                                <ChevronRight size={14} className={styles.chevron} />
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            <div className={styles.twoCol}>
                {/* Service Health */}
                <section className={styles.card}>
                    <div className={styles.cardHead}>
                        <h2>Service Health</h2>
                        <button className={styles.linkBtn} onClick={() => navigate("/vendor/services")}>
                            Manage <ChevronRight size={14} />
                        </button>
                    </div>
                    <ul className={styles.serviceHealthList}>
                        {serviceHealthMock.map((s) => (
                            <li key={s.id} className={styles.serviceHealthRow}>
                                <span>{s.name}</span>
                                <span className={`${styles.badge} ${styles[`b_tone_${SERVICE_STATUS_TONE[s.status] || "gray"}`]}`}>
                                    {s.status}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Performance Overview */}
                <section className={styles.card}>
                    <div className={styles.cardHead}>
                        <h2>Performance Overview</h2>
                        <div className={styles.rangeTabs}>
                            {RANGES.map((r) => (
                                <button
                                    key={r}
                                    className={`${styles.rangeTab} ${range === r ? styles.rangeTabActive : ""}`}
                                    onClick={() => setRange(r)}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className={styles.chart}>
                        {series.map((v, i) => (
                            <div
                                key={i}
                                className={styles.bar}
                                style={{ height: `${Math.max(6, (v / maxSeries) * 100)}%` }}
                                title={`${v}`}
                            />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

function KpiCard({ icon: Icon, label, value, accent = "default" }) {
    return (
        <div className={`${styles.kpi} ${styles[`kpi_${accent}`]}`}>
            <span className={styles.kpiIcon}>
                <Icon size={18} />
            </span>
            <div>
                <h4>{value}</h4>
                <p>{label}</p>
            </div>
        </div>
    );
}