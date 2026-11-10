import { motion } from "framer-motion";
import styles from "./Section.module.css";

export default function Section({ eyebrow, title, intro, children }) {
  return (
    <section className={styles.section}>
      <div className="container">
        <motion.header
          className={styles.header}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
          <h1 className={styles.title}>{title}</h1>
          {intro && <p className={styles.intro}>{intro}</p>}
        </motion.header>
        {children}
      </div>
    </section>
  );
}
