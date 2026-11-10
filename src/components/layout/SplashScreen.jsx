import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import Mascot from "../mascot/Mascot";
import styles from "./SplashScreen.module.css";

const MotionDiv = motion.div;
const MotionSvg = motion.svg;

const REDUCED = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function SplashScreen({ onFinish }) {
  const { t } = useLanguage();
  const reduced = REDUCED();
  const [stage, setStage] = useState(reduced ? "logo" : "run");

  const finish = useCallback(() => onFinish?.(), [onFinish]);

  useEffect(() => {
    if (reduced) {
      const id = setTimeout(finish, 1800);
      return () => clearTimeout(id);
    }
    const timers = [
      setTimeout(() => setStage("frame"), 1800),
      setTimeout(() => setStage("logo"), 3000),
      setTimeout(finish, 5200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [reduced, finish]);

  return (
    <MotionDiv
      className={styles.splash}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <button className={styles.skip} onClick={finish}>
        {t("nav.skip")}
      </button>

      <div className={styles.stage} dir="ltr">
        {/* Blue frame draws itself */}
        <MotionSvg
          className={styles.frame}
          viewBox="0 0 600 320"
          aria-hidden="true"
        >
          <rect
            className={`${styles.frameRect} ${
              stage !== "run" || reduced ? styles.drawn : ""
            }`}
            x="30"
            y="30"
            width="540"
            height="260"
            rx="36"
            pathLength="1"
          />
        </MotionSvg>

        {/* Mascot runs in from the left, then settles */}
        <MotionDiv
          className={styles.mascot}
          initial={{ x: reduced ? 0 : "-70vw", opacity: reduced ? 0 : 1 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: reduced ? 0.4 : 1.7, ease: "linear" }}
        >
          <Mascot pose={stage === "run" && !reduced ? "run" : "still"} size={150} />
        </MotionDiv>

        <MotionDiv
          className={styles.text}
          dir="rtl"
          initial={{ opacity: 0, y: 12 }}
          animate={
            stage === "logo"
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 12 }
          }
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className={styles.brand}>برا الكادر</h1>
          <p className={styles.slogan}>جوا الفرصة</p>
        </MotionDiv>
      </div>
    </MotionDiv>
  );
}
