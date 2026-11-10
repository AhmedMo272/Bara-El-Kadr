import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import Mascot from "../components/mascot/Mascot";
import styles from "./Home.module.css";

export default function Home() {
  const { t } = useLanguage();

  return (
    <section className={styles.hero}>
      <div className={`container ${styles.inner}`}>
        <motion.div
          className={styles.copy}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className={styles.title}>
            {t("hero.title")}
            <span className={styles.accent}>{t("hero.accent")}</span>
          </h1>
          <p className={styles.sub}>{t("hero.sub")}</p>
          <div className={styles.buttons}>
            <Link to="/quest" className="btn btn-accent">
              {t("hero.cta")}
            </Link>
            <Link to="/team" className="btn btn-outline">
              {t("hero.secondary")}
            </Link>
          </div>
        </motion.div>

        <motion.div
          className={styles.art}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          <div className={styles.frame}>
            <Mascot pose="idle" size={220} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
