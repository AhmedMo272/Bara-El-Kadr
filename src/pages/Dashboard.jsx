import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import styles from "./Dashboard.module.css";

const T = {
  ar: {
    hello: "أهلاً",
    sub: "ده ملخص رحلتك في برا الكادر.",
    loading: "بنجهز بياناتك...",
    error: "حصلت مشكلة في تحميل البيانات. جرّب تاني.",
    questTitle: "اختبار الكادر",
    notStarted: "لسه ما بدأتش الاختبار.",
    start: "ابدأ الاختبار",
    inProgress: "عندك اختبار لسه ما خلصش",
    answered: "أجبت على",
    of: "من",
    resume: "كمّل من حيث وقفت",
    latest: "آخر نتيجة",
    readiness: "جاهزيتك للشغل",
    viewResult: "شوف التفاصيل",
    retake: "ابدأ اختبار جديد",
    history: "محاولاتك السابقة",
    none: "مفيش محاولات لسه.",
    date: "التاريخ",
    status: "الحالة",
    score: "الجاهزية",
    finished: "اكتمل",
    open: "مفتوح",
    logout: "تسجيل الخروج",
    email: "الإيميل",
  },
  en: {
    hello: "Hello",
    sub: "Here is a summary of your Bara El Kadr journey.",
    loading: "Loading your data...",
    error: "Something went wrong loading your data. Try again.",
    questTitle: "Career Quest",
    notStarted: "You haven't started the quest yet.",
    start: "Start the quest",
    inProgress: "You have an unfinished quest",
    answered: "Answered",
    of: "of",
    resume: "Continue where you stopped",
    latest: "Latest result",
    readiness: "Work readiness",
    viewResult: "View details",
    retake: "Start a new quest",
    history: "Your previous attempts",
    none: "No attempts yet.",
    date: "Date",
    status: "Status",
    score: "Readiness",
    finished: "Finished",
    open: "In progress",
    logout: "Log out",
    email: "Email",
  },
};

function formatDate(iso, lang) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return "—";
  return d.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Dashboard() {
  const { lang } = useLanguage();
  const { user, loading: authLoading, getToken, logout } = useAuth();
  const navigate = useNavigate();
  const t = T[lang] || T.ar;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login", { state: { from: "/dashboard" } });
      return;
    }
    let cancelled = false;
    api("getDashboard", { token: getToken() })
      .then((res) => {
        if (cancelled) return;
        if (res && res.ok) setData(res);
        else setError(true);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, user]); // eslint-disable-line

  if (authLoading || loading) {
    return (
      <div className={styles.page}>
        <p className={styles.muted}>{t.loading}</p>
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className={styles.page}>
        <p className={styles.muted}>{t.error}</p>
      </div>
    );
  }

  const name = data.user.full_name || data.user.email;
  const inProgress = data.in_progress;
  const latest = data.latest;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {t.hello} {name}
          </h1>
          <p className={styles.muted}>{t.sub}</p>
          <p className={styles.email}>
            {t.email}: {data.user.email}
          </p>
        </div>
        <button className={styles.ghost} onClick={logout}>
          {t.logout}
        </button>
      </header>

      <div className={styles.grid}>
        {/* Quest status */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>{t.questTitle}</h2>
          {inProgress ? (
            <>
              <p>{t.inProgress}</p>
              <p className={styles.muted}>
                {t.answered} {inProgress.answered} {t.of} {data.total_questions}
              </p>
              <div className={styles.bar}>
                <div
                  className={styles.barFill}
                  style={{
                    width: `${Math.min(100, Math.round((inProgress.answered / data.total_questions) * 100))}%`,
                  }}
                />
              </div>
              <Link to="/quest" className={styles.primary}>
                {t.resume}
              </Link>
            </>
          ) : (
            <>
              <p className={styles.muted}>{latest ? "" : t.notStarted}</p>
              <Link to="/quest" className={styles.primary}>
                {latest ? t.retake : t.start}
              </Link>
            </>
          )}
        </section>

        {/* Latest result */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>{t.latest}</h2>
          {latest && latest.readiness_score !== null ? (
            <>
              <div className={styles.big}>{latest.readiness_score}%</div>
              <p className={styles.muted}>{t.readiness}</p>
              <Link
                to={`/results/${latest.attempt_id}`}
                className={styles.link}
              >
                {t.viewResult}
              </Link>
            </>
          ) : (
            <p className={styles.muted}>{t.none}</p>
          )}
        </section>
      </div>

      {/* History */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>{t.history}</h2>
        {data.attempts.length === 0 ? (
          <p className={styles.muted}>{t.none}</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t.date}</th>
                  <th>{t.status}</th>
                  <th>{t.score}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.attempts.map((a) => (
                  <tr key={a.attempt_id}>
                    <td>{formatDate(a.started_at, lang)}</td>
                    <td>{a.status === "FINISHED" ? t.finished : t.open}</td>
                    <td>
                      {a.readiness_score !== null
                        ? `${a.readiness_score}%`
                        : "—"}
                    </td>
                    <td>
                      {a.status === "FINISHED" && (
                        <Link
                          to={`/results/${a.attempt_id}`}
                          className={styles.link}
                        >
                          {t.viewResult}
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
