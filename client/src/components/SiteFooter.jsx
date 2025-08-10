import styles from "../styles/SiteFooter.module.css"
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className={styles.footer} aria-labelledby="footer-heading">
      <div className={styles.container}>
        <div className={styles.topRow}>
          <div>
            <h2 id="footer-heading" className={styles.brand}>Mangalam</h2>
            <p className={styles.tagline}>Elegant weddings & memorable events.</p>
          </div>
          <nav aria-label="Footer" className={styles.links}>
            <a href="#about">About Us</a>
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms</a>
            <a href="#careers">Careers</a>
            <a href="#contact">Contact</a>
          </nav>
          <div className={styles.socials}>
            <a href="#" aria-label="Facebook"><Facebook size={20} /></a>
            <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
            <a href="#" aria-label="Twitter"><Twitter size={20} /></a>
            <a href="#" aria-label="YouTube"><Youtube size={20} /></a>
          </div>
        </div>
        <div className={styles.bottomRow}>
          <p>© Mangalam 2025</p>
        </div>
      </div>
    </footer>
  );
}
