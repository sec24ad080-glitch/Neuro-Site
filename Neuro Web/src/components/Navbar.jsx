import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

const NAV_LABELS = {
  en: {
    home: "Home",
    about: "About",
    features: "Features",
    howItWorks: "How It Works",
    learning: "Learning",
    accessibility: "Accessibility",
    contact: "Contact",
    login: "Student Login",
    start: "Start Learning 🚀",
  },
  ta: {
    home: "முகப்பு",
    about: "பற்றி",
    features: "அம்சங்கள்",
    howItWorks: "செயல்படும் விதம்",
    learning: "கற்றல்",
    accessibility: "அணுகல்தன்மை",
    contact: "தொடர்புகொள்ள",
    login: "மாணவர் உள்நுழைவு",
    start: "கற்றலைத் தொடங்கு 🚀",
  },
  hi: {
    home: "होम",
    about: "हमारे बारे में",
    features: "विशेषताएं",
    howItWorks: "कैसे काम करता है",
    learning: "सीखना",
    accessibility: "पहुंच क्षमता",
    contact: "संपर्क करें",
    login: "छात्र लॉगिन",
    start: "सीखना शुरू करें 🚀",
  },
};

export default function Navbar() {
  const { currentProfile, settings, updateSettings } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track scroll for subtle navbar shadow / background change
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isLanding = location.pathname === "/";

  const handleNavClick = (anchorId) => {
    setMobileMenuOpen(false);
    if (!isLanding) {
      navigate("/" + anchorId);
      return;
    }
    if (anchorId === "#hero" || anchorId === "") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const elem = document.querySelector(anchorId);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleStartLearning = () => {
    setMobileMenuOpen(false);
    if (currentProfile) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  const handleLoginClick = () => {
    setMobileMenuOpen(false);
    navigate("/login");
  };

  const toggleDyslexicFont = () => {
    updateSettings({ dyslexicFont: !settings.dyslexicFont });
  };

  const toggleHighContrast = () => {
    updateSettings({ highContrast: !settings.highContrast });
  };

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === "light" ? "dark" : "light" });
  };

  const toggleReducedMotion = () => {
    updateSettings({ reducedMotion: !settings.reducedMotion });
  };

  return (
    <header
      role="banner"
      style={{
        position: "sticky",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: scrolled
          ? "rgba(13, 13, 26, 0.94)"
          : "rgba(13, 13, 26, 0.82)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        transition: "all 0.25s ease",
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          onClick={(e) => {
            if (isLanding) {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            textDecoration: "none",
            color: "inherit",
          }}
          aria-label="NeuroLite Home"
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              boxShadow: "0 0 20px rgba(99,102,241,0.5)",
              flexShrink: 0,
            }}
          >
            🧠
          </div>
          <div>
            <div
              style={{
                fontSize: "1.35rem",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              Neuro<span className="gradient-text">Lite</span>
            </div>
            <div
              style={{
                fontSize: "0.68rem",
                color: "rgba(241,245,249,0.55)",
                fontWeight: 500,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Learning in Your Own Way
            </div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav
          role="navigation"
          aria-label="Main Navigation"
          className="desktop-nav-menu"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {(() => {
            const lang =
              settings.language in NAV_LABELS ? settings.language : "en";
            const labels = NAV_LABELS[lang];
            return (
              <>
                <button
                  onClick={() => handleNavClick("#hero")}
                  className="navbar-link"
                >
                  {labels.home}
                </button>
                <button
                  onClick={() => handleNavClick("#about")}
                  className="navbar-link"
                >
                  {labels.about}
                </button>
                <button
                  onClick={() => handleNavClick("#features")}
                  className="navbar-link"
                >
                  {labels.features}
                </button>
                <button
                  onClick={() => handleNavClick("#how-it-works")}
                  className="navbar-link"
                >
                  {labels.howItWorks}
                </button>
                <button
                  onClick={() => handleNavClick("#learning")}
                  className="navbar-link"
                >
                  {labels.learning}
                </button>
                <button
                  onClick={() => handleNavClick("#accessibility")}
                  className="navbar-link"
                >
                  {labels.accessibility}
                </button>
                <button
                  onClick={() => handleNavClick("#contact")}
                  className="navbar-link"
                >
                  {labels.contact}
                </button>
              </>
            );
          })()}
        </nav>

        {/* Accessibility & Action Buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {/* Quick Accessibility Toggles */}
          <div
            className="desktop-nav-toggles"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 10px",
              borderRadius: 14,
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <select
              value={settings.language || "en"}
              onChange={(e) => updateSettings({ language: e.target.value })}
              title="Select Webpage Language"
              aria-label="Select Webpage Language"
              style={{
                border: "none",
                background: "rgba(99, 102, 241, 0.18)",
                color: "#ffffff",
                padding: "7px 12px",
                borderRadius: 10,
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer",
                outline: "none",
                minWidth: settings.language === "ta" ? 110 : 88,
              }}
            >
              <option
                value="en"
                style={{ background: "#111128", color: "#fff" }}
              >
                EN
              </option>
              <option
                value="ta"
                style={{ background: "#111128", color: "#fff" }}
              >
                தமிழ்
              </option>
              <option
                value="hi"
                style={{ background: "#111128", color: "#fff" }}
              >
                हिन्दी
              </option>
            </select>
            <button
              onClick={toggleTheme}
              title={
                settings.theme === "light"
                  ? "Switch to Dark Mode"
                  : "Switch to Light Mode"
              }
              aria-label="Toggle Theme"
              style={{
                border: "1px solid rgba(255,255,255,0.06)",
                background:
                  settings.theme === "light"
                    ? "rgba(99, 102, 241, 0.18)"
                    : "rgba(255,255,255,0.04)",
                color: "rgba(241, 245, 249, 0.9)",
                padding: "6px 10px",
                borderRadius: 10,
                fontSize: "0.74rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {settings.theme === "light" ? "Light" : "Dark"}
            </button>
            <button
              onClick={toggleReducedMotion}
              title={
                settings.reducedMotion ? "Enable Animations" : "Reduce Motion"
              }
              aria-label="Toggle Reduced Motion"
              aria-pressed={settings.reducedMotion}
              style={{
                border: "1px solid rgba(255,255,255,0.06)",
                background: settings.reducedMotion
                  ? "rgba(16, 185, 129, 0.2)"
                  : "rgba(255,255,255,0.04)",
                color: "rgba(241, 245, 249, 0.9)",
                padding: "6px 10px",
                borderRadius: 10,
                fontSize: "0.74rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {settings.reducedMotion ? "Calm" : "Motion"}
            </button>
            <button
              onClick={toggleDyslexicFont}
              title={
                settings.dyslexicFont
                  ? "Switch to Standard Font"
                  : "Enable Dyslexia-Friendly Font"
              }
              aria-label="Toggle Dyslexia-Friendly Font"
              aria-pressed={settings.dyslexicFont}
              style={{
                border: "1px solid rgba(255,255,255,0.06)",
                background: settings.dyslexicFont
                  ? "rgba(99, 102, 241, 0.2)"
                  : "rgba(255,255,255,0.04)",
                color: "rgba(241, 245, 249, 0.9)",
                padding: "6px 10px",
                borderRadius: 10,
                fontSize: "0.74rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Font
            </button>
            <button
              onClick={toggleHighContrast}
              title={
                settings.highContrast
                  ? "Standard Contrast"
                  : "Enable High Contrast"
              }
              aria-label="Toggle High Contrast"
              aria-pressed={settings.highContrast}
              style={{
                border: "1px solid rgba(255,255,255,0.06)",
                background: settings.highContrast
                  ? "rgba(245, 158, 11, 0.2)"
                  : "rgba(255,255,255,0.04)",
                color: "rgba(241, 245, 249, 0.9)",
                padding: "6px 10px",
                borderRadius: 10,
                fontSize: "0.74rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Contr
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-hamburger-btn"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
            style={{
              display: "none",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: 10,
              color: "#f1f5f9",
              padding: "8px 12px",
              cursor: "pointer",
              fontSize: "1.1rem",
            }}
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className="mobile-drawer-overlay animate-fadeIn"
          style={{
            position: "fixed",
            top: "64px",
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(13, 13, 26, 0.98)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            padding: "24px 20px",
            overflowY: "auto",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            zIndex: 999,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "🏠 Home", id: "#hero" },
              { label: "ℹ️ About NeuroLite", id: "#about" },
              { label: "✨ Features", id: "#features" },
              { label: "🔄 How It Works", id: "#how-it-works" },
              { label: "📚 Learning Experience", id: "#learning" },
              { label: "♿ Accessibility Tools", id: "#accessibility" },
              { label: "📬 Contact & Community", id: "#contact" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  textAlign: "left",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: 14,
                  padding: "14px 18px",
                  color: "#f1f5f9",
                  fontSize: "1rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div
            style={{
              paddingTop: 16,
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <button
                onClick={toggleTheme}
                style={{
                  padding: "10px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#f1f5f9",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                }}
              >
                {settings.theme === "light"
                  ? "☀️ Mode: Light"
                  : "🌙 Mode: Dark"}
              </button>
              <button
                onClick={toggleReducedMotion}
                style={{
                  padding: "10px",
                  borderRadius: 12,
                  background: settings.reducedMotion
                    ? "rgba(16, 185, 129, 0.25)"
                    : "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#f1f5f9",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                }}
              >
                {settings.reducedMotion ? "⏹️ Motion: Calm" : "🏃 Motion: Full"}
              </button>
              <button
                onClick={toggleDyslexicFont}
                style={{
                  padding: "10px",
                  borderRadius: 12,
                  background: settings.dyslexicFont
                    ? "rgba(99, 102, 241, 0.25)"
                    : "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#f1f5f9",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                }}
              >
                📖 Dyslexic Font
              </button>
              <button
                onClick={toggleHighContrast}
                style={{
                  padding: "10px",
                  borderRadius: 12,
                  background: settings.highContrast
                    ? "rgba(245, 158, 11, 0.25)"
                    : "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#f1f5f9",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                }}
              >
                ◐ Contrast
              </button>
            </div>

            <button
              onClick={handleStartLearning}
              className="btn btn-primary"
              style={{ width: "100%", padding: "14px" }}
            >
              Start Learning Now 🚀
            </button>

            {!currentProfile && (
              <button
                onClick={handleLoginClick}
                className="btn btn-secondary"
                style={{ width: "100%", padding: "14px" }}
              >
                Student Login 👤
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        .navbar-link {
          background: transparent;
          border: none;
          color: rgba(241, 245, 249, 0.72);
          font-family: inherit;
          font-size: 0.92rem;
          font-weight: 500;
          padding: 8px 14px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .navbar-link:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.07);
        }
        @media (max-width: 992px) {
          .desktop-nav-menu {
            display: none !important;
          }
          .desktop-nav-toggles {
            display: none !important;
          }
          .desktop-nav-login {
            display: none !important;
          }
          .mobile-hamburger-btn {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}
