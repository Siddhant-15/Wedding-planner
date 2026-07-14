import React, { useState } from 'react';
import styles from '../../styles/VendorMyServices.module.css'
// import Navbar from '../../components/Navbar'
import ServiceStats from '../../components/VendorServiceStats'

const VendorAnalytics = () => {
    const [stats, setStats] = useState({
        totalServices: 0,
        activeServices: 0,
        totalBookings: 0,
        monthlyRevenue: '₹0'
    });
    return (
        <div className={styles.container}>
            {/* <Navbar /> */}
            <div className={styles.pageWrapper}>
                <div className={styles.hero}>
                    <h1 className={styles.title}>Wedding Catering</h1>
                    <p className={styles.subtitle}>
                        Delicious cuisine for your special day
                    </p>
                </div>
            </div>
            <ServiceStats stats={stats} />
        </div>
    )
}

export default VendorAnalytics
