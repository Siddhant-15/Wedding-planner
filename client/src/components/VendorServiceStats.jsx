import React from 'react';
import { Settings, Eye, Users, BarChart3, TrendingUp } from 'lucide-react';
import styles from '../styles/VendorDashboard.module.css';

const ServiceStats = ({ stats }) => {
    // Use optional chaining with fallback defaults
    const totalServices = stats?.totalServices ?? 0;
    const activeServices = stats?.activeServices ?? 0;
    const totalBookings = stats?.totalBookings ?? 0;
    const monthlyRevenue = stats?.monthlyRevenue ?? '₹0';
  return (
    <div className={styles.statsGrid}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span>Total Services</span>
          <Settings className={styles.iconBrand} />
        </div>
        <div className={styles.cardContent}>
        <div className={styles.cardNumber}>{totalServices}</div>
          <p className={styles.cardTrend}><TrendingUp size={14} /> +2 from last month</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span>Active Services</span>
          <Eye className={styles.iconGold} />
        </div>
        <div className={styles.cardContent}>
          <div className={styles.cardNumber}>{activeServices}</div>
          <p>{activeServices}/{totalServices} active</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span>Total Bookings</span>
          <Users className={styles.iconBrand} />
        </div>
        <div className={styles.cardContent}>
          <div className={styles.cardNumber}>{totalBookings}</div>
          <p className={styles.cardTrend}><TrendingUp size={14} /> +12% from last month</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span>Monthly Revenue</span>
          <BarChart3 className={styles.iconGold} />
        </div>
        <div className={styles.cardContent}>
          <div className={styles.cardNumber}>{monthlyRevenue}</div>
          <p className={styles.cardTrend}><TrendingUp size={14} /> +20% from last month</p>
        </div>
      </div>
    </div>
  );
};

export default ServiceStats;
