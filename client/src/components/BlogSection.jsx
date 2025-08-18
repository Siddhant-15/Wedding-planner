import styles from "../styles/BlogSection.module.css"
import b1 from "@/assets/blog-1.jpg?w=600;900;1400&format=webp;jpg&as=picture";
import b2 from "@/assets/blog-2.jpg?w=600;900;1400&format=webp;jpg&as=picture";
import b3 from "@/assets/blog-3.jpg?w=600;900;1400&format=webp;jpg&as=picture";

const posts = [
  { pic: b1, title: "How to Choose the Perfect Engagement Ring", desc: "A quick guide to styles, stones and settings that match your story.", href: "#" },
  { pic: b2, title: "Mehendi Trends We’re Loving", desc: "From minimal to intricate bridal designs, get inspired for your big day.", href: "#" },
  { pic: b3, title: "Romantic Decor Ideas in Blush & Gold", desc: "Elevate your reception with these modern, elegant styling tips.", href: "#" },
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
                <picture>
                  {Array.isArray(p.pic.sources)
                    ? p.pic.sources.map((source) => (
                        <source key={source.type || source.srcset} type={source.type} srcSet={source.srcset} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                      ))
                    : Object.entries(p.pic.sources).map(([format, srcset]) => (
                        <source key={format} type={`image/${format}`} srcSet={srcset} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                      ))}
                  <img src={p.pic.img.src} alt={p.title} loading="lazy" decoding="async" />
                </picture>
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
