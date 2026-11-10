import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import styles from "./Quest.module.css";

const TEXT = {
  en: {
    start: "Start your Career Quest",
    intro:
      "Answer one question at a time. There is no timer, and your answers are saved as you go.",
    begin: "Begin",
    resume: "Continue where you stopped",
    question: "Question",
    of: "of",
    next: "Next",
    finish: "See my results",
    loading: "Loading...",
    error: "Something went wrong. Please try again.",
    retry: "Try again",
    modes: {
      MAKE_THE_DECISION: "Make the Decision",
      BRAIN_CHALLENGES: "Brain Challenges",
      WORKPLACE_SIMULATION: "Workplace Simulation",
      SKILL_CHECK: "Skill Check",
      CHOOSE_YOUR_PATH: "Choose Your Path",
      DISCOVER_YOUR_STYLE: "Discover Your Style",
    },
  },
  ar: {
    start: "ابدأ Career Quest",
    intro:
      "جاوب على سؤال واحد في كل مرة. مفيش تايمر، وإجاباتك بتتحفظ أول بأول.",
    begin: "ابدأ",
    resume: "كمّل من حيث وقفت",
    question: "سؤال",
    of: "من",
    next: "التالي",
    finish: "شوف نتيجتي",
    loading: "جاري التحميل...",
    error: "حصلت مشكلة. جرّب تاني.",
    retry: "حاول تاني",
    modes: {
      MAKE_THE_DECISION: "خد القرار",
      BRAIN_CHALLENGES: "تحديات المخ",
      WORKPLACE_SIMULATION: "محاكاة بيئة الشغل",
      SKILL_CHECK: "اختبار المهارات",
      CHOOSE_YOUR_PATH: "اختار مسارك",
      DISCOVER_YOUR_STYLE: "اكتشف أسلوبك",
    },
  },
};

export default function Quest() {
  const { lang } = useLanguage();
  const { user, loading: authLoading, getToken } = useAuth();
  const navigate = useNavigate();
  const tx = TEXT[lang] || TEXT.en;

  const [phase, setPhase] = useState("intro"); // intro | question | finishing | error
  const [attemptId, setAttemptId] = useState(null);
  const [resumed, setResumed] = useState(false);
  const [data, setData] = useState(null); // current question payload
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);

  // Send logged-out students to the login page
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true, state: { from: "/quest" } });
    }
  }, [authLoading, user, navigate]);

  const loadQuestion = useCallback(
    async (id) => {
      setBusy(true);
      const res = await api("getQuestion", {
        token: getToken(),
        attempt_id: id,
      });
      setBusy(false);
      if (!res || !res.ok) {
        if (res?.error === "unauthorized") {
          navigate("/login", { replace: true, state: { from: "/quest" } });
          return;
        }
        setPhase("error");
        return;
      }
      if (res.done) {
        await finish(id);
        return;
      }
      setData(res);
      setSelected(null);
      setPhase("question");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getToken, navigate],
  );

  async function handleBegin() {
    setBusy(true);
    const res = await api("startAttempt", { token: getToken() });
    setBusy(false);
    if (!res || !res.ok) {
      setPhase("error");
      return;
    }
    setAttemptId(res.attempt_id);
    setResumed(res.resumed);
    loadQuestion(res.attempt_id);
  }

  async function handleNext() {
    if (!selected || busy) return;
    setBusy(true);
    const res = await api("saveAnswer", {
      token: getToken(),
      attempt_id: attemptId,
      question_id: data.question.question_id,
      option_id: selected,
    });
    setBusy(false);
    if (!res || !res.ok) {
      setPhase("error");
      return;
    }
    loadQuestion(attemptId);
  }

  async function finish(id) {
    setPhase("finishing");
    const res = await api("finishAttempt", {
      token: getToken(),
      attempt_id: id,
    });
    if (res && res.ok) {
      navigate("/results/" + id, { replace: true });
    } else {
      setPhase("error");
    }
  }

  if (authLoading || !user) {
    return (
      <section className={styles.page}>
        <p>{tx.loading}</p>
      </section>
    );
  }

  const q = data?.question;
  const isLast = data && data.index === data.total;
  const progress = data ? Math.round(((data.index - 1) / data.total) * 100) : 0;

  return (
    <section className={styles.page}>
      <div className={styles.wrap}>
        {phase === "intro" && (
          <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1>{tx.start}</h1>
            <p className={styles.sub}>{tx.intro}</p>
            <button className="btn" onClick={handleBegin} disabled={busy}>
              {busy ? tx.loading : tx.begin}
            </button>
          </motion.div>
        )}

        {phase === "question" && q && (
          <>
            <div className={styles.progressTop}>
              <span>
                {tx.question} {data.index} {tx.of} {data.total}
              </span>
              <span className={styles.mode}>{tx.modes[q.mode] || q.mode}</span>
            </div>
            <div className={styles.bar}>
              <div className={styles.fill} style={{ width: progress + "%" }} />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={q.question_id}
                className={styles.card}
                initial={{ opacity: 0, x: lang === "ar" ? -40 : 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                {q.image_url ? (
                  <img className={styles.image} src={q.image_url} alt="" />
                ) : null}
                <h2 className={styles.qtext}>
                  {lang === "ar" ? q.text_ar : q.text_en || q.text_ar}
                </h2>

                <div className={styles.options}>
                  {q.options.map((o) => (
                    <button
                      key={o.option_id}
                      type="button"
                      className={
                        styles.option +
                        (selected === o.option_id ? " " + styles.selected : "")
                      }
                      onClick={() => setSelected(o.option_id)}
                    >
                      {lang === "ar" ? o.text_ar : o.text_en || o.text_ar}
                    </button>
                  ))}
                </div>

                <button
                  className="btn"
                  onClick={handleNext}
                  disabled={!selected || busy}
                >
                  {busy ? tx.loading : isLast ? tx.finish : tx.next}
                </button>
              </motion.div>
            </AnimatePresence>
          </>
        )}

        {phase === "finishing" && (
          <div className={styles.card}>
            <p>{tx.loading}</p>
          </div>
        )}

        {phase === "error" && (
          <div className={styles.card}>
            <p>{tx.error}</p>
            <button className="btn" onClick={() => setPhase("intro")}>
              {tx.retry}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
