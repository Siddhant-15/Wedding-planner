import useEmblaCarousel from "embla-carousel-react";
import { useEffect } from "react";
import styles from "../styles/VenuesCarousel.module.css";
import v1 from "@/assets/venue-1.jpg?w=300;600;900&format=webp;jpg&as=picture";
import v2 from "@/assets/venue-2.jpg?w=300;600;900&format=webp;jpg&as=picture";
import v3 from "@/assets/venue-3.jpg?w=300;600;900&format=webp;jpg&as=picture";
import v4 from "@/assets/venue-4.jpg?w=300;600;900&format=webp;jpg&as=picture";
import v5 from "@/assets/venue-5.jpg?w=300;600;900&format=webp;jpg&as=picture";
import v6 from "@/assets/venue-6.jpg?w=300;600;900&format=webp;jpg&as=picture";

const venues = [
  { pic: v1, name: "The Royale Grand", location: "Mumbai", price: "₹2.5L+", rating: 4.8 },
  { pic: v2, name: "Rajmahal Courtyard", location: "Jaipur", price: "₹3.0L+", rating: 4.9 },
  { pic: v3, name: "Skyline Rooftop", location: "Bengaluru", price: "₹1.8L+", rating: 4.6 },
  { pic: v4, name: "Seabreeze Mandap", location: "Goa", price: "₹2.2L+", rating: 4.7 },
  { pic: v5, name: "Gardenia Meadows", location: "Pune", price: "₹1.5L+", rating: 4.5 },
  { pic: v6, name: "Haveli Heritage", location: "Udaipur", price: "₹3.5L+", rating: 4.9 },
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
                  <picture>
                    {Array.isArray(v.pic.sources)
                      ? v.pic.sources.map((source) => (
                          <source key={source.type || source.srcset} type={source.type} srcSet={source.srcset} sizes="300px" />
                        ))
                      : Object.entries(v.pic.sources).map(([format, srcset]) => (
                          <source key={format} type={`image/${format}`} srcSet={srcset} sizes="300px" />
                        ))}
                    <img
                      src={v.pic.img.src}
                      alt={`${v.name} venue in ${v.location}`}
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
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
