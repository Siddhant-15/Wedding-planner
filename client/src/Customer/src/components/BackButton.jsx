import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import styles from "./BackButton.module.css";

export default function BackButton({ to = "/", label = "Back" }) {
    return (
        <Link to={to} className={styles.back} aria-label={label}>
            <ArrowLeft size={18} />
            <span className={styles.label}>{label}</span>
        </Link>
    );
}