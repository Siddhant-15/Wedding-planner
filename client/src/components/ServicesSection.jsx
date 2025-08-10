import styles from "../styles/ServicesSection.module.css";
import venue from "@/assets/blog.jpg";
import dj from "@/assets/blog.jpg";
import mgmt from "@/assets/blog.jpg";
import catering from "@/assets/blog.jpg";
import photo from "@/assets/blog.jpg";

const services = [
  { title: "Wedding Venues", img: venue },
  { title: "DJs", img: dj },
  { title: "Event Management", img: mgmt },
  { title: "Catering", img: catering },
  { title: "Photography", img: photo },
];

export default function ServicesSection() {
  return (
    <section
      id="services"
      className={styles.wrap}
      aria-labelledby="services-heading"
    >
      <div className={styles.container}>
        <h2 id="services-heading" className={styles.heading}>
          Featured Services
        </h2>
        <div className={styles.grid}>
          {services.map((s) => (
            <article key={s.title} className={styles.card}>
              <div className={styles.imageWrap}>
                <img
                  src={s.img}
                  alt={`${s.title} by Mangalam`}
                  loading="lazy"
                />
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{s.title}</h3>
                <a
                  href="#"
                  className={styles.cardBtn}
                  aria-label={`Explore ${s.title}`}
                >
                  Explore
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
