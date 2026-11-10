import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, KeyRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import styles from "./Login.module.css";

const TEXT = {
  en: {
    title: "Sign in to Career Quest",
    sub: "Enter your email and we will send you a 6-digit code. No password needed.",
    email: "Email address",
    send: "Send me the code",
    codeLabel: "6-digit code",
    codeSent: "We sent a code to",
    verify: "Continue",
    back: "Use a different email",
    resend: "Send a new code",
    sending: "Sending...",
    checking: "Checking...",
    errors: {
      invalid_email: "That email address does not look right.",
      too_soon: "Please wait a minute before asking for a new code.",
      wrong_code: "That code is not correct. Try again.",
      expired: "That code has expired. Ask for a new one.",
      locked: "Too many wrong tries. Ask for a new code.",
      no_code: "No code found for this email. Ask for a new one.",
      network: "Could not reach the server. Check your connection.",
      default: "Something went wrong. Please try again.",
    },
  },
  ar: {
    title: "سجّل دخولك إلى Career Quest",
    sub: "اكتب إيميلك وهنبعتلك كود من 6 أرقام. من غير باسورد.",
    email: "البريد الإلكتروني",
    send: "ابعتلي الكود",
    codeLabel: "الكود (6 أرقام)",
    codeSent: "بعتنا كود على",
    verify: "متابعة",
    back: "استخدم إيميل تاني",
    resend: "ابعت كود جديد",
    sending: "جاري الإرسال...",
    checking: "جاري التحقق...",
    errors: {
      invalid_email: "الإيميل ده شكله مش صح.",
      too_soon: "استنى دقيقة قبل ما تطلب كود جديد.",
      wrong_code: "الكود غلط. جرّب تاني.",
      expired: "الكود انتهت صلاحيته. اطلب كود جديد.",
      locked: "محاولات غلط كتير. اطلب كود جديد.",
      no_code: "مفيش كود لالإيميل ده. اطلب كود جديد.",
      network: "مقدرناش نوصل للسيرفر. اتأكد من النت.",
      default: "حصلت مشكلة. جرّب تاني.",
    },
  },
};

export default function Login() {
  const { lang } = useLanguage();
  const { requestCode, verifyCode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const tx = TEXT[lang] || TEXT.en;

  const [step, setStep] = useState("email"); // "email" or "code"
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const goAfterLogin = location.state?.from || "/quest";

  function showError(key) {
    setError(tx.errors[key] || tx.errors.default);
  }

  async function handleSend(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await requestCode(email.trim());
    setBusy(false);
    if (res && res.ok) {
      setStep("code");
    } else {
      showError(res?.error);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await verifyCode(email.trim(), code.trim());
    setBusy(false);
    if (res && res.ok) {
      navigate(goAfterLogin, { replace: true });
    } else {
      showError(res?.error);
    }
  }

  async function handleResend() {
    setError("");
    setBusy(true);
    const res = await requestCode(email.trim());
    setBusy(false);
    if (!(res && res.ok)) showError(res?.error);
  }

  return (
    <section className={styles.page}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1>{tx.title}</h1>

        {step === "email" ? (
          <form onSubmit={handleSend}>
            <p className={styles.sub}>{tx.sub}</p>
            <label className={styles.field}>
              <Mail size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={tx.email}
                autoComplete="email"
                dir="ltr"
                required
              />
            </label>
            {error && <p className={styles.error}>{error}</p>}
            <button className="btn" type="submit" disabled={busy}>
              {busy ? tx.sending : tx.send}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <p className={styles.sub}>
              {tx.codeSent} <strong dir="ltr">{email}</strong>
            </p>
            <label className={styles.field}>
              <KeyRound size={18} />
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder={tx.codeLabel}
                autoComplete="one-time-code"
                dir="ltr"
                required
              />
            </label>
            {error && <p className={styles.error}>{error}</p>}
            <button
              className="btn"
              type="submit"
              disabled={busy || code.length !== 6}
            >
              {busy ? tx.checking : tx.verify}
            </button>
            <div className={styles.links}>
              <button type="button" onClick={handleResend} disabled={busy}>
                {tx.resend}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setError("");
                }}
              >
                {tx.back}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </section>
  );
}
