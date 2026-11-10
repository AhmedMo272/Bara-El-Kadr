import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import styles from "./Admin.module.css";

const MODES = [
  "MAKE_THE_DECISION",
  "BRAIN_CHALLENGES",
  "WORKPLACE_SIMULATION",
  "SKILL_CHECK",
  "CHOOSE_YOUR_PATH",
  "DISCOVER_YOUR_STYLE",
];

const T = {
  ar: {
    title: "لوحة الإدارة — الأسئلة",
    loading: "بنجهز البيانات...",
    forbidden: "مفيش عندك صلاحية الإدارة.",
    error: "حصلت مشكلة. جرّب تاني.",
    all: "كل المراحل",
    active: "مفعّل",
    textAr: "نص السؤال (عربي)",
    textEn: "نص السؤال (إنجليزي)",
    maxScore: "أعلى درجة",
    options: "الاختيارات",
    optAr: "عربي",
    optEn: "إنجليزي",
    score: "الدرجة",
    family: "مجال الشغل",
    save: "حفظ",
    saved: "اتحفظ",
    saving: "بيحفظ...",
    newQ: "+ سؤال جديد",
    cancel: "إلغاء",
    mode: "المرحلة",
    addOption: "+ اختيار جديد",
    create: "إنشاء السؤال",
    needText: "اكتب نص السؤال بالعربي واختيارين على الأقل.",
    reload: "اتضاف. بنحدّث القائمة...",
  },
  en: {
    title: "Admin — Questions",
    loading: "Loading...",
    forbidden: "You do not have admin access.",
    error: "Something went wrong. Try again.",
    all: "All modes",
    active: "Active",
    textAr: "Question text (Arabic)",
    textEn: "Question text (English)",
    maxScore: "Max score",
    options: "Options",
    optAr: "Arabic",
    optEn: "English",
    score: "Score",
    family: "Career family",
    save: "Save",
    saved: "Saved",
    saving: "Saving...",
    newQ: "+ New question",
    cancel: "Cancel",
    mode: "Mode",
    addOption: "+ Add option",
    create: "Create question",
    needText: "Write the Arabic question text and at least two options.",
    reload: "Added. Refreshing the list...",
  },
};

const emptyOption = () => ({
  text_ar: "",
  text_en: "",
  score: 0,
  career_family_id: "",
});
const emptyDraft = () => ({
  mode: "MAKE_THE_DECISION",
  text_ar: "",
  text_en: "",
  max_score: 3,
  is_active: true,
  options: [emptyOption(), emptyOption(), emptyOption(), emptyOption()],
});

export default function Admin() {
  const { lang } = useLanguage();
  const { user, loading: authLoading, getToken } = useAuth();
  const navigate = useNavigate();
  const t = T[lang] || T.ar;

  const [questions, setQuestions] = useState([]);
  const [state, setState] = useState("loading"); // loading | ok | forbidden | error
  const [mode, setMode] = useState("ALL");
  const [openId, setOpenId] = useState(null);
  const [status, setStatus] = useState({});
  const [draft, setDraft] = useState(null);
  const [draftMsg, setDraftMsg] = useState("");

  function load() {
    return api("adminGetQuestions", { token: getToken() })
      .then((res) => {
        if (res && res.ok) {
          setQuestions(res.questions);
          setState("ok");
        } else if (res && res.error === "forbidden") setState("forbidden");
        else setState("error");
      })
      .catch(() => setState("error"));
  }

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login", { state: { from: "/admin" } });
      return;
    }
    load();
  }, [authLoading, user]); // eslint-disable-line

  const modes = ["ALL", ...Array.from(new Set(questions.map((q) => q.mode)))];
  const shown = questions.filter((q) => mode === "ALL" || q.mode === mode);

  function editQuestion(id, patch) {
    setQuestions((qs) =>
      qs.map((q) => (q.question_id === id ? { ...q, ...patch } : q)),
    );
  }

  function editOption(qid, oid, patch) {
    setQuestions((qs) =>
      qs.map((q) =>
        q.question_id !== qid
          ? q
          : {
              ...q,
              options: q.options.map((o) =>
                o.option_id === oid ? { ...o, ...patch } : o,
              ),
            },
      ),
    );
  }

  async function saveAll(q) {
    setStatus((s) => ({ ...s, [q.question_id]: "saving" }));
    try {
      const token = getToken();
      const r1 = await api("adminSaveQuestion", {
        token,
        question_id: q.question_id,
        text_ar: q.text_ar,
        text_en: q.text_en,
        max_score: q.max_score,
        is_active: q.is_active,
      });
      if (!r1 || !r1.ok) throw new Error("q");
      for (const o of q.options) {
        const r = await api("adminSaveOption", {
          token,
          option_id: o.option_id,
          text_ar: o.text_ar,
          text_en: o.text_en,
          score: o.score,
          career_family_id: o.career_family_id,
        });
        if (!r || !r.ok) throw new Error("o");
      }
      setStatus((s) => ({ ...s, [q.question_id]: "saved" }));
    } catch {
      setStatus((s) => ({ ...s, [q.question_id]: "error" }));
    }
  }

  async function addOption(q) {
    setStatus((s) => ({ ...s, [q.question_id]: "saving" }));
    try {
      const r = await api("adminAddOption", {
        token: getToken(),
        question_id: q.question_id,
        text_ar: "",
        text_en: "",
        score: 0,
        career_family_id: "",
      });
      if (!r || !r.ok) throw new Error("add");
      await load();
      setStatus((s) => ({ ...s, [q.question_id]: undefined }));
    } catch {
      setStatus((s) => ({ ...s, [q.question_id]: "error" }));
    }
  }

  function editDraft(patch) {
    setDraft((d) => ({ ...d, ...patch }));
  }

  function editDraftOption(i, patch) {
    setDraft((d) => ({
      ...d,
      options: d.options.map((o, idx) => (idx === i ? { ...o, ...patch } : o)),
    }));
  }

  async function createQuestion() {
    const filled = draft.options.filter((o) => o.text_ar.trim());
    if (!draft.text_ar.trim() || filled.length < 2) {
      setDraftMsg(t.needText);
      return;
    }
    setDraftMsg(t.saving);
    try {
      const r = await api("adminAddQuestion", {
        token: getToken(),
        mode: draft.mode,
        text_ar: draft.text_ar,
        text_en: draft.text_en,
        max_score: draft.max_score,
        is_active: draft.is_active,
        options: filled,
      });
      if (!r || !r.ok) throw new Error("create");
      setDraftMsg(t.reload);
      await load();
      setDraft(null);
      setDraftMsg("");
    } catch {
      setDraftMsg(t.error);
    }
  }

  if (authLoading || state === "loading") {
    return (
      <div className={styles.page}>
        <p className={styles.muted}>{t.loading}</p>
      </div>
    );
  }
  if (state === "forbidden") {
    return (
      <div className={styles.page}>
        <p className={styles.muted}>{t.forbidden}</p>
      </div>
    );
  }
  if (state === "error") {
    return (
      <div className={styles.page}>
        <p className={styles.muted}>{t.error}</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <h1 className={styles.title}>{t.title}</h1>
        {!draft && (
          <button
            className={styles.save}
            onClick={() => setDraft(emptyDraft())}
          >
            {t.newQ}
          </button>
        )}
      </div>

      {draft && (
        <section className={styles.card}>
          <div className={styles.body}>
            <label className={styles.label}>{t.mode}</label>
            <select
              className={styles.input}
              value={draft.mode}
              onChange={(e) => editDraft({ mode: e.target.value })}
            >
              {MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <label className={styles.label}>{t.textAr}</label>
            <textarea
              dir="rtl"
              className={styles.input}
              rows={3}
              value={draft.text_ar}
              onChange={(e) => editDraft({ text_ar: e.target.value })}
            />
            <label className={styles.label}>{t.textEn}</label>
            <textarea
              dir="ltr"
              className={styles.input}
              rows={3}
              value={draft.text_en}
              onChange={(e) => editDraft({ text_en: e.target.value })}
            />

            <div className={styles.row}>
              <div>
                <label className={styles.label}>{t.maxScore}</label>
                <input
                  type="number"
                  className={styles.small}
                  value={draft.max_score}
                  onChange={(e) => editDraft({ max_score: e.target.value })}
                />
              </div>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={draft.is_active}
                  onChange={(e) => editDraft({ is_active: e.target.checked })}
                />
                {t.active}
              </label>
            </div>

            <h3 className={styles.sub}>{t.options}</h3>
            {draft.options.map((o, i) => (
              <div key={i} className={styles.opt}>
                <span className={styles.optId}>{"ABCDEFGHIJ"[i]}</span>
                <input
                  dir="rtl"
                  className={styles.input}
                  placeholder={t.optAr}
                  value={o.text_ar}
                  onChange={(e) =>
                    editDraftOption(i, { text_ar: e.target.value })
                  }
                />
                <input
                  dir="ltr"
                  className={styles.input}
                  placeholder={t.optEn}
                  value={o.text_en}
                  onChange={(e) =>
                    editDraftOption(i, { text_en: e.target.value })
                  }
                />
                <input
                  type="number"
                  className={styles.small}
                  title={t.score}
                  value={o.score}
                  onChange={(e) =>
                    editDraftOption(i, { score: e.target.value })
                  }
                />
                <input
                  className={styles.small}
                  title={t.family}
                  placeholder="CF_.."
                  value={o.career_family_id}
                  onChange={(e) =>
                    editDraftOption(i, { career_family_id: e.target.value })
                  }
                />
              </div>
            ))}
            {draft.options.length < 10 && (
              <button
                className={styles.chip}
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    options: [...d.options, emptyOption()],
                  }))
                }
              >
                {t.addOption}
              </button>
            )}

            <div className={styles.actions}>
              <button className={styles.save} onClick={createQuestion}>
                {t.create}
              </button>
              <button
                className={styles.chip}
                onClick={() => {
                  setDraft(null);
                  setDraftMsg("");
                }}
              >
                {t.cancel}
              </button>
              {draftMsg && <span className={styles.muted}>{draftMsg}</span>}
            </div>
          </div>
        </section>
      )}

      <div className={styles.filters}>
        {modes.map((m) => (
          <button
            key={m}
            className={`${styles.chip} ${mode === m ? styles.chipOn : ""}`}
            onClick={() => setMode(m)}
          >
            {m === "ALL" ? t.all : m}
          </button>
        ))}
      </div>

      {shown.map((q) => {
        const open = openId === q.question_id;
        const st = status[q.question_id];
        return (
          <section key={q.question_id} className={styles.card}>
            <button
              className={styles.head}
              onClick={() => setOpenId(open ? null : q.question_id)}
            >
              <span className={styles.num}>{q.order_no}</span>
              <span className={styles.qtext}>
                {lang === "ar" ? q.text_ar : q.text_en || q.text_ar}
              </span>
              <span className={q.is_active ? styles.on : styles.off}>
                {q.is_active ? t.active : "—"}
              </span>
            </button>

            {open && (
              <div className={styles.body}>
                <label className={styles.label}>{t.textAr}</label>
                <textarea
                  dir="rtl"
                  className={styles.input}
                  rows={3}
                  value={q.text_ar || ""}
                  onChange={(e) =>
                    editQuestion(q.question_id, { text_ar: e.target.value })
                  }
                />
                <label className={styles.label}>{t.textEn}</label>
                <textarea
                  dir="ltr"
                  className={styles.input}
                  rows={3}
                  value={q.text_en || ""}
                  onChange={(e) =>
                    editQuestion(q.question_id, { text_en: e.target.value })
                  }
                />

                <div className={styles.row}>
                  <div>
                    <label className={styles.label}>{t.maxScore}</label>
                    <input
                      type="number"
                      className={styles.small}
                      value={q.max_score}
                      onChange={(e) =>
                        editQuestion(q.question_id, {
                          max_score: e.target.value,
                        })
                      }
                    />
                  </div>
                  <label className={styles.check}>
                    <input
                      type="checkbox"
                      checked={q.is_active}
                      onChange={(e) =>
                        editQuestion(q.question_id, {
                          is_active: e.target.checked,
                        })
                      }
                    />
                    {t.active}
                  </label>
                </div>

                <h3 className={styles.sub}>{t.options}</h3>
                {q.options.map((o) => (
                  <div key={o.option_id} className={styles.opt}>
                    <span className={styles.optId}>{o.option_id}</span>
                    <input
                      dir="rtl"
                      className={styles.input}
                      placeholder={t.optAr}
                      value={o.text_ar || ""}
                      onChange={(e) =>
                        editOption(q.question_id, o.option_id, {
                          text_ar: e.target.value,
                        })
                      }
                    />
                    <input
                      dir="ltr"
                      className={styles.input}
                      placeholder={t.optEn}
                      value={o.text_en || ""}
                      onChange={(e) =>
                        editOption(q.question_id, o.option_id, {
                          text_en: e.target.value,
                        })
                      }
                    />
                    <input
                      type="number"
                      className={styles.small}
                      title={t.score}
                      value={o.score}
                      onChange={(e) =>
                        editOption(q.question_id, o.option_id, {
                          score: e.target.value,
                        })
                      }
                    />
                    <input
                      className={styles.small}
                      title={t.family}
                      placeholder="CF_.."
                      value={o.career_family_id || ""}
                      onChange={(e) =>
                        editOption(q.question_id, o.option_id, {
                          career_family_id: e.target.value,
                        })
                      }
                    />
                  </div>
                ))}

                {q.options.length < 10 && (
                  <button className={styles.chip} onClick={() => addOption(q)}>
                    {t.addOption}
                  </button>
                )}

                <div className={styles.actions}>
                  <button className={styles.save} onClick={() => saveAll(q)}>
                    {st === "saving" ? t.saving : t.save}
                  </button>
                  {st === "saved" && (
                    <span className={styles.ok}>{t.saved}</span>
                  )}
                  {st === "error" && (
                    <span className={styles.bad}>{t.error}</span>
                  )}
                </div>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
