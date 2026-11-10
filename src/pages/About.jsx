import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../data/translations";
import Section from "../components/ui/Section";
import styles from "./About.module.css";

export default function About() {
  const { t, lang } = useLanguage();
  const cards = translations[lang].about.cards;

  return (
    <Section
      eyebrow={t("about.eyebrow")}
      title={t("about.title")}
      intro={t("about.intro")}
    >
      <div className={styles.grid}>
        {cards.map((card, i) => (
          <motion.article
            key={card.title}
            className={styles.card}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, delay: i * 0.1 }}
          >
            <span className={styles.num}>{i + 1}</span>
            <h2>{card.title}</h2>
            <p>{card.text}</p>
          </motion.article>
        ))}
      </div>
    </Section>
  );
}
