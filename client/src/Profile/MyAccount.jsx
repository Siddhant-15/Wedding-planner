import React from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  Edit3,
  Award,
  Heart,
  CreditCard,
  Camera,
} from "lucide-react";
// import NavBar from "../navbar/components/Navbar";
import PageShell from "./components/PageShell";
import SideNav from "./components/SideNav";
import { MOCK_USER, MOCK_BOOKINGS, MOCK_PAYMENTS } from "./data/mockData";
import styles from "./styles/MyAccount.module.css";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

function MyAccount() {
  const user = MOCK_USER;
  const initials = user.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  const upcomingBookings = MOCK_BOOKINGS.filter((b) => b.status === "confirmed" || b.status === "pending");
  const totalSpent = MOCK_PAYMENTS.filter((p) => p.status === "success").reduce((s, p) => s + p.amount, 0);

  return (
    <>
      {/* <NavBar /> */}
      <PageShell
        title="My Account"
        subtitle="Your personal hub — overview, profile details, and quick links."
        breadcrumbs={[{ label: "My Account" }]}
        sidebar={<SideNav active="account" />}
      >
        {/* Hero / profile card */}
        <section className={styles.hero}>
          <div className={styles.heroAvatar}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <span>{initials}</span>
            )}
            <button className={styles.avatarEditBtn} aria-label="Change photo">
              <Camera size={14} />
            </button>
          </div>

          <div className={styles.heroInfo}>
            <div className={styles.heroNameRow}>
              <h2 className={styles.heroName}>{user.name}</h2>
              <span className={styles.verifiedBadge}>
                <ShieldCheck size={13} />
                Verified
              </span>
            </div>
            <p className={styles.heroMeta}>
              <Mail size={14} /> {user.email}
            </p>
            <p className={styles.heroMeta}>
              <Phone size={14} /> {user.phone}
            </p>
            <p className={styles.heroJoined}>Member since {formatDate(user.joinedOn)}</p>
          </div>

          <div className={styles.heroActions}>
            <a href="/profile-settings" className={styles.primaryBtn}>
              <Edit3 size={15} />
              <span>Edit Profile</span>
            </a>
          </div>
        </section>

        {/* Quick stats */}
        <section className={styles.statsGrid}>
          <QuickStat
            icon={Calendar}
            label="Upcoming Events"
            value={upcomingBookings.length}
            link={{ href: "/my-bookings", label: "View bookings" }}
          />
          <QuickStat
            icon={Award}
            label="Total Bookings"
            value={MOCK_BOOKINGS.length}
            link={{ href: "/my-bookings", label: "View all" }}
          />
          <QuickStat
            icon={CreditCard}
            label="Lifetime Spend"
            value={formatINR(totalSpent)}
            link={{ href: "/payments", label: "View payments" }}
          />
          <QuickStat
            icon={Heart}
            label="Wishlist Items"
            value={8}
            link={{ href: "/wishlist", label: "View wishlist" }}
          />
        </section>

        {/* Two-column: details + upcoming */}
        <div className={styles.twoCol}>
          {/* Profile details */}
          <section className={styles.panel}>
            <header className={styles.panelHeader}>
              <h3 className={styles.panelTitle}>Personal Information</h3>
              <a href="/profile-settings" className={styles.linkBtn}>
                Edit
              </a>
            </header>

            <dl className={styles.detailList}>
              <DetailRow icon={User} label="Full Name" value={user.name} />
              <DetailRow icon={Mail} label="Email Address" value={user.email} />
              <DetailRow icon={Phone} label="Phone Number" value={user.phone} />
              <DetailRow icon={Calendar} label="Date of Birth" value={formatDate(user.dob)} />
              <DetailRow
                icon={MapPin}
                label="Address"
                value={`${user.address}, ${user.city}, ${user.state} ${user.pincode}`}
              />
            </dl>
          </section>

          {/* Upcoming events */}
          <section className={styles.panel}>
            <header className={styles.panelHeader}>
              <h3 className={styles.panelTitle}>Upcoming Events</h3>
              <a href="/my-bookings" className={styles.linkBtn}>
                View all
              </a>
            </header>

            {upcomingBookings.length === 0 ? (
              <p className={styles.emptyText}>No upcoming bookings.</p>
            ) : (
              <ul className={styles.eventList}>
                {upcomingBookings.map((b) => (
                  <li key={b.id} className={styles.eventItem}>
                    <div className={styles.eventDate}>
                      <span className={styles.eventDay}>
                        {new Date(b.date).getDate()}
                      </span>
                      <span className={styles.eventMonth}>
                        {new Date(b.date).toLocaleString("en-IN", { month: "short" })}
                      </span>
                    </div>
                    <div className={styles.eventInfo}>
                      <span className={styles.eventTitle}>{b.serviceName}</span>
                      <span className={styles.eventMeta}>
                        <MapPin size={12} /> {b.location} · {b.time}
                      </span>
                    </div>
                    <span className={styles.eventCategory}>{b.category}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </PageShell>
    </>
  );
}

/* ---------- Subcomponents ---------- */

function QuickStat({ icon: Icon, label, value, link }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statIcon}>
        <Icon size={18} />
      </div>
      <div className={styles.statBody}>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.statValue}>{value}</span>
        {link && (
          <a href={link.href} className={styles.statLink}>
            {link.label} →
          </a>
        )}
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className={styles.detailRow}>
      <div className={styles.detailIcon}>
        <Icon size={16} />
      </div>
      <div className={styles.detailContent}>
        <dt className={styles.detailLabel}>{label}</dt>
        <dd className={styles.detailValue}>{value}</dd>
      </div>
    </div>
  );
}

export default MyAccount;
