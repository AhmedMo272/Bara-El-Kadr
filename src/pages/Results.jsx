import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import styles from "./Results.module.css";

const TEXT = {
  en: {
    title: "Your Career Quest results",
    readiness: "Career readiness",
    readinessNote:
      "Based on Decision Making, Brain Challenges, Workplace Simulation and Skill Check.",
    modesTitle: "Your score in each mode",
    familiesTitle: "Career families that fit your choices",
    count: "matching answers",
    loading: "Loading your results...",
    error: "We could not load your results.",
    retry: "Try again",
    home: "Back to home",
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
    title: "نتيجة Career Quest",
    readiness: "جاهزيتك للشغل",
    readinessNote:
      "محسوبة من: خد القرار، تحديات المخ، محاكاة بيئة الشغل، واختبار المهارات.",
    modesTitle: "درجتك في كل مرحلة",
    familiesTitle: "مجالات الشغل الأنسب لاختياراتك",
    count: "إجابات متوافقة",
    loading: "جاري تحميل النتيجة...",
    error: "مقدرناش نحمّل النتيجة.",
    retry: "حاول تاني",
    home: "الرجوع للرئيسية",
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

export default function Results() {
  const { attemptId } = useParams();
  const { lang } = useLanguage();
  const { user, loading: authLoading, getToken } = useAuth();
  const navigate = useNavigate();
  const tx = TEXT[lang] || TEXT.en;

  const [state, setState] = useState("loading"); // loading | ready | error
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login", {
        replace: true,
        state: { from: "/results/" + attemptId },
      });
      return;
    }
    let cancelled = false;
    setState("loading");
    api("getResult", { token: getToken(), attempt_id: attemptId }).then(
      (res) => {
        if (cancelled) return;
        if (res && res.ok) {
          setResult(res.result);
          setState("ready");
        } else {
          setState("error");
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, attemptId, navigate, getToken]);

  if (state === "loading") {
    return (
      <section className={styles.page}>
        <p>{tx.loading}</p>
      </section>
    );
  }

  if (state === "error" || !result) {
    return (
      <section className={styles.page}>
        <div className={styles.card}>
          <p>{tx.error}</p>
          <button className="btn" onClick={() => window.location.reload()}>
            {tx.retry}
          </button>
        </div>
      </section>
    );
  }

  const chartData = Object.keys(result.mode_scores || {}).map((mode) => ({
    name: tx.modes[mode] || mode,
    score: result.mode_scores[mode],
  }));

  return (
    <section className={styles.page}>
      <div className={styles.wrap}>
        <motion.h1
          className={styles.title}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {tx.title}
        </motion.h1>

        <motion.div
          className={styles.card + " " + styles.hero}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className={styles.big}>{result.readiness_score}%</div>
          <div>
            <h2>{tx.readiness}</h2>
            <p className={styles.note}>{tx.readinessNote}</p>
          </div>
        </motion.div>

        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2>{tx.modesTitle}</h2>
          <div className={styles.chart} dir="ltr">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  tick={{ fontSize: 12 }}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="#0051FD" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {result.top_families && result.top_families.length > 0 && (
          <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2>{tx.familiesTitle}</h2>
            <div className={styles.families}>
              {result.top_families.map((f, i) => (
                <div key={f.family_id} className={styles.family}>
                  <span className={styles.rank}>{i + 1}</span>
                  <div>
                    <h3>
                      {lang === "ar" ? f.name_ar : f.name_en || f.name_ar}
                    </h3>
                    <p>
                      {lang === "ar"
                        ? f.description_ar
                        : f.description_en || f.description_ar}
                    </p>
                    <small>
                      {f.count} {tx.count}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <Link to="/" className="btn">
          {tx.home}
        </Link>
      </div>
    </section>
  );
}
