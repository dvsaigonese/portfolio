/* ==========================================================================
   SHARED THEME (LIGHT/DARK) & DICTIONARY-DRIVEN I18N ENGINE
   Reads cleanly from window.DAPORT_I18N defined in js/i18n.js
   ========================================================================== */

(function () {
  const savedTheme = localStorage.getItem("daport_theme") || "light";
  const savedLang = localStorage.getItem("daport_lang") || "vi";
  document.documentElement.setAttribute("data-theme", savedTheme);
  document.documentElement.setAttribute("data-lang", savedLang);
})();

window.DAPORT_PREFS = {
  getTheme() {
    return document.documentElement.getAttribute("data-theme") || "light";
  },
  setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("daport_theme", theme);
    this.updateControls();
    if (typeof window.onMonographThemeChange === "function") {
      window.onMonographThemeChange(theme);
    }
  },
  toggleTheme() {
    this.setTheme(this.getTheme() === "dark" ? "light" : "dark");
  },
  getLang() {
    return document.documentElement.getAttribute("data-lang") || "vi";
  },
  setLang(lang) {
    document.documentElement.setAttribute("data-lang", lang);
    localStorage.setItem("daport_lang", lang);
    this.applyTranslations();
    this.updateControls();
    if (typeof window.onMonographLangChange === "function") {
      window.onMonographLangChange(lang);
    }
  },
  toggleLang() {
    this.setLang(this.getLang() === "vi" ? "en" : "vi");
  },

  // Hàm trích xuất text từ dictionary theo cú pháp dot-notation (vd: home.hero_title)
  resolveText(key, lang) {
    if (!window.DAPORT_I18N || !window.DAPORT_I18N[lang]) return null;
    const parts = key.split(".");
    let curr = window.DAPORT_I18N[lang];
    for (const p of parts) {
      if (curr && curr[p] !== undefined) {
        curr = curr[p];
      } else {
        return null;
      }
    }
    return curr;
  },

  applyTranslations() {
    const lang = this.getLang();
    
    // Gán innerHTML cho mọi thẻ có data-i18n
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      const text = this.resolveText(key, lang);
      if (text !== null) {
        el.innerHTML = text;
      }
    });

    // Gán placeholder cho input
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const key = el.getAttribute("data-i18n-placeholder");
      const text = this.resolveText(key, lang);
      if (text !== null) {
        el.placeholder = text;
      }
    });
  },

  updateControls() {
    const theme = this.getTheme();
    const lang = this.getLang();

    const themeBtn = document.getElementById("theme-toggle-btn");
    if (themeBtn) {
      const label = theme === "dark" 
        ? (this.resolveText("nav.theme_light", lang) || "Sáng")
        : (this.resolveText("nav.theme_dark", lang) || "Tối");
      themeBtn.innerHTML = theme === "dark" 
        ? `<span>☀</span> <span class="hidden sm:inline">${label}</span>`
        : `<span>☾</span> <span class="hidden sm:inline">${label}</span>`;
    }

    const langBtn = document.getElementById("lang-toggle-btn");
    if (langBtn) {
      langBtn.innerHTML = lang === "vi"
        ? `<span class="text-bordeaux font-bold">VI</span><span class="text-stone mx-0.5">/</span><span class="text-stone">EN</span>`
        : `<span class="text-stone">VI</span><span class="text-stone mx-0.5">/</span><span class="text-bordeaux font-bold">EN</span>`;
    }
  },

  init() {
    this.applyTranslations();
    this.updateControls();
  }
};

document.addEventListener("DOMContentLoaded", () => {
  window.DAPORT_PREFS.init();
});