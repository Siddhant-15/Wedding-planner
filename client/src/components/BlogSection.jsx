import styles from "../styles/BlogSection.module.css"
import b1 from "@/assets/blog.jpg";
import b2 from "@/assets/blog.jpg";
import b3 from "@/assets/blog.jpg";

const posts = [
  { img: b1, title: "How to Choose the Perfect Engagement Ring", desc: "A quick guide to styles, stones and settings that match your story.", href: "#" },
  { img: b2, title: "Mehendi Trends We’re Loving", desc: "From minimal to intricate bridal designs, get inspired for your big day.", href: "#" },
  { img: b3, title: "Romantic Decor Ideas in Blush & Gold", desc: "Elevate your reception with these modern, elegant styling tips.", href: "#" },
];

export default function BlogSection() {
  return (
    <section className={styles.wrap} aria-labelledby="blog-heading">
      <div className={styles.container}>
        <h2 id="blog-heading" className={styles.heading}>Ideas & Inspiration</h2>
        <div className={styles.grid}>
          {posts.map((p) => (
            <article key={p.title} className={styles.card}>
              <div className={styles.imgWrap}>
                <img src={p.img} alt={p.title} loading="lazy" />
              </div>
              <div className={styles.body}>
                <h3 className={styles.title}>{p.title}</h3>
                <p className={styles.desc}>{p.desc}</p>
                <a className={styles.link} href={p.href}>Read more →</a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
