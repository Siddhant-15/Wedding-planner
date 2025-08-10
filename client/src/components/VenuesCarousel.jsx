import useEmblaCarousel from "embla-carousel-react";
import { useEffect } from "react";
import styles from "../styles/VenuesCarousel.module.css";
import v1 from "@/assets/blog.jpg";
import v2 from "@/assets/blog.jpg";
import v3 from "@/assets/blog.jpg";
import v4 from "@/assets/blog.jpg";
import v5 from "@/assets/blog.jpg";
import v6 from "@/assets/blog.jpg";

const venues = [
  { img: v1, name: "The Royale Grand", location: "Mumbai", price: "₹2.5L+", rating: 4.8 },
  { img: v2, name: "Rajmahal Courtyard", location: "Jaipur", price: "₹3.0L+", rating: 4.9 },
  { img: v3, name: "Skyline Rooftop", location: "Bengaluru", price: "₹1.8L+", rating: 4.6 },
  { img: v4, name: "Seabreeze Mandap", location: "Goa", price: "₹2.2L+", rating: 4.7 },
  { img: v5, name: "Gardenia Meadows", location: "Pune", price: "₹1.5L+", rating: 4.5 },
  { img: v6, name: "Haveli Heritage", location: "Udaipur", price: "₹3.5L+", rating: 4.9 },
];

export default function VenuesCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start", dragFree: true });

  useEffect(() => {
    if (emblaApi) emblaApi.reInit();
  }, [emblaApi]);

  return (
    <section id="venues" className={styles.wrap} aria-labelledby="venues-heading">
      <div className={styles.container}>
        <h2 id="venues-heading" className={styles.heading}>Top Venues</h2>
        <div className={styles.embla} ref={emblaRef}>
          <div className={styles.emblaContainer}>
            {venues.map((v) => (
              <article key={v.name} className={styles.card}>
                <div className={styles.imgWrap}>
                  <img
                    src={v.img}
                    alt={`${v.name} venue in ${v.location}`}
                    loading="lazy"
                  />
                </div>
                <div className={styles.body}>
                  <div>
                    <h3 className={styles.title}>{v.name}</h3>
                    <p className={styles.meta}>
                      {v.location} &middot; From {v.price}
                    </p>
                  </div>
                  <div className={styles.rating} aria-label={`${v.rating} stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={i < Math.round(v.rating) ? styles.starFull : styles.starEmpty}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
