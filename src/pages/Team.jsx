import { motion } from "framer-motion";
import { Link2, AtSign, Mail } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import usePublicContent from "../hooks/usePublicContent";
import EmptyState from "../components/ui/EmptyState";
import styles from "./Team.module.css";

export default function Team() {
  const { t, lang } = useLanguage();
  const { team, partners } = usePublicContent();

  return (
    <section className={styles.page}>
      <div className="container">
        {/* Group photo hero */}
        <motion.div
          className={styles.hero}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            className={styles.heroImg}
            src="/team/group.jpeg"
            alt={t("nav.team")}
          />
          <div className={styles.heroFade} />
        </motion.div>

        <motion.div
          className={styles.stats}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <div className={styles.stat}>
            <strong>{team.length}</strong>
            <span>{lang === "ar" ? "عضو" : "Members"}</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.stat}>
            <strong>{new Set(team.map((m) => m.role.en)).size}</strong>
            <span>{lang === "ar" ? "تخصص" : "Specialties"}</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.stat}>
            <strong>{partners.length}</strong>
            <span>{lang === "ar" ? "شريك" : "Partners"}</span>
          </div>
        </motion.div>

        {team.length === 0 ? (
          <EmptyState text={t("empty.team")} />
        ) : (
          <div className={styles.grid}>
            {team.map((m, i) => (
              <motion.article
                key={m.name.en || m.name.ar}
                className={styles.card}
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.6,
                  delay: (i % 3) * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div className={styles.photoWrap}>
                  {m.photo && (
                    <img
                      className={styles.photo}
                      src={m.photo}
                      alt={m.name[lang]}
                      loading="lazy"
                    />
                  )}
                  <span className={styles.role}>{m.role[lang]}</span>
                </div>

                <div className={styles.body}>
                  <h2>{m.name[lang]}</h2>
                  {m.bio?.[lang] && <p>{m.bio[lang]}</p>}

                  <div className={styles.links}>
                    {m.links?.linkedin && (
                      <a
                        href={m.links.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="LinkedIn"
                      >
                        <Link2 size={18} />
                      </a>
                    )}
                    {m.links?.instagram && (
                      <a
                        href={m.links.instagram}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Instagram"
                      >
                        <AtSign size={18} />
                      </a>
                    )}
                    {m.links?.email && (
                      <a href={`mailto:${m.links.email}`} aria-label="Email">
                        <Mail size={18} />
                      </a>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
