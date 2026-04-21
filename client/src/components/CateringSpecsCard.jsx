import React from "react";
import {
    Utensils,
    Users,
    Clock,
    Truck,
    Shield,
    CheckCircle2,
    XCircle,
    IndianRupee,
    Leaf,
} from "lucide-react";
import styles from "../styles/VenueSpecsCard.module.css"; // Reuse same styles for consistency

const formatText = (text) => {
    if (!text) return "-";
    return text
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
};

function InfoBadge({ icon: Icon, label, value, highlight = false }) {
    return (
        <div className={styles.specItem}>
            <Icon size={28} className={styles.specIcon} />
            <div className={styles.specContent}>
                <p className={`${styles.specValue} ${highlight ? styles.highlight : ""}`}>
                    {value || "-"}
                </p>
                <p className={styles.specLabel}>{label}</p>
            </div>
        </div>
    );
}

export default function CateringSpecsCard({ catering }) {
    if (!catering) return null;

    const {
        cuisine_types = [],
        service_styles = [],
        special_diets_supported = [],
        min_order,
        max_order,
        veg_price_per_head,
        non_veg_price_per_head,
        staff_included,
        crockery_cutlery_included,
        tasting_available,
        customizable_menu,
        gst_percentage,
        setup_time_minutes,
        service_duration_minutes,
    } = catering;

    return (
        <div className={styles.card}>
            <h3 className={styles.title}>
                <Utensils size={24} className={styles.titleIcon} />
                Catering Specifications
            </h3>

            {/* Main Specs Grid */}
            <div className={styles.specsGrid}>
                <InfoBadge
                    icon={Users}
                    label="Minimum Order"
                    value={min_order ? `${min_order} guests` : "-"}
                    highlight
                />

                {max_order && (
                    <InfoBadge
                        icon={Users}
                        label="Maximum Order"
                        value={`${max_order} guests`}
                    />
                )}

                {veg_price_per_head && (
                    <InfoBadge
                        icon={IndianRupee}
                        label="Veg Price / Head"
                        value={`₹${veg_price_per_head}`}
                        highlight
                    />
                )}

                {non_veg_price_per_head && (
                    <InfoBadge
                        icon={IndianRupee}
                        label="Non-Veg Price / Head"
                        value={`₹${non_veg_price_per_head}`}
                        highlight
                    />
                )}

                {setup_time_minutes && (
                    <InfoBadge
                        icon={Clock}
                        label="Setup Time"
                        value={`${setup_time_minutes} mins`}
                    />
                )}

                {service_duration_minutes && (
                    <InfoBadge
                        icon={Clock}
                        label="Service Duration"
                        value={`${service_duration_minutes} mins`}
                    />
                )}
            </div>

            {/* Service Styles */}
            {service_styles.length > 0 && (
                <div style={{ marginTop: "2rem" }}>
                    <h4 className={styles.sectionTitle}>Service Styles Offered</h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "12px" }}>
                        {service_styles.map((style, index) => (
                            <div key={index} className={styles.styleBadge}>
                                {formatText(style)}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Cuisine Types */}
            {cuisine_types.length > 0 && (
                <div style={{ marginTop: "2rem" }}>
                    <h4 className={styles.sectionTitle}>Cuisines Offered</h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "12px" }}>
                        {cuisine_types.map((cuisine, index) => (
                            <div key={index} className={styles.styleBadge}>
                                {cuisine}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Dietary Options */}
            {special_diets_supported.length > 0 && (
                <div style={{ marginTop: "2rem" }}>
                    <h4 className={styles.sectionTitle}>Special Diets Supported</h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "12px" }}>
                        {special_diets_supported.map((diet, index) => (
                            <div key={index} className={styles.styleBadge} style={{ background: "#f0fdf4", color: "#166534" }}>
                                <Leaf size={16} style={{ marginRight: "6px" }} />
                                {diet}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Inclusions */}
            <div style={{ marginTop: "2.5rem" }}>
                <h4 className={styles.sectionTitle}>What's Included</h4>
                <div className={styles.policiesGrid}>
                    <div className={styles.policyRow}>
                        <div className={styles.policyLabel}>
                            <CheckCircle2 size={20} style={{ color: "#22c55e" }} />
                            <span>Staff</span>
                        </div>
                        <span style={{ fontWeight: 600, color: staff_included ? "#22c55e" : "#ef4444" }}>
                            {staff_included ? "Included" : "Not Included"}
                        </span>
                    </div>

                    <div className={styles.policyRow}>
                        <div className={styles.policyLabel}>
                            <CheckCircle2 size={20} style={{ color: "#22c55e" }} />
                            <span>Crockery & Cutlery</span>
                        </div>
                        <span style={{ fontWeight: 600, color: crockery_cutlery_included ? "#22c55e" : "#ef4444" }}>
                            {crockery_cutlery_included ? "Included" : "Not Included"}
                        </span>
                    </div>

                    <div className={styles.policyRow}>
                        <div className={styles.policyLabel}>
                            <CheckCircle2 size={20} />
                            <span>Tasting Session</span>
                        </div>
                        <span style={{ fontWeight: 600, color: tasting_available ? "#22c55e" : "#6b7280" }}>
                            {tasting_available ? "Available" : "Not Available"}
                        </span>
                    </div>

                    <div className={styles.policyRow}>
                        <div className={styles.policyLabel}>
                            <Shield size={20} />
                            <span>Customizable Menu</span>
                        </div>
                        <span style={{ fontWeight: 600, color: customizable_menu ? "#22c55e" : "#ef4444" }}>
                            {customizable_menu ? "Yes" : "No"}
                        </span>
                    </div>
                </div>
            </div>

            {gst_percentage && (
                <p style={{ marginTop: "1.5rem", fontSize: "0.9rem", color: "#6b7280" }}>
                    GST: {gst_percentage}% • Price includes tax: {catering.price_includes_tax ? "Yes" : "No"}
                </p>
            )}
        </div>
    );
}