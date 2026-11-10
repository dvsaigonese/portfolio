/* ==========================================================================
   DAPORT MONOGRAPH APPLICATION CONTROLLER (v3.0 — Bilingual & Light/Dark)
   ========================================================================== */

let state = {
  activeFolioId: "04",
  activeLensTab: "visuals", // 'visuals' | 'brief' | 'code' | 'data' | 'readme'
  activeFilePath: null,
  activeVisualIndex: 0,
  treeScopeMode: "scoped",
  searchQuery: "",
  bannerMinimized: false
};

const CODE_FILE_TYPES = ["sql", "py", "ipynb", "dax"];

function isVi() {
  return (window.DAPORT_PREFS && window.DAPORT_PREFS.getLang() === "vi");
}

document.addEventListener("DOMContentLoaded", () => {
  const folios = window.DAPORT_MANIFEST?.folios || [];

  // Tự động bóc tách biểu đồ Base64 từ các cell của file .ipynb đưa ra Tab 01 Visuals
  hydrateNotebookVisuals(folios);

  if (folios.length > 0) {
    const defaultFolio = folios.find(f => f.id === state.activeFolioId) || folios[folios.length - 1];
    state.activeFolioId = defaultFolio.id;
    state.activeFilePath = defaultFolio.files[0]?.path || null;
  }

  renderAll();

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
});

// Tự động vẽ lại khi đổi giao diện Sáng/Tối hoặc Ngôn ngữ
window.onMonographThemeChange = () => renderActiveLensStage();
window.onMonographLangChange = () => renderAll();

function hydrateNotebookVisuals(folios) {
  folios.forEach(folio => {
    const hasOnlyPlaceholder =
      !folio.visuals ||
      folio.visuals.length === 0 ||
      (folio.visuals.length === 1 && folio.visuals[0].path.endsWith("assets/preview.png"));

    if (!hasOnlyPlaceholder) return;

    const extractedPlates = [];
    (folio.files || []).forEach(file => {
      if (file.type === "ipynb" && file.content) {
        try {
          const parsed = JSON.parse(file.content);
          const cells = parsed.notebook_cells || parsed.cells || [];
          let currentSectionTitle = folio.title;

          cells.forEach(cell => {
            const src = Array.isArray(cell.source) ? cell.source.join("") : String(cell.source || "");
            if (cell.cell_type === "markdown") {
              const hMatch = src.match(/^#{1,3}\s+(.+)$/m);
              if (hMatch) {
                currentSectionTitle = hMatch[1].replace(/[^\w\s:&.,()-]/g, "").trim();
              }
            } else if (cell.cell_type === "code" && Array.isArray(cell.outputs)) {
              cell.outputs.forEach(out => {
                if (out.type === "image" && out.data) {
                  extractedPlates.push({
                    title: currentSectionTitle || `Notebook Plot ${extractedPlates.length + 1}`,
                    path: `data:image/png;base64,${out.data}`,
                    caption: `Extracted from ${file.name} (In [${cell.execution_count || "*"}])`,
                    chartType: "notebook_plot",
                    metrics: []
                  });
                }
              });
            }
          });
        } catch (e) {
          // Bỏ qua nếu JSON lỗi
        }
      }
    });

    if (extractedPlates.length > 0) {
      folio.visuals = extractedPlates;
      if (folio.kpis && folio.kpis[2]) {
        folio.kpis[2].value = `${extractedPlates.length} EDA Plots`;
      }
    }
  });
}

function getActiveFolio() {
  const folios = window.DAPORT_MANIFEST?.folios || [];
  return folios.find(f => f.id === state.activeFolioId) || folios[0];
}

function renderAll() {
  updateMastheadCounters();
  renderFolioSelectorStrip();
  renderFileTree();
  renderViewerHeader();
  renderActiveLensStage();
}

// ============================================================================
// 1. BANNER TOGGLE
// ============================================================================
function toggleDossierBanner() {
  state.bannerMinimized = !state.bannerMinimized;
  const body = document.getElementById("banner-body");
  const icon = document.getElementById("banner-toggle-icon");
  const text = document.getElementById("banner-toggle-text");

  if (state.bannerMinimized) {
    body.classList.add("hidden");
    icon.textContent = "[ + ]";
    text.textContent = isVi() ? "Mở rộng Banner" : "Expand Banner";
  } else {
    body.classList.remove("hidden");
    icon.textContent = "[ — ]";
    text.textContent = isVi() ? "Thu gọn Banner" : "Minimize Banner";
  }
}

// ============================================================================
// 2. FOLIO SELECTOR STRIP
// ============================================================================
function updateMastheadCounters() {
  const folios = window.DAPORT_MANIFEST?.folios || [];
  const totalFiles = folios.reduce((acc, f) => acc + (f.files?.length || 0) + (f.visuals?.length || 0), 0);

  const mastheadCount = document.getElementById("masthead-folio-count");
  if (mastheadCount) {
    mastheadCount.textContent = isVi()
      ? `VOLUME 01 · ${String(folios.length).padStart(2, "0")} DỰ ÁN HOÀN CHỈNH`
      : `VOLUME 01 · ${String(folios.length).padStart(2, "0")} COMPLETE CASE STUDIES`;
  }

  const filesCounter = document.getElementById("total-files-counter");
  if (filesCounter) {
    filesCounter.textContent = `${totalFiles} Artifacts`;
  }
}

function renderFolioSelectorStrip() {
  const container = document.getElementById("folio-selector-grid");
  if (!container) return;
  const folios = window.DAPORT_MANIFEST?.folios || [];

  container.innerHTML = folios.map(folio => {
    const isActive = folio.id === state.activeFolioId;
    const fileCount = (folio.files?.length || 0) + (folio.visuals?.length || 0);

    return `
      <div onclick="selectFolio('${folio.id}')"
           class="folio-card cursor-pointer p-4 border border-ink/15 bg-parchment/70 hover:bg-alabaster flex flex-col justify-between ${isActive ? 'active-folio' : ''}">
        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="folio-badge px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider uppercase bg-parchmentDark text-ink">
              ${escapeHtml(folio.code)}
            </span>
            <span class="font-mono text-[10px] text-stone">${fileCount} files →</span>
          </div>
          <h2 class="font-serif text-lg leading-snug text-ink font-medium mb-1">
            ${escapeHtml(folio.title)}
          </h2>
          <p class="font-sans text-xs text-stone line-clamp-2 leading-relaxed">
            ${escapeHtml(folio.shortDesc)}
          </p>
        </div>

        <div class="mt-3.5 pt-2.5 border-t border-ink/10 flex items-center justify-between gap-2">
          <span class="font-mono text-[10px] uppercase tracking-wider text-stone shrink-0">${isVi() ? 'ĐIỂM NHẤN' : 'KEY METRIC'}</span>
          <span class="font-mono text-[11px] font-semibold text-bordeaux tabular-nums truncate" title="${escapeAttr(folio.headlineMetric)}">
            ${escapeHtml(folio.headlineMetric)}
          </span>
        </div>
      </div>
    `;
  }).join("");
}

function selectFolio(folioId) {
  state.activeFolioId = folioId;
  state.activeVisualIndex = 0;
  const folio = getActiveFolio();

  if (state.activeLensTab === "code") {
    const codeFile = folio.files.find(f => CODE_FILE_TYPES.includes(f.type));
    state.activeFilePath = codeFile ? codeFile.path : folio.files[0]?.path;
  } else if (state.activeLensTab === "data") {
    const csvFile = folio.files.find(f => f.type === "csv");
    state.activeFilePath = csvFile ? csvFile.path : folio.files[0]?.path;
  } else {
    const readme = folio.files.find(f => f.type === "md");
    state.activeFilePath = readme ? readme.path : folio.files[0]?.path;
  }

  renderAll();
}

// ============================================================================
// 3. LEFT COLUMN: REPOSITORY FILE TREE
// ============================================================================
function toggleTreeScope() {
  state.treeScopeMode = state.treeScopeMode === "scoped" ? "all" : "scoped";
  const btn = document.getElementById("tree-scope-btn");
  if (btn) {
    btn.textContent = state.treeScopeMode === "scoped"
      ? (isVi() ? "[ Chế độ: Chỉ hiện Folder đang chọn ]" : "[ Mode: Scoped Project Tree ]")
      : (isVi() ? "[ Chế độ: Hiện tất cả Folder ]" : "[ Mode: All Repository Folders ]");
  }
  renderFileTree();
}

function handleFileSearch(query) {
  state.searchQuery = query.trim().toLowerCase();
  renderFileTree();
}

function renderFileTree() {
  const container = document.getElementById("file-tree-container");
  if (!container) return;
  const activeFolio = getActiveFolio();
  const shortLabel = document.getElementById("active-folder-short");
  if (shortLabel && activeFolio) {
    shortLabel.textContent = activeFolio.folder;
  }

  const foliosToRender = state.treeScopeMode === "scoped"
    ? [activeFolio]
    : (window.DAPORT_MANIFEST?.folios || []);

  let html = "";

  foliosToRender.forEach(folio => {
    if (!folio) return;
    const isCurrentFolio = folio.id === state.activeFolioId;

    html += `
      <div class="mb-2">
        <div onclick="selectFolio('${folio.id}')"
             class="flex items-center justify-between px-2 py-1.5 font-mono text-xs font-semibold cursor-pointer ${isCurrentFolio ? 'bg-parchmentDark text-ink' : 'text-charcoal hover:bg-parchment'}">
          <div class="flex items-center space-x-1.5 truncate">
            <span class="text-bordeaux">▾</span>
            <span class="truncate" title="${escapeAttr(folio.folder)}">${escapeHtml(folio.folder)}</span>
          </div>
        </div>
        <div class="pl-3 mt-1 space-y-0.5 border-l border-ink/10 ml-2">
    `;

    // Visual files
    (folio.visuals || []).forEach((vis, idx) => {
      const fileName = vis.path.startsWith("data:image")
        ? `notebook_plot_0${idx + 1}.png`
        : (vis.path.split("/").slice(1).join("/") || `assets/plate_0${idx + 1}.png`);
      if (state.searchQuery && !fileName.toLowerCase().includes(state.searchQuery)) return;
      const isSelected = state.activeLensTab === "visuals" && isCurrentFolio && state.activeVisualIndex === idx;

      html += `
        <div onclick="openVisualFromTree('${folio.id}', ${idx})"
             class="flex items-center justify-between px-2 py-1 font-mono text-[11px] cursor-pointer transition-colors ${isSelected ? 'bg-bordeaux text-white font-medium' : 'text-charcoal hover:bg-parchmentDark/60'}">
          <span class="truncate" title="${escapeAttr(vis.title)}">${escapeHtml(fileName)}</span>
          <span class="text-[9px] uppercase opacity-75 ml-2 shrink-0">VISUAL</span>
        </div>
      `;
    });

    // Code, Notebook, CSV & Markdown files
    (folio.files || []).forEach(file => {
      if (state.searchQuery && !file.name.toLowerCase().includes(state.searchQuery) && !file.type.toLowerCase().includes(state.searchQuery)) return;
      const isSelected = isCurrentFolio && state.activeFilePath === file.path && ["code", "data", "readme"].includes(state.activeLensTab);

      const badgeLabel = file.type === "ipynb" ? "IPYNB" : file.type.toUpperCase();

      html += `
        <div onclick="openFileFromTree('${folio.id}', '${escapeAttr(file.path)}')"
             class="flex items-center justify-between px-2 py-1 font-mono text-[11px] cursor-pointer transition-colors ${isSelected ? 'bg-ink text-alabaster font-medium' : 'text-charcoal hover:bg-parchmentDark/60'}">
          <span class="truncate" title="${escapeAttr(file.name)}">${escapeHtml(file.name)}</span>
          <span class="text-[9px] uppercase ${file.type === 'ipynb' ? 'text-bordeaux font-semibold' : 'opacity-70'} ml-2 shrink-0">${escapeHtml(badgeLabel)}</span>
        </div>
      `;
    });

    html += `</div></div>`;
  });

  container.innerHTML = html || `<div class="p-3 font-mono text-xs text-stone">No matching files found.</div>`;
}

function openVisualFromTree(folioId, visualIdx = 0) {
  state.activeFolioId = folioId;
  state.activeVisualIndex = visualIdx;
  state.activeLensTab = "visuals";
  renderAll();
}

function openFileFromTree(folioId, filePath) {
  state.activeFolioId = folioId;
  state.activeFilePath = filePath;

  const folio = getActiveFolio();
  const file = folio.files.find(f => f.path === filePath);

  if (file) {
    if (file.type === "md") state.activeLensTab = "readme";
    else if (file.type === "csv") state.activeLensTab = "data";
    else state.activeLensTab = "code";
  }
  renderAll();
}

// ============================================================================
// 4. RIGHT COLUMN: LENS TABS & STAGE RENDERER
// ============================================================================
function switchLensTab(tabName) {
  state.activeLensTab = tabName;
  const folio = getActiveFolio();

  if (tabName === "code") {
    const currentFile = folio.files.find(f => f.path === state.activeFilePath);
    if (!currentFile || !CODE_FILE_TYPES.includes(currentFile.type)) {
      const firstCode = folio.files.find(f => CODE_FILE_TYPES.includes(f.type));
      if (firstCode) state.activeFilePath = firstCode.path;
    }
  } else if (tabName === "data") {
    const currentFile = folio.files.find(f => f.path === state.activeFilePath);
    if (!currentFile || currentFile.type !== "csv") {
      const firstCsv = folio.files.find(f => f.type === "csv");
      if (firstCsv) state.activeFilePath = firstCsv.path;
    }
  } else if (tabName === "readme") {
    const readme = folio.files.find(f => f.type === "md");
    if (readme) state.activeFilePath = readme.path;
  }

  renderAll();
}

function renderViewerHeader() {
  const folio = getActiveFolio();
  if (!folio) return;
  const breadcrumb = document.getElementById("viewer-breadcrumb");
  const meta = document.getElementById("viewer-file-meta");
  const ghLink = document.getElementById("github-direct-link");

  ["visuals", "brief", "code", "data", "readme"].forEach(t => {
    const btn = document.getElementById(`tab-btn-${t}`);
    if (!btn) return;
    if (t === state.activeLensTab) btn.classList.add("active-lens-tab");
    else btn.classList.remove("active-lens-tab");
  });

  const activeFile = folio.files.find(f => f.path === state.activeFilePath) || folio.files[0];

  if (state.activeLensTab === "visuals") {
    const vis = folio.visuals?.[state.activeVisualIndex] || folio.visuals?.[0];
    const displayPath = vis && !vis.path.startsWith("data:image") ? vis.path : `${folio.folder}/visual_plate_${state.activeVisualIndex + 1}`;
    breadcrumb.textContent = `DAport / ${displayPath}`;
    meta.textContent = `${folio.code} · VISUAL PLATE`;
  } else if (state.activeLensTab === "brief") {
    breadcrumb.textContent = `DAport / ${folio.folder} / EXECUTIVE_BRIEF`;
    meta.textContent = `HR 5-SECOND SYNOPSIS`;
  } else if (activeFile) {
    breadcrumb.textContent = `DAport / ${activeFile.path}`;
    meta.textContent = `${activeFile.size || ""} · ${activeFile.type.toUpperCase()}`;
  }

  if (ghLink) {
    ghLink.href = `${window.DAPORT_MANIFEST.githubBaseUrl}${folio.folder}`;
  }
}

async function renderActiveLensStage() {
  const stage = document.getElementById("viewer-stage");
  if (!stage) return;
  const folio = getActiveFolio();

  if (state.activeLensTab === "visuals") {
    renderVisualsStage(stage, folio);
  } else if (state.activeLensTab === "brief") {
    renderExecutiveBriefStage(stage, folio);
  } else if (state.activeLensTab === "code") {
    await renderCodeOrNotebookStage(stage, folio);
  } else if (state.activeLensTab === "data") {
    await renderDataCsvStage(stage, folio);
  } else if (state.activeLensTab === "readme") {
    await renderReadmeStage(stage, folio);
  }
}

// ----------------------------------------------------------------------------
// TAB 01: VISUALS & DASHBOARDS STAGE
// ----------------------------------------------------------------------------
function renderVisualsStage(stage, folio) {
  const visuals = folio.visuals || [];
  const vis = visuals[state.activeVisualIndex] || visuals[0] || {
    title: folio.title,
    path: `${folio.folder}/assets/overview.png`,
    caption: folio.shortDesc,
    chartType: "warehouse",
    metrics: []
  };

  stage.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      ${(folio.kpis || []).map(k => `
        <div class="p-4 bg-parchment border border-ink/12">
          <div class="font-mono text-[10px] uppercase tracking-widest text-stone">${escapeHtml(k.label)}</div>
          <div class="font-serif text-xl lg:text-2xl font-semibold text-ink tabular-nums mt-1 truncate" title="${escapeAttr(k.value)}">${escapeHtml(k.value)}</div>
          <div class="font-mono text-[11px] text-bordeaux mt-0.5 truncate">${escapeHtml(k.sub)}</div>
        </div>
      `).join("")}
    </div>

    ${visuals.length > 1 ? `
      <div class="flex flex-wrap gap-2 mb-4">
        ${visuals.map((v, i) => `
          <button onclick="openVisualFromTree('${folio.id}', ${i})"
                  class="px-3 py-1.5 font-mono text-xs border transition-colors cursor-pointer ${i === state.activeVisualIndex ? 'bg-ink text-alabaster border-ink' : 'bg-parchment text-ink border-ink/15 hover:bg-parchmentDark'}">
            Plate ${String(i + 1).padStart(2, '0')}: ${escapeHtml(v.title.slice(0, 34))}
          </button>
        `).join("")}
      </div>
    ` : ""}

    <div class="border border-ink/15 bg-parchment/40 p-5 lg:p-6">
      <div class="flex flex-wrap items-center justify-between gap-4 pb-4 mb-5 border-b border-ink/10">
        <div>
          <span class="font-mono text-[10px] uppercase tracking-widest text-bordeaux block">VISUAL MONOGRAPH PLATE</span>
          <h3 class="font-serif text-xl text-ink">${escapeHtml(vis.title)}</h3>
        </div>
        <div class="flex items-center space-x-2.5">
          <button onclick="switchLensTab('code')"
                  class="px-3 py-1.5 bg-parchment hover:bg-parchmentDark border border-ink/15 font-mono text-xs text-ink cursor-pointer">
            ${isVi() ? 'Xem Code / Notebook →' : 'Inspect Code / Notebook →'}
          </button>
          <button onclick="openLightbox()"
                  class="px-3.5 py-1.5 bg-ink hover:bg-bordeaux text-alabaster font-mono text-xs transition-colors cursor-pointer">
            ⛶ ${isVi() ? 'Phóng To Toàn Màn Hình' : 'Fullscreen Lightbox'}
          </button>
        </div>
      </div>

      <div class="relative bg-alabaster border border-ink/12 p-4 flex flex-col items-center justify-center min-h-[320px]">
        <img id="folio-real-image" src="${escapeAttr(vis.path)}" alt="${escapeAttr(vis.title)}"
             class="max-h-[480px] w-auto object-contain hidden rounded-none bg-white p-1"
             onload="this.classList.remove('hidden'); document.getElementById('folio-canvas-fallback').classList.add('hidden');"
             onerror="this.classList.add('hidden'); document.getElementById('folio-canvas-fallback').classList.remove('hidden');" />

        <div id="folio-canvas-fallback" class="w-full">
          <canvas id="monograph-plate-canvas" height="270" class="w-full block"></canvas>
        </div>
      </div>

      <div class="mt-4 pt-4 border-t border-ink/10 flex flex-wrap items-center justify-between gap-4">
        <p class="font-sans text-xs text-charcoal italic">${escapeHtml(vis.caption)}</p>
      </div>
    </div>
  `;

  requestAnimationFrame(() => drawArchitecturalCanvasPlate("monograph-plate-canvas", vis.chartType, folio));
}

// ----------------------------------------------------------------------------
// TAB 02: EXECUTIVE BRIEF STAGE
// ----------------------------------------------------------------------------
function renderExecutiveBriefStage(stage, folio) {
  const b = folio.brief || {};
  stage.innerHTML = `
    <div class="max-w-4xl space-y-6">
      <div class="border-b border-ink/12 pb-4">
        <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-bordeaux block mb-1">${escapeHtml(folio.code)} · EXECUTIVE SYNOPSIS</span>
        <h2 class="font-serif text-2xl sm:text-3xl text-ink">${escapeHtml(folio.title)}</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div class="p-5 bg-parchment border border-ink/12 flex flex-col justify-between">
          <div>
            <span class="font-mono text-[10px] uppercase tracking-widest text-stone block mb-2">01 · BUSINESS CONTEXT</span>
            <p class="font-sans text-sm text-charcoal leading-relaxed">${escapeHtml(b.problem || "")}</p>
          </div>
          <div class="mt-4 pt-3 border-t border-ink/10 font-mono text-[11px] text-bordeaux">Diagnostic Scope</div>
        </div>

        <div class="p-5 bg-parchment border border-ink/12 flex flex-col justify-between">
          <div>
            <span class="font-mono text-[10px] uppercase tracking-widest text-stone block mb-2">02 · DATA ARCHITECTURE</span>
            <p class="font-sans text-sm text-charcoal leading-relaxed">${escapeHtml(b.architecture || "")}</p>
          </div>
          <div class="mt-4 pt-3 border-t border-ink/10 font-mono text-[11px] text-ink">Engineering &amp; Modeling</div>
        </div>

        <div class="p-5 bg-parchment border border-ink/12 flex flex-col justify-between">
          <div>
            <span class="font-mono text-[10px] uppercase tracking-widest text-stone block mb-2">03 · QUANTIFIED IMPACT</span>
            <p class="font-sans text-sm text-charcoal leading-relaxed">${escapeHtml(b.impact || "")}</p>
          </div>
          <div class="mt-4 pt-3 border-t border-ink/10 font-mono text-[11px] text-forest font-semibold">${escapeHtml(folio.headlineMetric)}</div>
        </div>
      </div>

      <div class="p-5 bg-alabaster border border-ink/12 flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-2">
          <span class="font-mono text-xs text-stone mr-2">VERIFIED STACK:</span>
          ${(folio.stack || []).map(s => `
            <span class="px-2.5 py-1 bg-parchment border border-ink/12 font-mono text-xs text-ink">${escapeHtml(s)}</span>
          `).join("")}
        </div>
        <div class="flex space-x-3">
          <button onclick="switchLensTab('code')" class="px-3.5 py-1.5 bg-ink text-alabaster hover:bg-bordeaux font-mono text-xs cursor-pointer">
            ${isVi() ? 'Mở Code & Notebook →' : 'Inspect Code & Notebooks →'}
          </button>
          <button onclick="switchLensTab('readme')" class="px-3.5 py-1.5 bg-parchment border border-ink/15 hover:bg-parchmentDark font-mono text-xs text-ink cursor-pointer">
            ${isVi() ? 'Đọc Full README.md' : 'Read Full README.md'}
          </button>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------------------------------
// TAB 03: SOURCE CODE & JUPYTER NOTEBOOKS (.SQL, .PY, .IPYNB, .DAX)
// ----------------------------------------------------------------------------
async function renderCodeOrNotebookStage(stage, folio) {
  const codeFiles = folio.files.filter(f => CODE_FILE_TYPES.includes(f.type));
  const activeFile = codeFiles.find(f => f.path === state.activeFilePath) || codeFiles[0];

  if (!activeFile) {
    stage.innerHTML = `<div class="p-4 bg-parchment border border-ink/12 font-mono text-xs text-stone">No SQL, Python, Jupyter Notebook (.ipynb), or DAX files found in this folder.</div>`;
    return;
  }
  state.activeFilePath = activeFile.path;

  const switcherHtml = `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-ink/10">
      <div class="flex flex-wrap gap-2">
        ${codeFiles.map(cf => `
          <button onclick="openFileFromTree('${folio.id}', '${escapeAttr(cf.path)}')"
                  class="px-3 py-1.5 font-mono text-xs border transition-colors cursor-pointer ${cf.path === activeFile.path ? 'bg-ink text-alabaster border-ink' : 'bg-parchment text-ink border-ink/15 hover:bg-parchmentDark'}">
            ${escapeHtml(cf.name)}
          </button>
        `).join("")}
      </div>
      <span class="font-mono text-xs text-stone italic">${escapeHtml(activeFile.summary || "")}</span>
    </div>
  `;

  const rawText = await loadFileContent(activeFile);

  if (activeFile.type === "ipynb") {
    stage.innerHTML = switcherHtml + renderJupyterNotebookHtml(rawText, activeFile);
    return;
  }

  const lines = rawText.split("\n");
  const codeRowsHtml = lines.map((line, idx) => `
    <tr class="code-row">
      <td class="code-line-num">${idx + 1}</td>
      <td class="code-line-text">${highlightSyntax(line)}</td>
    </tr>
  `).join("");

  stage.innerHTML = `
    ${switcherHtml}
    <div class="border border-ink/15 bg-alabaster overflow-x-auto">
      <table class="code-table">
        <tbody>${codeRowsHtml}</tbody>
      </table>
    </div>
  `;
}

function renderJupyterNotebookHtml(rawContent, fileObj) {
  let parsed = null;
  try {
    parsed = JSON.parse(rawContent);
  } catch (e) {
    return `<div class="p-4 border border-ink/15 bg-parchment font-mono text-xs text-bordeaux">Unable to parse .ipynb JSON structure.</div>`;
  }

  const rawCells = parsed.notebook_cells || parsed.cells || [];
  if (rawCells.length === 0) {
    return `<div class="p-4 border border-ink/15 bg-parchment font-mono text-xs text-stone">This notebook contains no cells.</div>`;
  }

  const cellsHtml = rawCells.map((cell, idx) => {
    const ctype = cell.cell_type || "code";
    const source = Array.isArray(cell.source) ? cell.source.join("") : String(cell.source || "");

    if (ctype === "markdown") {
      return `
        <div class="ipynb-cell-md p-5 bg-parchment/40 border-l-2 border-bordeaux mb-4">
          <div class="monograph-prose max-w-none">
            ${parseMarkdownToHtml(source)}
          </div>
        </div>
      `;
    }

    const execNum = cell.execution_count || idx + 1;
    const codeLines = source.split("\n").map((l, i) => `
      <tr class="code-row">
        <td class="code-line-num">${i + 1}</td>
        <td class="code-line-text">${highlightSyntax(l)}</td>
      </tr>
    `).join("");

    let outputsHtml = "";
    const outs = cell.outputs || [];
    outs.forEach(out => {
      if (out.type === "text" && out.data) {
        outputsHtml += `<pre class="p-3 bg-parchment/70 border-t border-ink/10 font-mono text-[11.5px] text-charcoal overflow-x-auto">${escapeHtml(out.data)}</pre>`;
      } else if (out.type === "image" && out.data) {
        outputsHtml += `
          <div class="p-4 bg-white border-t border-ink/10 flex justify-center">
            <img src="data:image/png;base64,${out.data}" alt="Notebook Output Plot" class="max-h-[400px] w-auto object-contain" />
          </div>
        `;
      }
    });

    return `
      <div class="ipynb-cell-code border border-ink/15 bg-alabaster mb-5">
        <div class="px-3.5 py-1.5 bg-parchment border-b border-ink/10 flex items-center justify-between font-mono text-[11px]">
          <span class="text-bordeaux font-semibold">In [${execNum}]:</span>
          <span class="text-stone">Python 3 Kernel · Executed Cell</span>
        </div>
        <div class="overflow-x-auto">
          <table class="code-table">
            <tbody>${codeLines}</tbody>
          </table>
        </div>
        ${outputsHtml}
      </div>
    `;
  }).join("");

  return `
    <div class="mb-4 px-4 py-2.5 bg-parchment border border-ink/12 flex items-center justify-between font-mono text-xs">
      <span><strong>JUPYTER NOTEBOOK RENDERER</strong> · ${rawCells.length} Cells Indexed</span>
      <span class="text-stone">${escapeHtml(fileObj.size || "")}</span>
    </div>
    <div class="space-y-4">${cellsHtml}</div>
  `;
}

// ----------------------------------------------------------------------------
// TAB 04: DATA SAMPLE STAGE (.CSV — 10 ROWS INSTANT PREVIEW)
// ----------------------------------------------------------------------------
async function renderDataCsvStage(stage, folio) {
  const csvFiles = folio.files.filter(f => f.type === "csv");
  const activeFile = csvFiles.find(f => f.path === state.activeFilePath) || csvFiles[0];

  if (!activeFile) {
    stage.innerHTML = `<div class="font-mono text-xs text-stone">No CSV datasets found in this folio.</div>`;
    return;
  }
  state.activeFilePath = activeFile.path;

  const rawCsv = await loadFileContent(activeFile, { maxLines: 11 });
  const lines = rawCsv.trim().split(/\r?\n/).filter(Boolean).slice(0, 11);
  const headers = lines.length > 0 ? parseCsvLine(lines[0]) : [];
  const bodyRows = lines.slice(1, 11).map(parseCsvLine);

  const switcherHtml = csvFiles.length > 1 ? `
    <div class="flex flex-wrap gap-2 mb-4 pb-3 border-b border-ink/10">
      ${csvFiles.map(cf => `
        <button onclick="openFileFromTree('${folio.id}', '${escapeAttr(cf.path)}')"
                class="px-3 py-1.5 font-mono text-xs border transition-colors cursor-pointer ${cf.path === activeFile.path ? 'bg-ink text-alabaster border-ink' : 'bg-parchment text-ink border-ink/15 hover:bg-parchmentDark'}">
          ${escapeHtml(cf.name)} <span class="opacity-60 ml-1">(${escapeHtml(cf.size || "")})</span>
        </button>
      `).join("")}
    </div>
  ` : "";

  stage.innerHTML = `
    ${switcherHtml}

    <div class="flex flex-wrap items-center justify-between gap-3 mb-4 px-4 py-3 bg-parchment border border-ink/12">
      <div>
        <span class="font-mono text-[10px] uppercase tracking-widest text-bordeaux block">ARCHIVAL DATA SLICE (10-ROW INSTANT PREVIEW)</span>
        <h3 class="font-serif text-lg text-ink">${escapeHtml(activeFile.name)}</h3>
      </div>
      <div class="flex items-center space-x-3">
        <span class="font-mono text-xs text-stone tabular-nums">Showing first ${bodyRows.length} rows of ${escapeHtml(activeFile.size || "dataset")}</span>
        <a href="${window.DAPORT_MANIFEST.githubBaseUrl}${escapeAttr(activeFile.path)}" target="_blank" rel="noopener"
           class="px-3 py-1 bg-ink text-alabaster hover:bg-bordeaux font-mono text-xs transition-colors">
          Full Dataset on GitHub ↗
        </a>
      </div>
    </div>

    <div class="border border-ink/15 overflow-x-auto bg-alabaster">
      <table class="w-full text-left border-collapse font-mono text-xs tabular-nums">
        <thead>
          <tr class="bg-parchment border-b border-ink/15 text-ink">
            <th class="py-2.5 px-3 font-mono text-[10px] text-stone border-r border-ink/10 w-10 text-center">#</th>
            ${headers.map(h => `<th class="py-2.5 px-3.5 font-semibold uppercase tracking-wider text-[11px] whitespace-nowrap">${escapeHtml(h)}</th>`).join("")}
          </tr>
        </thead>
        <tbody class="divide-y divide-ink/10">
          ${bodyRows.map((r, rIdx) => `
            <tr class="hover:bg-parchment/60 transition-colors">
              <td class="py-2 px-3 font-mono text-[10px] text-stone border-r border-ink/10 text-center bg-parchment/30">${rIdx + 1}</td>
              ${headers.map((_, cIdx) => `<td class="py-2 px-3.5 text-charcoal whitespace-nowrap max-w-[260px] truncate" title="${escapeAttr(r[cIdx] ?? "")}">${escapeHtml(r[cIdx] ?? "")}</td>`).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function parseCsvLine(line) {
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

// ----------------------------------------------------------------------------
// TAB 05: FULL README.MD STAGE
// ----------------------------------------------------------------------------
async function renderReadmeStage(stage, folio) {
  const readmeFile = folio.files.find(f => f.type === "md") || folio.files[0];
  if (!readmeFile) return;

  state.activeFilePath = readmeFile.path;
  const rawMd = await loadFileContent(readmeFile);

  stage.innerHTML = `
    <article class="max-w-4xl monograph-prose">
      ${parseMarkdownToHtml(rawMd)}
    </article>
  `;
}

// ============================================================================
// 5. ZERO-HANG FILE CONTENT LOADER
// ============================================================================
async function loadFileContent(fileObj, options = {}) {
  if (fileObj.content && fileObj.content.trim().length > 0) {
    if (options.maxLines) {
      return fileObj.content.split(/\r?\n/).slice(0, options.maxLines).join("\n");
    }
    return fileObj.content;
  }

  if (fileObj.path) {
    try {
      const response = await fetch(fileObj.path);
      if (response.ok) {
        const text = await response.text();
        if (options.maxLines) {
          return text.split(/\r?\n/).slice(0, options.maxLines).join("\n");
        }
        fileObj.content = text;
        return text;
      }
    } catch (e) {
      // Fallback
    }
  }
  return "-- File content not available.";
}

// ============================================================================
// 6. FULL EDITORIAL MARKDOWN PARSER
// ============================================================================
function parseMarkdownToHtml(md) {
  if (!md) return "";
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  let html = "";
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const lang = trimmed.slice(3).trim();
      const blockLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        blockLines.push(lines[i]);
        i++;
      }
      i++;
      html += `
        <pre class="monograph-pre">${lang ? `<div class="monograph-pre-lang">${escapeHtml(lang)}</div>` : ""}<code>${escapeHtml(blockLines.join("\n"))}</code></pre>
      `;
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      html += `<hr class="monograph-hr" />`;
      i++;
      continue;
    }

    if (trimmed.startsWith("|") && trimmed.endsWith("|") && i + 1 < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      const headerCells = splitMarkdownTableRow(trimmed);
      i += 2;
      const bodyRows = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        bodyRows.push(splitMarkdownTableRow(lines[i].trim()));
        i++;
      }
      html += `
        <div class="overflow-x-auto my-5 border border-ink/15">
          <table class="monograph-table">
            <thead>
              <tr>${headerCells.map(c => `<th>${formatInlineMd(c)}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${bodyRows.map(row => `<tr>${row.map(c => `<td>${formatInlineMd(c)}</td>`).join("")}</tr>`).join("")}
            </tbody>
          </table>
        </div>
      `;
      continue;
    }

    if (/^!\[[^\]]*\]\([^)]+\)$/.test(trimmed)) {
      const badges = [];
      while (i < lines.length && /^!\[[^\]]*\]\([^)]+\)$/.test(lines[i].trim())) {
        const m = lines[i].trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
        if (m) badges.push({ alt: m[1], url: m[2] });
        i++;
        while (i < lines.length && !lines[i].trim()) i++;
      }
      const isShields = badges.some(b => b.url.includes("shields.io") || b.url.includes("badge"));
      if (isShields) {
        html += `<div class="flex flex-wrap items-center gap-2 my-4">${badges.map(b => `<img src="${escapeAttr(b.url)}" alt="${escapeAttr(b.alt)}" class="h-6 w-auto inline-block" />`).join("")}</div>`;
      } else {
        html += badges.map(b => `
          <figure class="my-5 border border-ink/12 bg-parchment/40 p-3">
            <img src="${escapeAttr(b.url)}" alt="${escapeAttr(b.alt)}" class="max-h-[440px] w-auto mx-auto object-contain" />
            ${b.alt ? `<figcaption class="text-center font-mono text-[11px] text-stone mt-2">${escapeHtml(b.alt)}</figcaption>` : ""}
          </figure>
        `).join("");
      }
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = formatInlineMd(headingMatch[2]);
      html += `<h${level}>${content}</h${level}>`;
      i++;
      continue;
    }

    if (trimmed.startsWith(">")) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      html += `<blockquote>${formatInlineMd(quoteLines.join(" "))}</blockquote>`;
      continue;
    }

    if (/^([-*]|\d+\.)\s+/.test(trimmed)) {
      const isOrdered = /^\d+\.\s+/.test(trimmed);
      const tag = isOrdered ? "ol" : "ul";
      const listClass = isOrdered ? "list-decimal" : "list-disc";
      const items = [];
      while (i < lines.length && /^([-*]|\d+\.)\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^([-*]|\d+\.)\s+/, ""));
        i++;
      }
      html += `<${tag} class="${listClass}">${items.map(it => `<li>${formatInlineMd(it)}</li>`).join("")}</${tag}>`;
      continue;
    }

    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("#") &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].trim().startsWith(">") &&
      !lines[i].trim().startsWith("|") &&
      !/^([-*]|\d+\.)\s+/.test(lines[i].trim()) &&
      !/^(-{3,}|\*{3,}|_{3,})$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }
    html += `<p>${formatInlineMd(paraLines.join(" "))}</p>`;
  }

  return html;
}

function splitMarkdownTableRow(rowStr) {
  return rowStr
    .replace(/^\||\|$/g, "")
    .split("|")
    .map(c => c.trim());
}

function formatInlineMd(text) {
  let out = escapeHtml(text);

  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="inline-block h-5 align-middle mx-1" />');

  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, url) => {
    const folioMatch = url.match(/(\d{2})-[A-Za-z0-9_-]+/);
    if (folioMatch) {
      const targetId = folioMatch[1];
      return `<a href="#folio-${targetId}" onclick="selectFolio('${targetId}'); return false;" class="text-bordeaux font-medium underline underline-offset-4 hover:text-ink cursor-pointer">${label} ↗</a>`;
    }
    return `<a href="${url}" target="_blank" rel="noopener" class="text-bordeaux font-medium underline underline-offset-4 hover:text-ink">${label} ↗</a>`;
  });

  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-ink">$1</strong>');
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');

  return out;
}

// ============================================================================
// 7. ARCHITECTURAL CANVAS FALLBACK & LIGHTBOX (Theme-Aware)
// ============================================================================
function drawArchitecturalCanvasPlate(canvasId, chartType, folio) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !folio) return;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || 760;
  const height = canvas.height || 270;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const bgCanvas = isDark ? "#121110" : "#FAF8F5";
  const bgCard = isDark ? "#1B1917" : "#F4EFE6";
  const textInk = isDark ? "#EAE5DC" : "#191816";
  const textStone = isDark ? "#8E877C" : "#736F68";
  const accentBordeaux = isDark ? "#D47A82" : "#722F37";
  const accentForest = isDark ? "#68A37E" : "#2C4C38";
  const gridStroke = isDark ? "rgba(234, 229, 220, 0.06)" : "rgba(25, 24, 22, 0.06)";

  ctx.fillStyle = bgCanvas;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = gridStroke;
  ctx.lineWidth = 1;
  for (let x = 40; x < width; x += 48) {
    ctx.beginPath(); ctx.moveTo(x, 20); ctx.lineTo(x, height - 30); ctx.stroke();
  }
  for (let y = 25; y < height - 25; y += 40) {
    ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(width - 30, y); ctx.stroke();
  }

  const boxes = [
    { x: 45, y: 75, w: 185, h: 110, tag: "01. INGESTION & PYTHON", title: folio.code, sub: `${folio.files?.length || 0} Reproducible Files`, color: textInk },
    { x: width / 2 - 95, y: 65, w: 195, h: 130, tag: "02. CORE ARCHITECTURE", title: folio.headlineMetric, sub: folio.folder.slice(0, 28), color: accentBordeaux },
    { x: width - 230, y: 75, w: 185, h: 110, tag: "03. DECISION OUTPUT", title: "Verified Artifacts", sub: "Inspect Code & README Tabs", color: accentForest }
  ];

  ctx.strokeStyle = accentBordeaux;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(230, 130);
  ctx.lineTo(width / 2 - 95, 130);
  ctx.moveTo(width / 2 + 100, 130);
  ctx.lineTo(width - 230, 130);
  ctx.stroke();
  ctx.setLineDash([]);

  boxes.forEach(b => {
    ctx.fillStyle = bgCard;
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.strokeStyle = b.color;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(b.x, b.y, b.w, b.h);

    ctx.fillStyle = b.color;
    ctx.font = "600 9.5px 'JetBrains Mono', monospace";
    ctx.fillText(b.tag, b.x + 12, b.y + 26);

    ctx.fillStyle = textInk;
    ctx.font = "600 13.5px 'Newsreader', serif";
    ctx.fillText(String(b.title).slice(0, 24), b.x + 12, b.y + 58);

    ctx.fillStyle = textStone;
    ctx.font = "400 10px 'JetBrains Mono', monospace";
    ctx.fillText(String(b.sub).slice(0, 28), b.x + 12, b.y + 84);
  });
}

function openLightbox() {
  const modal = document.getElementById("lightbox-modal");
  const title = document.getElementById("lightbox-title");
  const tag = document.getElementById("lightbox-folio-tag");
  const body = document.getElementById("lightbox-body");

  const folio = getActiveFolio();
  const vis = folio.visuals?.[state.activeVisualIndex] || folio.visuals?.[0] || { title: folio.title, path: "", chartType: "warehouse" };

  tag.textContent = `${folio.code} · FULLSCREEN PLATE INSPECTION`;
  title.textContent = vis.title;

  body.innerHTML = `
    <div class="w-full max-w-5xl bg-alabaster border border-ink/15 p-6 flex flex-col items-center">
      <img src="${escapeAttr(vis.path)}" alt="${escapeAttr(vis.title)}"
           class="max-h-[72vh] w-auto object-contain hidden bg-white p-1"
           onload="this.classList.remove('hidden'); document.getElementById('lightbox-canvas-wrap').classList.add('hidden');"
           onerror="this.classList.add('hidden'); document.getElementById('lightbox-canvas-wrap').classList.remove('hidden');" />
      <div id="lightbox-canvas-wrap" class="w-full">
        <canvas id="lightbox-canvas" height="360" class="w-full block"></canvas>
      </div>
      <p class="mt-4 pt-3 border-t border-ink/10 font-sans text-xs text-charcoal italic w-full text-center">${escapeHtml(vis.caption || "")}</p>
    </div>
  `;

  modal.classList.remove("hidden");
  requestAnimationFrame(() => drawArchitecturalCanvasPlate("lightbox-canvas", vis.chartType, folio));
}

function closeLightbox() {
  document.getElementById("lightbox-modal")?.classList.add("hidden");
}

// ============================================================================
// 8. UTILITIES & SYNTAX HIGHLIGHTER
// ============================================================================
async function copyCurrentArtifact() {
  const folio = getActiveFolio();
  const file = folio.files.find(f => f.path === state.activeFilePath) || folio.files[0];
  if (!file) return;

  const content = await loadFileContent(file);
  navigator.clipboard.writeText(content);

  const btn = document.getElementById("copy-artifact-btn");
  const oldText = btn.textContent;
  btn.textContent = "✓ Copied";
  setTimeout(() => { btn.textContent = oldText; }, 1400);
}

function highlightSyntax(line) {
  const escaped = escapeHtml(line);
  if (escaped.trim().startsWith("--") || escaped.trim().startsWith("#") || escaped.trim().startsWith("//")) {
    return `<span class="tok-com">${escaped}</span>`;
  }
  return escaped
    .replace(/\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|WITH|AS|JOIN|INNER|LEFT|ON|CREATE|TABLE|VIEW|OR|REPLACE|INDEX|PRIMARY|KEY|FOREIGN|REFERENCES|CONSTRAINT|ENGINE|DEFAULT|CASE|WHEN|THEN|ELSE|END|OVER|PARTITION BY|DESC|ASC|LIMIT|AND|IN|NOT|NULL|DISTINCT|import|from|def|return|for|in|if|elif|else|try|except|with|as|lambda|print|VAR|RETURN|CALCULATE|DIVIDE|SUM|FILTER|ALL)\b/g, '<span class="tok-kw">$1</span>')
    .replace(/\b(COUNT|AVG|ROUND|MAX|MIN|NTILE|PERCENT_RANK|DENSE_RANK|DATEDIFF|CONCAT|NULLIF|DISTINCTCOUNT|COUNTROWS|DataFrame|read_csv|to_csv|to_sql|groupby|agg|merge|concat)\b/g, '<span class="tok-fn">$1</span>')
    .replace(/('[^']*'|&quot;[^&]*&quot;)/g, '<span class="tok-str">$1</span>')
    .replace(/\b(\d+(\.\d+)?)\b/g, '<span class="tok-num">$1</span>');
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(str) {
  return String(str || "").replace(/'/g, "\\'").replace(/"/g, "&quot;");
}