import styles from "../styles/Testimonials.module.css"
import t1 from "@/assets/blog.jpg";
import t2 from "@/assets/blog.jpg";
import t3 from "@/assets/blog.jpg";
import t4 from "@/assets/blog.jpg";

const data = [
  { img: t1, name: "Aarav & Meera", text: "Mangalam made our big day seamless and magical. Every detail was perfect!", rating: 5 },
  { img: t2, name: "Riya", text: "From vendors to decor, the team handled it with elegance and care.", rating: 5 },
  { img: t3, name: "Karan", text: "Professional, creative and so warm to work with. Highly recommended!", rating: 4 },
  { img: t4, name: "Ishaan & Anaya", text: "We loved the venues they shortlisted. Our guests still talk about it.", rating: 5 },
];

export default function Testimonials() {
  return (
    <section className={styles.wrap} aria-labelledby="testimonials-heading">
      <div className={styles.container}>
        <h2 id="testimonials-heading" className={styles.heading}>What Couples Say</h2>
        <div className={styles.grid}>
          {data.map((d) => (
            <article key={d.name} className={styles.card}>
              <img src={d.img} alt={`${d.name} review`} className={styles.avatar} loading="lazy" />
              <p className={styles.text}>“{d.text}”</p>
              <div className={styles.footer}> 
                <span className={styles.name}>{d.name}</span>
                <span className={styles.stars} aria-label={`${d.rating} stars`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < d.rating ? styles.starFull : styles.starEmpty}>★</span>
                  ))}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
