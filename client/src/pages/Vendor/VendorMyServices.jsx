import React from 'react'
import styles from '../../styles/VendorMyServices.module.css'
// import Navbar from '../../components/Navbar'
import VendorServices from '../../components/VendorServices'

const VendorMyServices = () => {
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
            <VendorServices />
        </div>
    )
}

export default VendorMyServices
