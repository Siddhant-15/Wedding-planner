import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "../styles/HeroSlider.module.css"
// Use imagetools picture export (generates sources and fallback img)
import h1Picture from "@/assets/slide-1.jpg?w=1920;2560;3840&format=webp;jpg&as=picture";
import h2Picture from "@/assets/slide-2.jpg?w=1920;2560;3840&format=webp;jpg&as=picture";
import h3Picture from "@/assets/slide-3.jpg?w=1920;2560;3840&format=webp;jpg&as=picture";

const slides = [
  { picture: h1Picture, alt: "Romantic outdoor wedding ceremony" },
  { picture: h2Picture, alt: "Elegant indoor wedding reception" },
  { picture: h3Picture, alt: "Sunset beachfront wedding mandap" },
];

export default function HeroSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [index, setIndex] = useState(0);
  const timer = useRef(null);

  const play = useCallback(() => {
    if (!emblaApi) return;
    if (timer.current) window.clearInterval(timer.current);
    timer.current = window.setInterval(() => emblaApi.scrollNext(), 5000);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on("select", () => setIndex(emblaApi.selectedScrollSnap()));
    play();

    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [emblaApi, play]);

  return (
    <section className={styles.hero} aria-label="Hero">
      <div
        className={styles.embla}
        ref={emblaRef}
        onMouseEnter={() => {
          if (timer.current) window.clearInterval(timer.current);
        }}
        onMouseLeave={play}
      >
        <div className={styles.emblaContainer}>
          {slides.map((s, i) => (
            <div className={styles.emblaSlide} key={i}>
              <picture>
                {Array.isArray(s.picture.sources)
                  ? s.picture.sources.map((source) => (
                      <source
                        key={source.type || source.srcset}
                        type={source.type}
                        srcSet={source.srcset}
                        sizes="100vw"
                      />
                    ))
                  : Object.entries(s.picture.sources).map(([format, srcset]) => (
                      <source key={format} type={`image/${format}`} srcSet={srcset} sizes="100vw" />
                    ))}
                <img
                  src={s.picture.img.src}
                  alt={s.alt}
                  className={styles.slideImg}
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : undefined}
                  decoding="async"
                />
              </picture>
              <div className={styles.overlay} />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.contentWrap}>
        <h1 className={styles.title}>
          Plan Your Dream Wedding with Mangalam
        </h1>
        <p className={styles.subtitle}>
          Curated venues, trusted vendors, and a team that cares—let’s make your
          story unforgettable.
        </p>
        <div className={styles.ctaRow}>
          <a
            href="#venues"
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            Explore Venues
          </a>
          <a
            href="#contact"
            className={`${styles.btn} ${styles.btnOutline}`}
          >
            Book Now
          </a>
        </div>
        <div className={styles.dots}>
          {slides.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => emblaApi?.scrollTo(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
