/* ==========================================================================
   EXPERIENCE ARTIFACT VAULT CONTROLLER (js/experience.js)
   - Đồng bộ 100% tên file thực tế trong thư mục assets/
   - Hỗ trợ hiển thị thẻ HTML highlight (<strong>, <em>) từ js/i18n.js
   - Khung cuộn dọc thông minh (Scrollable Viewport) cho ảnh dài goallineStudioHome.png
   ========================================================================== */

const EXP_VAULT_ASSETS = {
  bepro: {
    officialUrl: "https://www.bepro.ai/",
    samplePdfUrl: "assets/beproReport.pdf",
    // Khớp chính xác 2 file ảnh trong thư mục assets/ của bạn
    reportCharts: [
      {
        src: "assets/passMap.jpg",
        i18nKey: "chart1_title"
      },
      {
        src: "assets/passDetails.jpg",
        i18nKey: "chart2_title"
      }
    ],
    sampleCsvUrl: "assets/DistributionStats.csv",
    csvMaxRows: 25,
    defaultMissingHeaders: {
      0: "No.",
      1: "Player",
      2: "Pos",
      3: "Rating",
      4: "Mins",
      5: "Key Passes",
      36: "Passes Received",
      37: "Crosses Succeeded",
      38: "Crosses",
      39: "Cross Accuracy(%)",
      40: "Through Balls Succeeded",
      41: "Through Balls",
      42: "Through Ball Accuracy(%)",
      43: "Corners",
      44: "Free Kicks"
    },
    fallbackCsv: `,,,,,,Passes Succeeded,Passes,Pass Accuracy(%),Passes Succeeded In Final Third,Passes In Final Third,Pass Accuracy In Final Third(%),Passes Succeeded In Middle Third,Passes In Middle Third,Pass Accuracy In Middle Third(%),Passes Succeeded In Defensive Third,Passes In Defensive Third,Pass Accuracy In Defensive Third(%),Successful Long Passes,Long Passes,Long Pass Accuracy(%),Successful Medium Range Passes,Medium Range Passes,Medium Range Pass Accuracy(%),Successful Short Passes,Short Passes,Short Pass Accuracy(%),Successful Forward Passes,Passes Forward,Forward Pass Accuracy(%),Successful Sideways Passes,Passes Sideways,Sideways Pass Accuracy(%),Successful Backward Passes,Passes Backward,Backward Pass Accuracy(%),,,,,,,,,
1,O. Foster,GK,6.5,90,0,15,32,46.9,0,0,0,0,1,0,15,31,48.4,6,22,27.3,6,7,85.7,3,3,100,9,26,34.6,6,6,100,0,0,0,17,0,0,0,0,0,0,0,4
3,C. Cole,CB,6.5,78,0,37,47,78.7,6,7,85.7,24,29,82.8,7,11,63.6,3,5,60,10,14,71.4,24,28,85.7,16,26,61.5,14,14,100,7,7,100,31,0,0,0,1,1,100,0,1
4,A. Okunola,CB,7.1,90,0,27,28,96.4,2,2,100,14,15,93.3,11,11,100,5,5,100,9,9,100,13,14,92.9,10,11,90.9,9,9,100,8,8,100,12,0,1,0,0,0,0,0,1
5,J. Wilson,CB,7.1,90,0,26,35,74.3,0,1,0,17,21,81,9,13,69.2,2,4,50,11,13,84.6,13,18,72.2,9,17,52.9,14,15,93.3,3,3,100,20,0,0,0,0,0,0,0,1
17,T. Smith,CB,6.3,13,0,11,12,91.7,3,4,75,6,6,100,2,2,100,0,0,0,4,4,100,7,8,87.5,4,4,100,3,4,75,4,4,100,2,0,1,0,0,0,0,0,0
11,R. Patterson-Powell,LWB,6.3,90,1,33,41,80.5,16,16,100,11,15,73.3,6,10,60,1,3,33.3,10,12,83.3,22,26,84.6,7,15,46.7,10,10,100,16,16,100,37,0,7,0,1,3,33.3,3,0
12,L. Harrison,LWB,6.3,42,1,17,23,73.9,7,8,87.5,9,13,69.2,1,2,50,0,3,0,5,8,62.5,12,12,100,10,16,62.5,3,3,100,4,4,100,25,0,5,0,0,0,0,0,0
2,E. Tika-Lemba,RWB,6,49,0,12,18,66.7,2,3,66.7,7,8,87.5,3,7,42.9,0,1,0,3,5,60,9,12,75,5,10,50,5,6,83.3,2,2,100,14,0,0,0,0,0,0,1,2
7,I. Greenup,CM,7.5,90,4,64,78,82.1,18,21,85.7,41,49,83.7,5,8,62.5,3,7,42.9,30,35,85.7,31,36,86.1,27,40,67.5,25,26,96.2,12,12,100,64,3,6,50,0,1,0,0,2
6,B. Johnson,CM,6.7,77,0,19,24,79.2,4,6,66.7,14,16,87.5,1,2,50,0,0,0,5,6,83.3,14,18,77.8,7,12,58.3,5,5,100,7,7,100,22,0,2,0,0,1,0,1,4
18,F. Turner,CM,6.1,14,0,6,8,75,3,5,60,2,2,100,1,1,100,1,1,100,1,1,100,4,6,66.7,1,2,50,3,3,100,2,3,66.7,8,0,0,0,0,0,0,0,0
8,L. McCabe,LW,6.6,90,0,47,57,82.5,17,24,70.8,24,27,88.9,6,6,100,6,8,75,15,15,100,26,34,76.5,18,22,81.8,18,23,78.3,11,12,91.7,53,0,1,0,0,1,0,0,1
10,M. Hamilton,RW,8.1,90,1,40,44,90.9,15,17,88.2,22,24,91.7,3,3,100,3,4,75,12,12,100,25,28,89.3,12,15,80,15,16,93.8,13,13,100,37,2,3,66.7,1,2,50,1,0
9,C. Ibeh,CF,6.8,90,0,8,11,72.7,4,5,80,4,5,80,0,1,0,0,0,0,1,1,100,7,10,70,1,1,100,1,3,33.3,6,7,85.7,20,0,0,0,0,0,0,0,2`
  },
  dotb: {
    officialUrl: "https://dotb.vn/"
  },
  goalline: {
    officialUrl: "https://www.facebook.com/official.goalline",
    vgfUrl: "https://vgf.vn/",
    // Khớp chính xác file ảnh chụp giao diện Goal-Line Studio trong assets/
    studioImgUrl: "assets/goallineStudioHome.png"
  }
};

let vaultState = {
  companyKey: null,
  activeTabIdx: 0,
  csvCache: {}
};

function getVaultCopy() {
  const lang = (window.DAPORT_PREFS && window.DAPORT_PREFS.getLang()) || "vi";
  return window.DAPORT_I18N?.[lang]?.vault || window.DAPORT_I18N?.vi?.vault || {};
}

function escapeVaultHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseVaultCsvLine(line) {
  const result = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur.trim());
  return result;
}

async function fetchBeproCsvText() {
  const cfg = EXP_VAULT_ASSETS.bepro;
  if (vaultState.csvCache[cfg.sampleCsvUrl]) {
    return vaultState.csvCache[cfg.sampleCsvUrl];
  }
  try {
    const res = await fetch(cfg.sampleCsvUrl);
    if (res.ok) {
      const txt = await res.text();
      if (txt && txt.trim().length > 0) {
        vaultState.csvCache[cfg.sampleCsvUrl] = txt;
        return txt;
      }
    }
  } catch (err) {
    // Fallback sang dữ liệu CSV nhúng sẵn nếu mở qua file://
  }
  return cfg.fallbackCsv || "";
}

function renderCsvTableHtml(rawCsvText, csvUrl, maxRows = 25) {
  const v = getVaultCopy();
  const c = v.common || {};
  const b = v.bepro || {};

  const cleanText = String(rawCsvText || "").replace(/^\uFEFF/, "").trim();
  const lines = cleanText.split(/\r?\n/).filter(Boolean);

  if (lines.length === 0) {
    return `<div class="p-4 bento-card-subtle text-xs text-sub">${c.csv_not_found || ""}</div>`;
  }

  const rawHeaders = parseVaultCsvLine(lines[0]);
  const fallbackMap = EXP_VAULT_ASSETS.bepro.defaultMissingHeaders || {};
  const headers = rawHeaders.map((h, idx) => {
    const trimmed = h.trim();
    if (trimmed.length > 0) return trimmed;
    return fallbackMap[idx] || `Col_${idx + 1}`;
  });

  const bodyRows = lines.slice(1, maxRows + 1).map(parseVaultCsvLine);
  const fileName = csvUrl.split("/").pop() || "DistributionStats.csv";

  return `
    <div class="flex flex-wrap items-center justify-between gap-3 p-4 bento-card-subtle">
      <div class="min-w-0">
        <span class="text-[10px] font-bold uppercase tracking-wider text-sub block">
          ${b.csv_banner_tag || ""}
        </span>
        <h4 class="text-xs sm:text-sm font-bold text-main truncate mt-0.5">${escapeVaultHtml(fileName)}</h4>
      </div>
      <div class="flex items-center space-x-3 text-xs shrink-0">
        <span class="text-sub font-mono">${bodyRows.length} ${c.csv_meta_unit || ""} ${headers.length} ${c.csv_meta_cols || ""}</span>
        <a href="${escapeVaultHtml(csvUrl)}" target="_blank" download class="btn-pill btn-pill-solid text-xs">
          ${c.download_csv || "Download CSV"}
        </a>
      </div>
    </div>

    <div class="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-x-auto shadow-sm" style="background-color: var(--bg-card);">
      <table class="monograph-table tabular-nums">
        <thead>
          <tr>
            ${headers
              .map((h, cIdx) => {
                const stickyClass =
                  cIdx === 1
                    ? "sticky left-0 z-10 border-r border-neutral-200 dark:border-neutral-800"
                    : "";
                return `<th class="whitespace-nowrap ${stickyClass}">${escapeVaultHtml(h)}</th>`;
              })
              .join("")}
          </tr>
        </thead>
        <tbody>
          ${bodyRows
            .map(
              row => `
            <tr>
              ${headers
                .map((_, cIdx) => {
                  const isPlayerCol = cIdx === 1;
                  const cellClass = isPlayerCol
                    ? "sticky left-0 z-10 font-sans font-bold text-main border-r border-neutral-200 dark:border-neutral-800"
                    : "font-mono text-xs";
                  const bgStyle = isPlayerCol ? "background-color: var(--bg-card);" : "";
                  return `<td class="whitespace-nowrap ${cellClass}" style="${bgStyle}">${escapeVaultHtml(
                    row[cIdx] ?? ""
                  )}</td>`;
                })
                .join("")}
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function openExpVault(companyKey, tabIdx = 0) {
  vaultState.companyKey = companyKey;
  vaultState.activeTabIdx = tabIdx;
  renderExpVaultModal();
  const modal = document.getElementById("exp-vault-modal");
  if (modal) modal.classList.remove("hidden");
}

function switchExpVaultTab(tabIdx) {
  vaultState.activeTabIdx = tabIdx;
  renderExpVaultModal();
}

function closeExpVault() {
  vaultState.companyKey = null;
  const modal = document.getElementById("exp-vault-modal");
  if (modal) modal.classList.add("hidden");
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeExpVault();
});

const prevLangHook = window.onMonographLangChange;
window.onMonographLangChange = function (lang) {
  if (typeof prevLangHook === "function") prevLangHook(lang);
  if (vaultState.companyKey) renderExpVaultModal();
};

function getVaultData(companyKey) {
  const v = getVaultCopy();
  const c = v.common || {};

  // ==========================================================================
  // 01. BEPRO11 (3 TABS: Report Charts, Live CSV Table, Links)
  // ==========================================================================
  if (companyKey === "bepro") {
    const b = v.bepro || {};
    const charts = EXP_VAULT_ASSETS.bepro.reportCharts || [];
    const gridColsClass = charts.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2";

    const chartsHtml = charts
      .map((item, idx) => {
        const title = b[item.i18nKey] || item.title || `Chart 0${idx + 1}`;
        return `
          <figure class="bento-card p-3 sm:p-4 flex flex-col justify-between space-y-3">
            <a href="${escapeVaultHtml(item.src)}" target="_blank" rel="noopener"
               class="rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center min-h-[220px] block group">
              <img src="${escapeVaultHtml(item.src)}"
                   alt="${escapeVaultHtml(title)}"
                   class="w-full max-h-[420px] object-contain rounded-lg group-hover:scale-[1.02] transition-transform duration-200"
                   onerror="this.style.display='none'; this.nextElementSibling.classList.remove('hidden');" />
              <div class="hidden p-6 text-center space-y-1">
                <div class="text-xs font-bold text-main">${title}</div>
                <div class="text-[11px] font-mono text-sub">
                  ${c.place_chart_hint || ""} <code>${escapeVaultHtml(item.src)}</code>
                </div>
              </div>
            </a>
            <div class="flex items-center justify-between gap-2 px-1">
              <figcaption class="text-xs font-semibold text-muted truncate">${title}</figcaption>
              <a href="${escapeVaultHtml(item.src)}" target="_blank" rel="noopener" class="text-[11px] font-bold text-main hover:underline shrink-0">
                ${c.open_full_image || "Full Size"}
              </a>
            </div>
          </figure>
        `;
      })
      .join("");

    return {
      tag: b.tag || "",
      title: b.title || "",
      tabs: [
        {
          label: b.tab1 || "01",
          html: `
            <div class="flex flex-wrap items-center justify-between gap-3 p-4 bento-card-subtle">
              <div class="space-y-0.5">
                <span class="text-[10px] font-bold uppercase tracking-wider text-sub block">
                  ${b.preview_tag || ""}
                </span>
                <div class="text-xs sm:text-sm font-bold text-main">
                  ${b.preview_title || ""}
                </div>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <a href="${EXP_VAULT_ASSETS.bepro.samplePdfUrl}" target="_blank" class="btn-pill text-xs">
                  ${c.open_sample_pdf || ""}
                </a>
                <a href="${EXP_VAULT_ASSETS.bepro.officialUrl}" target="_blank" rel="noopener" class="btn-pill btn-pill-solid text-xs">
                  ${b.web_btn || "bepro.ai"}
                </a>
              </div>
            </div>

            <div class="grid ${gridColsClass} gap-4">
              ${chartsHtml}
            </div>
          `
        },
        {
          label: b.tab2 || "02",
          isAsyncCsv: true,
          html: `
            <div class="p-6 bento-card-subtle text-xs text-sub font-mono">
              ${c.loading_csv || ""}
            </div>
          `
        },
        {
          label: b.tab3 || "03",
          html: `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a href="${EXP_VAULT_ASSETS.bepro.officialUrl}" target="_blank" rel="noopener" class="bento-card bento-lift p-5 flex flex-col justify-between space-y-3">
                <div>
                  <span class="text-[10px] font-bold uppercase text-highlight">${b.link1_tag || ""}</span>
                  <h4 class="text-base font-extrabold text-main mt-1">${b.link1_title || ""}</h4>
                  <p class="text-xs text-muted mt-1 leading-relaxed">${b.link1_desc || ""}</p>
                </div>
                <span class="text-xs font-bold text-main underline">${b.link1_cta || ""}</span>
              </a>

              <a href="projects.html" class="bento-card bento-lift p-5 flex flex-col justify-between space-y-3">
                <div>
                  <span class="text-[10px] font-bold uppercase text-sub">${b.link2_tag || ""}</span>
                  <h4 class="text-base font-extrabold text-main mt-1">${b.link2_title || ""}</h4>
                  <p class="text-xs text-muted mt-1 leading-relaxed">${b.link2_desc || ""}</p>
                </div>
                <span class="text-xs font-bold text-main underline">${c.open_project_archive || ""}</span>
              </a>
            </div>
          `
        }
      ]
    };
  }

  // ==========================================================================
  // 02. DOTB (2 TABS - NDA SAFE)
  // ==========================================================================
  if (companyKey === "dotb") {
    const d = v.dotb || {};
    return {
      tag: d.tag || "",
      title: d.title || "",
      tabs: [
        {
          label: d.tab1 || "01",
          html: `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div class="bento-card p-4 space-y-1.5">
                <span class="text-[10px] font-bold uppercase text-sub">${d.step1_tag || ""}</span>
                <div class="text-sm font-extrabold text-main">${d.step1_title || ""}</div>
                <p class="text-xs text-muted leading-relaxed">${d.step1_desc || ""}</p>
              </div>

              <div class="bento-card p-4 space-y-1.5">
                <span class="text-[10px] font-bold uppercase text-highlight">${d.step2_tag || ""}</span>
                <div class="text-sm font-extrabold text-main">${d.step2_title || ""}</div>
                <p class="text-xs text-muted leading-relaxed">${d.step2_desc || ""}</p>
              </div>

              <div class="bento-card p-4 space-y-1.5">
                <span class="text-[10px] font-bold uppercase text-sub">${d.step3_tag || ""}</span>
                <div class="text-sm font-extrabold text-main">${d.step3_title || ""}</div>
                <p class="text-xs text-muted leading-relaxed">${d.step3_desc || ""}</p>
              </div>
            </div>
          `
        },
        {
          label: d.tab2 || "02",
          html: `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a href="${EXP_VAULT_ASSETS.dotb.officialUrl}" target="_blank" rel="noopener" class="bento-card bento-lift p-5 flex flex-col justify-between space-y-3">
                <div>
                  <span class="text-[10px] font-bold uppercase text-highlight">${d.link1_tag || ""}</span>
                  <h4 class="text-base font-extrabold text-main mt-1">${d.link1_title || ""}</h4>
                  <p class="text-xs text-muted mt-1 leading-relaxed">${d.link1_desc || ""}</p>
                </div>
                <span class="text-xs font-bold text-main underline">${d.link1_cta || ""}</span>
              </a>

              <a href="projects.html" class="bento-card bento-lift p-5 flex flex-col justify-between space-y-3">
                <div>
                  <span class="text-[10px] font-bold uppercase text-sub">${d.link2_tag || ""}</span>
                  <h4 class="text-base font-extrabold text-main mt-1">${d.link2_title || ""}</h4>
                  <p class="text-xs text-muted mt-1 leading-relaxed">${d.link2_desc || ""}</p>
                </div>
                <span class="text-xs font-bold text-main underline">${c.open_project_archive || ""}</span>
              </a>
            </div>
          `
        }
      ]
    };
  }

  // ==========================================================================
  // 03. GOAL-LINE STUDIO x VGF (1 MÀN HÌNH DUY NHẤT: KHUNG CUỘN GIAO DIỆN WEB + 2 LINK)
  // Giải quyết triệt để ảnh dọc dài (goallineStudioHome.png) bằng khung cuộn mượt mà
  // ==========================================================================
  const g = v.goalline || {};
  const studioImg = EXP_VAULT_ASSETS.goalline.studioImgUrl || "assets/goallineStudioHome.png";

  return {
    tag: g.tag || "",
    title: g.title || "",
    tabs: [
      {
        label: g.tab1 || "01",
        html: `
          <!-- Header thanh công cụ của ảnh chụp giao diện Goal-Line Studio -->
          <div class="flex flex-wrap items-center justify-between gap-3 p-4 bento-card-subtle">
            <div class="space-y-0.5">
              <span class="text-[10px] font-bold uppercase tracking-wider text-sub block">
                ${g.studio_tag || "INTERNAL WORKFLOW SUITE (POSTGRESQL / SUPABASE)"}
              </span>
              <div class="text-xs sm:text-sm font-bold text-main">
                ${g.studio_title || "Goal-Line Studio"}
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="hidden md:inline text-[11px] font-mono text-sub">
                [${c.scroll_hint || "Scroll inside frame"}]
              </span>
              <a href="${escapeVaultHtml(studioImg)}" target="_blank" rel="noopener" class="btn-pill btn-pill-solid text-xs">
                ${c.open_full_image || "Open Full Image"}
              </a>
            </div>
          </div>

          <!-- Khung trình duyệt có thanh cuộn dọc riêng cho ảnh dài goallineStudioHome.png -->
          <figure class="bento-card p-3 sm:p-4 space-y-3">
            <div class="max-h-[420px] overflow-y-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900">
              <img src="${escapeVaultHtml(studioImg)}"
                   alt="${escapeVaultHtml(g.photo_caption || "Goal-Line Studio Interface")}"
                   class="w-full h-auto block"
                   onerror="this.style.display='none'; this.nextElementSibling.classList.remove('hidden');" />
              <div class="hidden p-8 text-center space-y-1">
                <div class="text-xs font-bold text-main">${g.photo_caption || ""}</div>
                <div class="text-[11px] font-mono text-sub">
                  ${c.place_chart_hint || ""} <code>${escapeVaultHtml(studioImg)}</code>
                </div>
              </div>
            </div>
            <figcaption class="text-xs font-semibold text-muted px-1 text-center">
              ${g.photo_caption || ""}
            </figcaption>
          </figure>

          <!-- 2 Thẻ liên kết trực tiếp tới Fanpage Goal-Line & Trang chủ VGF -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a href="${EXP_VAULT_ASSETS.goalline.officialUrl}" target="_blank" rel="noopener" class="bento-card bento-lift p-5 flex flex-col justify-between space-y-3">
              <div>
                <span class="text-[10px] font-bold uppercase text-highlight">${g.link1_tag || ""}</span>
                <h4 class="text-base font-extrabold text-main mt-1">${g.link1_title || ""}</h4>
                <p class="text-xs text-muted mt-1 leading-relaxed">${g.link1_desc || ""}</p>
              </div>
              <span class="text-xs font-bold text-main underline">${g.link1_cta || ""}</span>
            </a>

            <a href="${EXP_VAULT_ASSETS.goalline.vgfUrl}" target="_blank" rel="noopener" class="bento-card bento-lift p-5 flex flex-col justify-between space-y-3">
              <div>
                <span class="text-[10px] font-bold uppercase text-sub">${g.link2_tag || ""}</span>
                <h4 class="text-base font-extrabold text-main mt-1">${g.link2_title || ""}</h4>
                <p class="text-xs text-muted mt-1 leading-relaxed">${g.link2_desc || ""}</p>
              </div>
              <span class="text-xs font-bold text-main underline">${g.link2_cta || ""}</span>
            </a>
          </div>
        `
      }
    ]
  };
}

async function renderExpVaultModal() {
  if (!vaultState.companyKey) return;
  const data = getVaultData(vaultState.companyKey);

  if (vaultState.activeTabIdx >= data.tabs.length) {
    vaultState.activeTabIdx = 0;
  }

  const tagEl = document.getElementById("exp-vault-tag");
  const titleEl = document.getElementById("exp-vault-title");
  const tabsEl = document.getElementById("exp-vault-tabs");
  const stageEl = document.getElementById("exp-vault-stage");

  if (tagEl) tagEl.textContent = data.tag;
  if (titleEl) titleEl.textContent = data.title;

  if (tabsEl) {
    if (data.tabs.length <= 1) {
      tabsEl.classList.add("hidden");
      tabsEl.innerHTML = "";
    } else {
      tabsEl.classList.remove("hidden");
      tabsEl.innerHTML = data.tabs
        .map((t, idx) => {
          const isActive = idx === vaultState.activeTabIdx;
          return `
            <button type="button" onclick="switchExpVaultTab(${idx})"
                    class="btn-pill whitespace-nowrap text-xs ${isActive ? "btn-pill-solid" : ""}">
              ${t.label}
            </button>
          `;
        })
        .join("");
    }
  }

  if (stageEl) {
    const activeTab = data.tabs[vaultState.activeTabIdx] || data.tabs[0];
    stageEl.innerHTML = activeTab.html;

    if (activeTab.isAsyncCsv && vaultState.companyKey === "bepro") {
      const cfg = EXP_VAULT_ASSETS.bepro;
      const csvText = await fetchBeproCsvText();
      if (vaultState.companyKey === "bepro" && data.tabs[vaultState.activeTabIdx]?.isAsyncCsv) {
        stageEl.innerHTML = renderCsvTableHtml(csvText, cfg.sampleCsvUrl, cfg.csvMaxRows);
      }
    }
  }
}