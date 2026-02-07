import React, { useState } from 'react';
import {
  Users,
  Shield,
  AlertTriangle,
  BarChart3,
  Search,
  Filter,
  MoreVertical,
  Ban,
  CheckCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import styles from "../../styles/AdminDashboard.module.css"

const AdminDashboard = () => {
  const [vendors] = useState([
    {
      id: 1,
      name: 'Royal Events Co.',
      email: 'contact@royalevents.com',
      status: 'active',
      services: 5,
      totalBookings: 45,
      revenue: '₹12,50,000',
      joinDate: '2024-01-15',
      location: 'Mumbai, Maharashtra'
    },
    {
      id: 2,
      name: 'Elite Photography',
      email: 'info@elitephoto.com',
      status: 'active',
      services: 3,
      totalBookings: 28,
      revenue: '₹8,75,000',
      joinDate: '2024-02-20',
      location: 'Delhi, NCR'
    },
    {
      id: 3,
      name: 'Premium Catering',
      email: 'hello@premiumcatering.com',
      status: 'pending',
      services: 2,
      totalBookings: 0,
      revenue: '₹0',
      joinDate: '2024-03-10',
      location: 'Bangalore, Karnataka'
    }
  ]);

  const [allServices] = useState([
    {
      id: 1,
      name: 'Royal Wedding Venue',
      vendor: 'Royal Events Co.',
      type: 'Wedding Venue',
      status: 'active',
      price: '₹2,50,000',
      bookings: 15,
      rating: 4.8,
      reports: 0
    },
    {
      id: 2,
      name: 'Elite Photography Services',
      vendor: 'Elite Photography',
      type: 'Photography',
      status: 'active',
      price: '₹50,000',
      bookings: 12,
      rating: 4.9,
      reports: 0
    },
    {
      id: 3,
      name: 'Budget Venue Hall',
      vendor: 'Royal Events Co.',
      type: 'Wedding Venue',
      status: 'flagged',
      price: '₹1,00,000',
      bookings: 8,
      rating: 3.2,
      reports: 3
    }
  ]);

  const [stats] = useState({
    totalVendors: 156,
    activeVendors: 134,
    totalServices: 487,
    flaggedContent: 12,
    totalRevenue: '₹45,67,000',
    monthlyGrowth: '+15%'
  });

  return (
    <div className={styles.dashboard}>
      <Navbar />

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Admin Dashboard</h1>
            <p className={styles.subtitle}>Manage vendors, services, and platform moderation</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.outlineBtn}>
              <Filter size={16} />
              Filters
            </button>
            <button className={styles.primaryBtn}>
              <Shield size={16} />
              Security Panel
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span>Total Vendors</span>
              <Users size={16} />
            </div>
            <div className={styles.cardContent}>
              <div className={styles.statValue}>{stats.totalVendors}</div>
              <p>{stats.activeVendors} active vendors</p>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span>Total Services</span>
              <BarChart3 size={16} />
            </div>
            <div className={styles.cardContent}>
              <div className={styles.statValue}>{stats.totalServices}</div>
              <p>Across all categories</p>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span>Flagged Content</span>
              <AlertTriangle size={16} />
            </div>
            <div className={styles.cardContent}>
              <div className={`${styles.statValue} ${styles.warning}`}>{stats.flaggedContent}</div>
              <p>Requires attention</p>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span>Platform Revenue</span>
              <BarChart3 size={16} />
            </div>
            <div className={styles.cardContent}>
              <div className={styles.statValue}>{stats.totalRevenue}</div>
              <p>{stats.monthlyGrowth} from last month</p>
            </div>
          </div>
        </div>

        {/* Vendor List Example */}
        <h3 className={styles.sectionTitle}>Vendor Management</h3>
        <div className={styles.vendorList}>
          {vendors.map((vendor) => (
            <div key={vendor.id} className={styles.vendorCard}>
              <div>
                <h4>{vendor.name}</h4>
                <p>{vendor.email}</p>
                <p>{vendor.location}</p>
              </div>
              <div className={styles.vendorStats}>
                <span>{vendor.services} Services</span>
                <span>{vendor.totalBookings} Bookings</span>
                <span>{vendor.revenue} Revenue</span>
              </div>
              <div className={styles.vendorActions}>
                <button><CheckCircle size={14}/> Approve</button>
                <button><AlertTriangle size={14}/> Flag</button>
                <button><Ban size={14}/> Suspend</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
