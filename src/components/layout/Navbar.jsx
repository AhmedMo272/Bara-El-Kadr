import { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { Menu, X, Languages } from "lucide-react";
import logo from "../../assets/brand-logo-tight.png";
import styles from "./Navbar.module.css";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";

const LINKS = [
  { to: "/", key: "nav.home" },
  { to: "/about", key: "nav.about" },
  { to: "/team", key: "nav.team" },
  { to: "/partners", key: "nav.partners" },
  { to: "/opportunities", key: "nav.opportunities" },
];

export default function Navbar() {
  const { t, lang, toggleLang } = useLanguage();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu after navigating
  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.brand}>
          <img
            className={styles.logo}
            src={logo}
            alt={`${t("brand")} ${t("slogan")}`}
          />
        </Link>

        <nav
          className={`${styles.links} ${open ? styles.open : ""}`}
          aria-label="Main"
        >
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ""}`
              }
            >
              {t(l.key)}
            </NavLink>
          ))}
          {user && (
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ""}`
              }
            >
              {lang === "ar" ? "لوحتي" : "Dashboard"}
            </NavLink>
          )}
          <Link to="/quest" className={`btn btn-accent ${styles.mobileCta}`}>
            {t("nav.quest")}
          </Link>
        </nav>

        <div className={styles.actions}>
          <button
            className={styles.lang}
            onClick={toggleLang}
            aria-label="Switch language"
          >
            <Languages size={18} />
            <span>{lang === "ar" ? "EN" : "عربي"}</span>
          </button>

          <Link to="/quest" className={`btn btn-accent ${styles.cta}`}>
            {t("nav.quest")}
          </Link>

          <button
            className={styles.burger}
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
}
