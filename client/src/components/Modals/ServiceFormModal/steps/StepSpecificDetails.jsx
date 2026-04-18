// src/components/services/ServiceFormModal/steps/StepSpecificDetails.jsx

import React, { useState } from 'react';
import {
    hallTypes,
    indoorOutdoorOptions,
    policyOptions,
    alcoholOptions,
    serviceStyles,
    packageModals
} from '../formConstants';
import styles from '../../../../styles/ServiceForm.module.css';


const MAX_LIMITS = {
    square_feet: 100000,
    capacity_min: 10000,
    capacity_max: 10000,
    parking_capacity: 2000,
    veg_price_per_head: 10000,
    nonveg_price_per_head: 15000,
    min_order: 10000,
    max_order: 10000,
    duration_hours: 24,
    setup_time_required: 24,
    team_size: 500,
    experience_years: 50,
    service_duration_minutes: 480,     // Max 8 hours
    travel_cost_per_km: 1000,
};



const StepSpecificDetails = ({
    formData,
    handleInputChange,
    newGenre,
    setNewGenre,
    newEquipment,
    setNewEquipment,
    newCuisine,
    setNewCuisine,
    newSpecialDiet,
    setNewSpecialDiet,
    newListItem,
    setNewListItem
}) => {
    console.log(formData.category, "category")
    if (!formData.category) {
        return <p className={styles.infoText}>Please select a service category in the previous step.</p>;
    }
    const [errors, setErrors] = useState({});

    const [localServiceStyle, setLocalServiceStyle] = useState("");

    const handleNumberChange = (field, value) => {
        if (value === "") {
            handleInputChange(field, "");
            return;
        }

        let num = Number(value);
        if (isNaN(num)) return;

        if (num < 0) num = 0;

        if (MAX_LIMITS[field] && num > MAX_LIMITS[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: `Max allowed is ${MAX_LIMITS[field]}`
            }));
            num = MAX_LIMITS[field];
        } else {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }

        handleInputChange(field, num);
    };

    const handleAddItem = (field, value, setValue) => {
        const trimmed = typeof value === 'string' ? value.trim() : value;
        if (trimmed && !(formData[field] || []).includes(trimmed)) {
            handleInputChange(field, [...(formData[field] || []), trimmed]);
            setValue("");
        }
    };

    const handleRemoveItem = (field, item) => {
        handleInputChange(field, (formData[field] || []).filter(t => t !== item));
    };

    const handleNestedChange = (parent, key, value) => {
        handleInputChange(parent, {
            ...(formData[parent] || {}),
            [key]: value
        });
    };

    const addRule = () => {
        const current = formData.venue_policies?.other_policies || [];

        handleNestedChange("venue_policies", "other_policies", [
            ...current,
            { title: "", description: "" }
        ]);
    };

    const removeRule = (index) => {
        const updated = [...(formData.venue_policies?.other_policies || [])];
        updated.splice(index, 1);

        handleNestedChange("venue_policies", "other_policies", updated);
    };

    const handleRuleChange = (index, field, value) => {
        const updated = [...(formData.venue_policies?.other_policies || [])];
        updated[index][field] = value;

        handleNestedChange("venue_policies", "other_policies", updated);
    };

    const renderError = (field) =>
        errors[field] ? <span className={styles.error}>{errors[field]}</span> : null;

    const renderCategoryFields = () => {
        switch (formData.category) {
            case "venue":
                return (
                    <>
                        {/* BASIC DETAILS */}
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Minimum Capacity</label>
                            <input
                                type="number"
                                value={formData.capacity_min}
                                onChange={(e) => handleInputChange("capacity_min", e.target.value)}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Maximum Capacity</label>
                            <input
                                type="number"
                                value={formData.capacity_max}
                                onChange={(e) => handleInputChange("capacity_max", e.target.value)}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Hall Type</label>
                            <select
                                value={formData.hall_type}
                                onChange={(e) => handleInputChange("hall_type", e.target.value)}
                                className={styles.input}
                            >
                                <option value="">Select</option>
                                {hallTypes.map((type) => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Indoor / Outdoor</label>
                            <select
                                value={formData.indoor_outdoor}
                                onChange={(e) => handleInputChange("indoor_outdoor", e.target.value)}
                                className={styles.input}
                            >
                                <option value="">Select</option>
                                {indoorOutdoorOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Square Feet</label>
                            <input
                                type="number"
                                value={formData.square_feet}
                                onChange={(e) => handleInputChange("square_feet", e.target.value)}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Parking Capacity</label>
                            <input
                                type="number"
                                value={formData.parking_capacity}
                                onChange={(e) => handleInputChange("parking_capacity", e.target.value)}
                                className={styles.input}
                            />
                        </div>

                        {/* ================= VENUE POLICIES ================= */}
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>Venue Policies</h3>

                            {/* Policy Grid */}
                            <div className={styles.policyGrid}>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Decoration</label>
                                    <select
                                        value={formData.venue_policies.decoration_policy}
                                        onChange={(e) =>
                                            handleNestedChange("venue_policies", "decoration_policy", e.target.value)
                                        }
                                        className={styles.input}
                                    >
                                        <option value="">Select</option>
                                        {policyOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Catering</label>
                                    <select
                                        value={formData.venue_policies.catering_policy}
                                        onChange={(e) =>
                                            handleNestedChange("venue_policies", "catering_policy", e.target.value)
                                        }
                                        className={styles.input}
                                    >
                                        <option value="">Select</option>
                                        {policyOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Alcohol</label>
                                    <select
                                        value={formData.venue_policies.alcohol_policy}
                                        onChange={(e) =>
                                            handleNestedChange("venue_policies", "alcohol_policy", e.target.value)
                                        }
                                        className={styles.input}
                                    >
                                        <option value="">Select</option>
                                        {alcoholOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* OTHER POLICIES (DYNAMIC) */}
                            <div className={styles.rulesSection}>
                                <h4 className={styles.subTitle}>Other Policies / Rules</h4>

                                {formData.venue_policies.other_policies.map((rule, index) => (
                                    <div key={index} className={styles.ruleRow}>
                                        <input
                                            type="text"
                                            placeholder="Title (e.g., Music Timing)"
                                            value={rule.title}
                                            onChange={(e) =>
                                                handleRuleChange(index, "title", e.target.value)
                                            }
                                            className={styles.input}
                                        />

                                        <input
                                            type="text"
                                            placeholder="Description"
                                            value={rule.description}
                                            onChange={(e) =>
                                                handleRuleChange(index, "description", e.target.value)
                                            }
                                            className={styles.input}
                                        />

                                        <button
                                            type="button"
                                            onClick={() => removeRule(index)}
                                            className={styles.removeBtn}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={addRule}
                                    className={styles.addBtn}
                                >
                                    + Add Rule
                                </button>
                            </div>
                        </div>
                    </>
                ); case "catering":
                return (
                    <>
                        {/* Cuisine Types */}
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Cuisine Types</label>
                            <div className={styles.listInputRow}>
                                <input
                                    type="text"
                                    value={newCuisine || ""}
                                    onChange={(e) => setNewCuisine(e.target.value)}
                                    placeholder="e.g., Indian, Chinese, Continental"
                                    className={styles.input}
                                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddItem("cuisine_types", newCuisine, setNewCuisine))}
                                />
                                <button type="button" onClick={() => handleAddItem("cuisine_types", newCuisine, setNewCuisine)} className={styles.addBtn}>
                                    Add
                                </button>
                            </div>
                            <div className={styles.listItems}>
                                {Array.isArray(formData.cuisine_types) && formData.cuisine_types.length > 0 ? (
                                    formData.cuisine_types.map((item, index) => (
                                        <span key={index} className={styles.badge}>
                                            {item}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem("cuisine_types", item)}
                                                className={styles.removeBtn}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))
                                ) : (
                                    <p className={styles.emptyText}>No cuisines added yet</p>
                                )}
                            </div>
                        </div>

                        {/* Special Diets Supported */}
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Special Diets Supported</label>
                            <div className={styles.listInputRow}>
                                <input
                                    type="text"
                                    value={newSpecialDiet || ""}
                                    onChange={(e) => setNewSpecialDiet(e.target.value)}
                                    placeholder="e.g., Jain, Vegan, Gluten Free, Keto"
                                    className={styles.input}
                                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddItem("special_diets_supported", newSpecialDiet, setNewSpecialDiet))}
                                />
                                <button type="button" onClick={() => handleAddItem("special_diets_supported", newSpecialDiet, setNewSpecialDiet)} className={styles.addBtn}>
                                    Add
                                </button>
                            </div>
                            <div className={styles.listItems}>
                                {Array.isArray(formData.special_diets_supported) && formData.special_diets_supported.length > 0 ? (
                                    formData.special_diets_supported.map((item, index) => (
                                        <span key={index} className={styles.badge}>
                                            {item}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem("special_diets_supported", item)}
                                                className={styles.removeBtn}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))
                                ) : (
                                    <p className={styles.emptyText}>No special diets added yet</p>
                                )}
                            </div>
                        </div>

                        {/* Pricing Fields */}
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Veg Price per Head (₹)</label>
                            <input
                                type="number"
                                value={formData.veg_price_per_head || ""}
                                onChange={(e) => handleInputChange("veg_price_per_head", e.target.value)}
                                placeholder="500"
                                className={styles.input}
                                min="0"
                                step="any"
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Non-Veg Price per Head (₹)</label>
                            <input
                                type="number"
                                value={formData.nonveg_price_per_head || ""}
                                onChange={(e) => handleInputChange("nonveg_price_per_head", e.target.value)}
                                placeholder="700"
                                className={styles.input}
                                min="0"
                                step="any"
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Minimum Order</label>
                            <input
                                type="number"
                                value={formData.min_order || ""}
                                onChange={(e) => handleInputChange("min_order", e.target.value)}
                                placeholder="50"
                                className={styles.input}
                                min="1"
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Maximum Order</label>
                            <input
                                type="number"
                                value={formData.max_order || ""}
                                onChange={(e) => handleInputChange("max_order", e.target.value)}
                                placeholder="500"
                                className={styles.input}
                                min="0"
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Service Styles</label>
                            <div className={styles.listInputRow}>
                                <select
                                    value={localServiceStyle}
                                    onChange={(e) => setLocalServiceStyle(e.target.value)}
                                    className={styles.input}
                                >
                                    <option value="">Select Style</option>
                                    {serviceStyles.map((style) => (
                                        <option key={style.value} value={style.value}>
                                            {style.label}
                                        </option>
                                    ))}
                                </select>
                                <button type="button" onClick={() => handleAddItem("service_styles_multi", localServiceStyle, setLocalServiceStyle)} className={styles.addBtn}>
                                    Add
                                </button>
                            </div>
                            <div className={styles.listItems}>
                                {Array.isArray(formData.service_styles_multi) && formData.service_styles_multi.length > 0 ? (
                                    formData.service_styles_multi.map((item, index) => {
                                        const label = serviceStyles.find(s => s.value === item)?.label || item;
                                        return (
                                            <span key={index} className={styles.badge}>
                                                {label}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem("service_styles_multi", item)}
                                                    className={styles.removeBtn}
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        );
                                    })
                                ) : (
                                    <p className={styles.emptyText}>No service styles added yet</p>
                                )}
                            </div>
                        </div>

                        <div className={styles.checkboxGroup}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={!!formData.staff_included}
                                    onChange={(e) => handleInputChange("staff_included", e.target.checked)}
                                />
                                Staff Included
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={!!formData.crockery_cutlery_included}
                                    onChange={(e) => handleInputChange("crockery_cutlery_included", e.target.checked)}
                                />
                                Crockery & Cutlery Included
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={!!formData.tasting_available}
                                    onChange={(e) => handleInputChange("tasting_available", e.target.checked)}
                                />
                                Tasting Available
                            </label>
                        </div>
                    </>
                );

            case "dj":
                return (
                    <>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Genres Supported</label>
                            <div className={styles.listInputRow}>
                                <input
                                    type="text"
                                    value={newGenre}
                                    onChange={(e) => setNewGenre(e.target.value)}
                                    placeholder="Add genre"
                                    className={styles.input}
                                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddItem("genres_supported", newGenre, setNewGenre))}
                                />
                                <button type="button" onClick={() => handleAddItem("genres_supported", newGenre, setNewGenre)} className={styles.addBtn}>Add</button>
                            </div>
                            <div className={styles.listItems}>
                                {(formData.genres_supported || []).map((item) => (
                                    <span key={item} className={styles.badge}>
                                        {item}
                                        <button type="button" onClick={() => handleRemoveItem("genres_supported", item)} className={styles.removeBtn}>×</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Duration Hours</label>
                            <input type="number" value={formData.duration_hours} onChange={(e) => handleInputChange("duration_hours", e.target.value)} placeholder="e.g., 4" className={styles.input} min="0" />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Equipment</label>
                            <div className={styles.listInputRow}>
                                <input
                                    type="text"
                                    value={newEquipment}
                                    onChange={(e) => setNewEquipment(e.target.value)}
                                    placeholder="Add equipment"
                                    className={styles.input}
                                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddItem("equipment", newEquipment, setNewEquipment))}
                                />
                                <button type="button" onClick={() => handleAddItem("equipment", newEquipment, setNewEquipment)} className={styles.addBtn}>Add</button>
                            </div>
                            <div className={styles.listItems}>
                                {(formData.equipment || []).map((item) => (
                                    <span key={item} className={styles.badge}>
                                        {item}
                                        <button type="button" onClick={() => handleRemoveItem("equipment", item)} className={styles.removeBtn}>×</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className={styles.checkboxGroup}>
                            <label>
                                <input type="checkbox" checked={formData.lighting_included} onChange={(e) => handleInputChange("lighting_included", e.target.checked)} />
                                Lighting Included
                            </label>
                            <label>
                                <input type="checkbox" checked={formData.mc_host_available} onChange={(e) => handleInputChange("mc_host_available", e.target.checked)} />
                                MC/Host Available
                            </label>
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Setup Time Required (hours)</label>
                            <input type="number" value={formData.setup_time_required} onChange={(e) => handleInputChange("setup_time_required", e.target.value)} placeholder="e.g., 2" className={styles.input} min="0" />
                        </div>
                    </>
                );

            case "photography":
                return (
                    <>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Package Type</label>
                            <div className={styles.listInputRow}>
                                <input
                                    type="text"
                                    value={newListItem}
                                    onChange={(e) => setNewListItem(e.target.value)}
                                    placeholder="Add package type"
                                    className={styles.input}
                                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddItem("photography_types", newListItem, setNewListItem))}
                                />
                                <button type="button" onClick={() => handleAddItem("photography_types", newListItem, setNewListItem)} className={styles.addBtn}>Add</button>
                            </div>
                            <div className={styles.listItems}>
                                {(formData.photography_types || []).map((item) => (
                                    <span key={item} className={styles.badge}>
                                        {item}
                                        <button type="button" onClick={() => handleRemoveItem("photography_types", item)} className={styles.removeBtn}>×</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Hours Covered</label>
                            <input type="number" value={formData.hours_covered} onChange={(e) => handleInputChange("hours_covered", e.target.value)} placeholder="e.g., 8" className={styles.input} min="0" />
                        </div>

                        <div className={styles.checkboxGroup}>
                            <label>
                                <input type="checkbox" checked={formData.videography_included} onChange={(e) => handleInputChange("videography_included", e.target.checked)} />
                                Videography Included
                            </label>
                            <label>
                                <input type="checkbox" checked={formData.drone_available} onChange={(e) => handleInputChange("drone_available", e.target.checked)} />
                                Drone Available
                            </label>
                            <label>
                                <input type="checkbox" checked={formData.album_included} onChange={(e) => handleInputChange("album_included", e.target.checked)} />
                                Album Included
                            </label>
                        </div>
                    </>
                );

            case "event_management":
                return (
                    <>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Event Types</label>
                            <div className={styles.listInputRow}>
                                <input
                                    type="text"
                                    value={newListItem}
                                    onChange={(e) => setNewListItem(e.target.value)}
                                    placeholder="Add event type"
                                    className={styles.input}
                                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddItem("event_types", newListItem, setNewListItem))}
                                />
                                <button type="button" onClick={() => handleAddItem("event_types", newListItem, setNewListItem)} className={styles.addBtn}>Add</button>
                            </div>
                            <div className={styles.listItems}>
                                {(formData.event_types || []).map((item) => (
                                    <span key={item} className={styles.badge}>
                                        {item}
                                        <button type="button" onClick={() => handleRemoveItem("event_types", item)} className={styles.removeBtn}>×</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Team Size</label>
                            <input type="number" value={formData.team_size} onChange={(e) => handleInputChange("team_size", e.target.value)} placeholder="e.g., 10" className={styles.input} min="0" />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Experience (years)</label>
                            <input type="number" value={formData.experience_years} onChange={(e) => handleInputChange("experience_years", e.target.value)} placeholder="e.g., 5" className={styles.input} min="0" />
                        </div>
                    </>
                );
            case "makeup_artist":
                return (
                    <>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Makeup Types</label>
                            <div className={styles.listInputRow}>
                                <input
                                    type="text"
                                    value={newListItem || ""}
                                    placeholder="e.g. bridal, party, hd_makeup"
                                    className={styles.input}
                                    onChange={(e) => setNewListItem(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleAddItem("makeup_types", e.target.value, setNewListItem);
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    className={styles.addBtn}
                                    onClick={() => handleAddItem("makeup_types", newListItem, setNewListItem)}
                                >
                                    Add
                                </button>
                            </div>
                            <div className={styles.listItems}>
                                {(formData.makeup_types || []).map((type, index) => (
                                    <div key={index} className={styles.badge}>
                                        {type}
                                        <button
                                            type="button"
                                            className={styles.removeBtn}
                                            onClick={() => handleRemoveItem("makeup_types", type)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Specialization (You can select multiple)</label>

                            <div className={styles.checkboxGroup}>
                                {[
                                    { value: "bridal", label: "Bridal Makeup" },
                                    { value: "fashion", label: "Fashion / Runway" },
                                    { value: "celebrity", label: "Celebrity / Red Carpet" },
                                    { value: "editorial", label: "Editorial / Magazine" },
                                    { value: "theatrical", label: "Theatrical / Stage" },
                                    { value: "party", label: "Party / Festive" },
                                    { value: "engagement", label: "Engagement / Sangeet" },
                                ].map((option) => (
                                    <label key={option.value} className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={(formData.specialization || []).includes(option.value)}
                                            onChange={(e) => {
                                                const current = formData.specialization || [];
                                                if (e.target.checked) {
                                                    handleInputChange(
                                                        "specialization",
                                                        [...current, option.value]
                                                    );
                                                } else {
                                                    handleInputChange(
                                                        "specialization",
                                                        current.filter(item => item !== option.value)
                                                    );
                                                }
                                            }}
                                        />
                                        {option.label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Brands Used</label>
                            <div className={styles.listInputRow}>
                                <input
                                    type="text"
                                    value={newListItem || ""}
                                    placeholder="e.g. MAC, Huda Beauty, Lakme"
                                    className={styles.input}
                                    onChange={(e) => setNewListItem(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleAddItem("brands_used", e.target.value, setNewListItem);
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    className={styles.addBtn}
                                    onClick={() => handleAddItem("brands_used", newListItem, setNewListItem)}
                                >
                                    Add
                                </button>
                            </div>
                            <div className={styles.listItems}>
                                {(formData.brands_used || []).map((brand, index) => (
                                    <div key={index} className={styles.badge}>
                                        {brand}
                                        <button
                                            type="button"
                                            className={styles.removeBtn}
                                            onClick={() => handleRemoveItem("brands_used", brand)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>
                                <input
                                    type="checkbox"
                                    checked={formData.premium_products_used || false}
                                    onChange={(e) => handleInputChange("premium_products_used", e.target.checked)}
                                />
                                Uses Premium Products
                            </label>
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Team Size</label>
                            <input
                                type="number"
                                value={formData.team_size || ""}
                                onChange={(e) => handleNumberChange("team_size", e.target.value)}
                                className={styles.input}
                                min="1"
                                max="500"
                            />
                            {renderError("team_size")}
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Service Duration (minutes)</label>
                            <input
                                type="number"
                                value={formData.service_duration_minutes || ""}
                                onChange={(e) => handleNumberChange("service_duration_minutes", e.target.value)}
                                className={styles.input}
                                min="15"
                                max="480"
                                step="15"
                            />
                            {renderError("service_duration_minutes")}
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>
                                <input
                                    type="checkbox"
                                    checked={formData.travel_to_client || false}
                                    onChange={(e) => handleInputChange("travel_to_client", e.target.checked)}
                                />
                                Travel to Client Location
                            </label>
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Travel Cost per Km (₹)</label>
                            <input
                                type="number"
                                value={formData.travel_cost_per_km || ""}
                                onChange={(e) => handleNumberChange("travel_cost_per_km", e.target.value)}
                                className={styles.input}
                                min="0"
                                step="0.01"
                            />
                            {renderError("travel_cost_per_km")}
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Base City</label>
                            <input
                                type="text"
                                value={formData.base_city || ""}
                                onChange={(e) => handleInputChange("base_city", e.target.value)}
                                className={styles.input}
                                placeholder="e.g. Delhi, Mumbai, Gurugram"
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>
                                <input
                                    type="checkbox"
                                    checked={formData.hairstyling_included || false}
                                    onChange={(e) => handleInputChange("hairstyling_included", e.target.checked)}
                                />
                                Hairstyling Included
                            </label>
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>
                                <input
                                    type="checkbox"
                                    checked={formData.draping_included || false}
                                    onChange={(e) => handleInputChange("draping_included", e.target.checked)}
                                />
                                Draping Included
                            </label>
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>
                                <input
                                    type="checkbox"
                                    checked={formData.trial_available || false}
                                    onChange={(e) => handleInputChange("trial_available", e.target.checked)}
                                />
                                Trial Session Available
                            </label>
                        </div>
                    </>
                );


            default:
                return <p className={styles.infoText}>No specific details available for this category.</p>;
        }
    };

    return (
        <div className={styles.stepContent}>
            {renderCategoryFields()}
        </div>
    );
};

export default StepSpecificDetails;