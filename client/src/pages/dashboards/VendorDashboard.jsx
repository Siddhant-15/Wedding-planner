import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
// import VendorServices from '../../components/VendorServices';
import VendorServiceCard from '../../Vendor/src/components/vendor/VendorServiceCard';
import { Plus, Settings, Eye, BarChart3, TrendingUp, Users } from 'lucide-react';
import styles from '../../styles/VendorDashboard.module.css'
import ServiceStats from '../../components/VendorServiceStats';


const VendorDashboard = () => {
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [stats, setStats] = useState({
    totalServices: 0,
    activeServices: 0,
    totalBookings: 0,
    monthlyRevenue: '₹0'
  });


  return (
    <div className={styles.dashboard}>
      <Navbar />
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Vendor Dashboard</h1>
          <p className={styles.subtitle}>Manage your services and track your business growth</p>
        </div>
        {/* <button className={styles.addButton} onClick={() => setIsServiceModalOpen(true)}>
          <Plus size={20} className={styles.icon} />
          Add New Service
        </button> */}
      </div>

      <ServiceStats stats={stats} />
      <VendorServiceCard
        isServiceModalOpen={isServiceModalOpen}
        setIsServiceModalOpen={setIsServiceModalOpen}
        editingService={editingService}
        setEditingService={setEditingService}
        onStatsChange={setStats}
      />


    </div>
  );
};

export default VendorDashboard;