/* ==========================================================================
   THEME & LANGUAGE CONTROLLER (js/theme-lang.js)
   - Default: Light Theme ("light") + English ("en")
   ========================================================================== */

(function () {
  const THEME_KEY = "daport_theme_v2";
  const LANG_KEY = "daport_lang_v2";

  function getSavedTheme() {
    try {
      return localStorage.getItem(THEME_KEY) || "light";
    } catch (e) {
      return "light";
    }
  }

  function getSavedLang() {
    try {
      return localStorage.getItem(LANG_KEY) || "en";
    } catch (e) {
      return "en";
    }
  }

  // Áp dụng ngay lập tức trên thẻ <html> trước khi trang render để không bị chớp màu
  const initialTheme = getSavedTheme();
  const initialLang = getSavedLang();
  document.documentElement.setAttribute("data-theme", initialTheme);
  document.documentElement.setAttribute("data-lang", initialLang);
  document.documentElement.setAttribute("lang", initialLang);

  function resolveKey(obj, path) {
    if (!obj || !path) return undefined;
    return path.split(".").reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
  }

  function applyTranslations(lang) {
    const dict = (window.DAPORT_I18N && window.DAPORT_I18N[lang]) || (window.DAPORT_I18N && window.DAPORT_I18N.en);
    if (!dict) return;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const val = resolveKey(dict, key);
      if (val !== undefined) {
        el.innerHTML = val;
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      const val = resolveKey(dict, key);
      if (val !== undefined) {
        el.setAttribute("placeholder", val);
      }
    });

    updateControlButtons(getSavedTheme(), lang);
  }

  function updateControlButtons(theme, lang) {
    const dict = (window.DAPORT_I18N && window.DAPORT_I18N[lang]) || (window.DAPORT_I18N && window.DAPORT_I18N.en) || {};
    const navDict = dict.nav || {};

    const themeBtn = document.getElementById("theme-toggle-btn");
    if (themeBtn) {
      themeBtn.textContent = theme === "dark"
        ? (navDict.theme_light || "Light")
        : (navDict.theme_dark || "Dark");
    }

    const langBtn = document.getElementById("lang-toggle-btn");
    if (langBtn) {
      langBtn.textContent = lang === "en" ? "EN / VI" : "VI / EN";
    }
  }

  function setTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
    document.documentElement.setAttribute("data-theme", theme);
    updateControlButtons(theme, getSavedLang());
    if (typeof window.onMonographThemeChange === "function") {
      window.onMonographThemeChange(theme);
    }
  }

  function setLang(lang) {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (e) {}
    document.documentElement.setAttribute("data-lang", lang);
    document.documentElement.setAttribute("lang", lang);
    applyTranslations(lang);
    if (typeof window.onMonographLangChange === "function") {
      window.onMonographLangChange(lang);
    }
  }

  window.DAPORT_PREFS = {
    getTheme: getSavedTheme,
    getLang: getSavedLang,
    setTheme: setTheme,
    setLang: setLang,
    toggleTheme: function () {
      const next = getSavedTheme() === "dark" ? "light" : "dark";
      setTheme(next);
    },
    toggleLang: function () {
      const next = getSavedLang() === "en" ? "vi" : "en";
      setLang(next);
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    const t = getSavedTheme();
    const l = getSavedLang();
    document.documentElement.setAttribute("data-theme", t);
    document.documentElement.setAttribute("data-lang", l);
    document.documentElement.setAttribute("lang", l);
    applyTranslations(l);
  });
})();