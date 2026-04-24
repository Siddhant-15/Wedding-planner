import React from "react";
import {
  Building2,
  UtensilsCrossed,
  Camera,
  Sparkles,
  Music2,
  CalendarHeart,
} from "lucide-react";
import CategoryCard from "./CategoryCard";
import styles from "./CategorySection.module.css";

const CATEGORIES = [
  { value: "venue", label: "Venue", icon: Building2, bg: "#fdecf2" },
  { value: "catering", label: "Catering", icon: UtensilsCrossed, bg: "#fff3e0" },
  { value: "photography", label: "Photography", icon: Camera, bg: "#e8f1ff" },
  { value: "decoration", label: "Decoration", icon: Sparkles, bg: "#f3e8ff" },
  { value: "dj", label: "DJ / Music", icon: Music2, bg: "#e6f7ee" },
  { value: "event_planner", label: "Event Planner", icon: CalendarHeart, bg: "#fdecf2" },
];

export default function CategorySection() {
  return (
    <section className={styles.wrap} aria-labelledby="cat-heading">
      <div className={styles.container}>
        <header className={styles.header}>
          <h2 id="cat-heading" className={styles.heading}>
            Browse by Category
          </h2>
          <p className={styles.sub}>Pick a service to start planning</p>
        </header>

        <div className={styles.grid}>
          {CATEGORIES.map((c) => (
            <CategoryCard key={c.value} category={c} />
          ))}
        </div>
      </div>
    </section>
  );
}
