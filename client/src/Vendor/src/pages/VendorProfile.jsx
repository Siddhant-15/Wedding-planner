import React, { useState } from "react";
import { Info, ExternalLink } from "lucide-react";

import { profileMock, profileCompletenessMock } from "../mock/Vendordashboardmock";
import styles from "../styles/VendorProfile.module.css";

export default function VendorProfile() {
    // Local-only state: there is no profile GET/PUT endpoint yet, so
    // nothing here persists on refresh. Wire this up to a real
    // vendorProfileService once that API exists.
    const [profile, setProfile] = useState(profileMock);

    const update = (field, value) => setProfile((p) => ({ ...p, [field]: value }));
    const updateNested = (parent, field, value) =>
        setProfile((p) => ({ ...p, [parent]: { ...p[parent], [field]: value } }));

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1>Profile</h1>
                    <p>Manage how your business appears to customers.</p>
                </div>
                <button type="button" className={styles.previewBtn}>
                    View Public Profile <ExternalLink size={14} />
                </button>
            </header>

            {/* Completeness */}
            <section className={styles.completenessCard}>
                <div className={styles.completenessTop}>
                    <span>Profile completeness</span>
                    <strong>{profileCompletenessMock.percent}%</strong>
                </div>
                <div className={styles.completenessTrack}>
                    <div
                        className={styles.completenessFill}
                        style={{ width: `${profileCompletenessMock.percent}%` }}
                    />
                </div>
                <ul className={styles.recommendations}>
                    {profileCompletenessMock.recommendations.map((r, i) => (
                        <li key={i}>{r}</li>
                    ))}
                </ul>
            </section>

            <div className={styles.notice}>
                <Info size={14} />
                Profile editing isn't connected to a backend yet — changes here won't be saved.
            </div>

            {/* Business Information */}
            <section className={styles.card}>
                <h2>Business Information</h2>
                <div className={styles.formGrid}>
                    <Field
                        label="Business Name"
                        value={profile.businessName}
                        onChange={(v) => update("businessName", v)}
                        placeholder="e.g. Mangalam Photography Studio"
                    />
                </div>
                <Field
                    label="About"
                    value={profile.about}
                    onChange={(v) => update("about", v)}
                    textarea
                    placeholder="Tell customers about your business..."
                />
            </section>

            {/* Contact */}
            <section className={styles.card}>
                <h2>Contact Information</h2>
                <div className={styles.formGrid}>
                    <Field
                        label="Email"
                        value={profile.contactEmail}
                        onChange={(v) => update("contactEmail", v)}
                        placeholder="business@example.com"
                    />
                    <Field
                        label="Phone"
                        value={profile.contactPhone}
                        onChange={(v) => update("contactPhone", v)}
                        placeholder="+91 98765 43210"
                    />
                </div>
            </section>

            {/* Locations */}
            <section className={styles.card}>
                <h2>Locations</h2>
                {profile.locations.length === 0 ? (
                    <p className={styles.emptyText}>No locations added yet.</p>
                ) : (
                    <ul className={styles.chipList}>
                        {profile.locations.map((loc, i) => (
                            <li key={i} className={styles.chip}>{loc}</li>
                        ))}
                    </ul>
                )}
            </section>

            {/* Portfolio */}
            <section className={styles.card}>
                <h2>Portfolio</h2>
                {profile.portfolioImages.length === 0 ? (
                    <p className={styles.emptyText}>
                        No portfolio images yet. Add images from the Services page to showcase your work.
                    </p>
                ) : (
                    <div className={styles.portfolioGrid}>
                        {profile.portfolioImages.map((src, i) => (
                            <img key={i} src={src} alt={`Portfolio ${i + 1}`} className={styles.portfolioImg} />
                        ))}
                    </div>
                )}
            </section>

            {/* Social Links */}
            <section className={styles.card}>
                <h2>Social Links</h2>
                <div className={styles.formGrid}>
                    <Field
                        label="Instagram"
                        value={profile.socialLinks.instagram}
                        onChange={(v) => updateNested("socialLinks", "instagram", v)}
                        placeholder="https://instagram.com/yourbusiness"
                    />
                    <Field
                        label="Website"
                        value={profile.socialLinks.website}
                        onChange={(v) => updateNested("socialLinks", "website", v)}
                        placeholder="https://yourbusiness.com"
                    />
                </div>
            </section>

            {/* Policies */}
            <section className={styles.card}>
                <h2>Policies</h2>
                <Field
                    label="Cancellation & booking policy"
                    value={profile.policies}
                    onChange={(v) => update("policies", v)}
                    textarea
                    placeholder="Describe your cancellation and booking policies..."
                />
            </section>

            <div className={styles.footerActions}>
                <button type="button" className={styles.saveBtn} disabled title="Not connected to a backend yet">
                    Save Changes
                </button>
            </div>
        </div>
    );
}

function Field({ label, value, onChange, placeholder, textarea }) {
    return (
        <label className={styles.field}>
            <span className={styles.fieldLabel}>{label}</span>
            {textarea ? (
                <textarea
                    className={styles.textarea}
                    value={value}
                    placeholder={placeholder}
                    onChange={(e) => onChange(e.target.value)}
                    rows={4}
                />
            ) : (
                <input
                    className={styles.input}
                    value={value}
                    placeholder={placeholder}
                    onChange={(e) => onChange(e.target.value)}
                />
            )}
        </label>
    );
}