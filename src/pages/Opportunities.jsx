import { ArrowUpRight, CalendarClock } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import usePublicContent from "../hooks/usePublicContent";
import Section from "../components/ui/Section";
import EmptyState from "../components/ui/EmptyState";
import styles from "./Opportunities.module.css";

function formatDeadline(iso, lang) {
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Opportunities() {
  const { t, lang } = useLanguage();
  const { opportunities } = usePublicContent();

  const deadlineLabel = lang === "ar" ? "آخر موعد للتقديم" : "Apply by";
  const applyLabel = lang === "ar" ? "قدّم الآن" : "Apply now";

  return (
    <Section eyebrow={t("nav.opportunities")} title={t("nav.opportunities")}>
      {opportunities.length === 0 ? (
        <EmptyState text={t("empty.opportunities")} />
      ) : (
        <div className={styles.list}>
          {opportunities.map((o) => (
            <article key={o.title.en || o.title.ar} className={styles.card}>
              <div className={styles.main}>
                {(o.partner?.[lang] || o.partnerLogo) && (
                  <div className={styles.partnerRow}>
                    {o.partnerLogo && (
                      <img
                        className={styles.partnerLogo}
                        src={o.partnerLogo}
                        alt=""
                      />
                    )}
                    <span className={styles.partner}>{o.partner?.[lang]}</span>
                  </div>
                )}
                <h2>{o.title[lang] || o.title.ar}</h2>
                {(o.requirements[lang] || o.requirements.ar) && (
                  <p>{o.requirements[lang] || o.requirements.ar}</p>
                )}
                {o.deadline && (
                  <span className={styles.deadline}>
                    <CalendarClock size={16} />
                    {deadlineLabel}: {formatDeadline(o.deadline, lang)}
                  </span>
                )}
              </div>
              {o.link && (
                <a
                  className={`btn btn-accent ${styles.apply}`}
                  href={o.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  {applyLabel}
                  <ArrowUpRight size={18} />
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </Section>
  );
}
