import { useLanguage } from "../context/LanguageContext";
import usePublicContent from "../hooks/usePublicContent";
import Section from "../components/ui/Section";
import EmptyState from "../components/ui/EmptyState";
import styles from "./Partners.module.css";

export default function Partners() {
  const { t, lang } = useLanguage();
  const { partners } = usePublicContent();

  return (
    <Section eyebrow={t("nav.partners")} title={t("nav.partners")}>
      {partners.length === 0 ? (
        <EmptyState text={t("empty.partners")} />
      ) : (
        <div className={styles.grid}>
          {partners.map((p) => (
            <a
              key={p.name.en || p.name.ar}
              className={styles.card}
              href={p.url || undefined}
              target="_blank"
              rel="noreferrer"
            >
              <img src={p.logo} alt={p.name[lang]} />
              <span>{p.name[lang]}</span>
            </a>
          ))}
        </div>
      )}
    </Section>
  );
}
