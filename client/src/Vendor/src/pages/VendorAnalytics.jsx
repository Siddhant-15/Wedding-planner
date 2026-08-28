import React, { useState, useMemo } from "react";
import { Eye, Inbox, Zap, Clock3, CheckCircle2 } from "lucide-react";

import {
    kpiMock,
    performanceSeriesMock,
    servicePerformanceMock,
    leadFunnelMock,
} from "../mock/Vendordashboardmock";

import styles from "../styles/VendorAnalytics.module.css";

const RANGES = ["7D", "30D", "3M", "6M", "1Y"];

export default function VendorAnalytics() {
    const [range, setRange] = useState("7D");

    const series = performanceSeriesMock[range] || [];
    const maxSeries = Math.max(1, ...series);
    const maxFunnel = Math.max(1, ...leadFunnelMock.map((f) => f.value));

    const offlineBookings = useMemo(
        () => leadFunnelMock[leadFunnelMock.length - 1]?.value ?? 0,
        []
    );

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1>Analytics</h1>
                    <p>Track how your profile and services are performing.</p>
                </div>
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
            </header>

            <section className={styles.kpiGrid}>
                <Kpi icon={Eye} label="Profile Views" value={kpiMock.profileViews.toLocaleString()} />
                <Kpi icon={Eye} label="Service Views" value={kpiMock.serviceViews.toLocaleString()} />
                <Kpi icon={Inbox} label="Leads" value={leadFunnelMock[0].value} />
                <Kpi icon={Zap} label="Response Rate" value={`${kpiMock.responseRate}%`} />
                <Kpi icon={Clock3} label="Avg. Response Time" value={kpiMock.avgResponseTime} />
                <Kpi icon={CheckCircle2} label="Offline Bookings Reported" value={offlineBookings} />
            </section>
            <p className={styles.mockNote}>
                All figures on this page are placeholder values until the analytics API is available.
            </p>

            <section className={styles.card}>
                <h2>Profile Performance</h2>
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

            <div className={styles.twoCol}>
                <section className={styles.card}>
                    <h2>Service Performance</h2>
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Service</th>
                                    <th>Views</th>
                                    <th>Leads</th>
                                    <th>Conversion</th>
                                </tr>
                            </thead>
                            <tbody>
                                {servicePerformanceMock.map((s) => (
                                    <tr key={s.id}>
                                        <td>{s.name}</td>
                                        <td>{s.views.toLocaleString()}</td>
                                        <td>{s.leads}</td>
                                        <td>{s.conversion}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className={styles.card}>
                    <h2>Lead Funnel</h2>
                    <div className={styles.funnel}>
                        {leadFunnelMock.map((f) => (
                            <div key={f.label} className={styles.funnelRow}>
                                <div className={styles.funnelLabel}>
                                    <span>{f.label}</span>
                                    <span>{f.value}</span>
                                </div>
                                <div className={styles.funnelTrack}>
                                    <div
                                        className={styles.funnelFill}
                                        style={{ width: `${(f.value / maxFunnel) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

function Kpi({ icon: Icon, label, value }) {
    return (
        <div className={styles.kpi}>
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