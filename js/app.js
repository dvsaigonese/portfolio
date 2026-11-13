/* ==========================================================================
   DAPORT BENTO GRID APPLICATION CONTROLLER (v7.3 — Auto Asset Resolver Edition)
   - Tab 01: Full README.md (With Auto-Resolved Local Images & Assets)
   - Tab 02: Visuals & Dashboards
   - Tab 03: Code & Notebooks (.SQL / .PY / .IPYNB / .DAX)
   - Tab 04: Data Sample (.CSV 10 Rows)
   ========================================================================== */

let state = {
  activeFolioId: "04",
  activeLensTab: "readme",
  activeFilePath: null,
  activeVisualIndex: 0,
  treeScopeMode: "scoped",
  searchQuery: "",
  tagFilter: "ALL",
  directoryCollapsed: false,
  mobileTreeOpen: true
};

const CODE_FILE_TYPES = ["sql", "py", "ipynb", "dax"];

function isVi() {
  return window.DAPORT_PREFS && window.DAPORT_PREFS.getLang() === "vi";
}

document.addEventListener("DOMContentLoaded", () => {
  const folios = window.DAPORT_MANIFEST?.folios || [];

  hydrateNotebookVisuals(folios);

  if (folios.length > 0) {
    const defaultFolio = folios.find(f => f.id === state.activeFolioId) || folios[folios.length - 1];
    state.activeFolioId = defaultFolio.id;
    const readme = defaultFolio.files.find(f => f.type === "md");
    state.activeFilePath = readme ? readme.path : (defaultFolio.files[0]?.path || null);
  }

  renderAll();

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
});

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
                    title: currentSectionTitle || `EDA Plot ${extractedPlates.length + 1}`,
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
          // Ignore malformed JSON
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
  renderSidebarProjectSelect();
  renderFileTree();
  renderViewerHeader();
  renderActiveLensStage();
}

function updateMastheadCounters() {
  const folios = window.DAPORT_MANIFEST?.folios || [];
  const totalFiles = folios.reduce((acc, f) => acc + (f.files?.length || 0) + (f.visuals?.length || 0), 0);

  const filesCounter = document.getElementById("total-files-counter");
  if (filesCounter) {
    filesCounter.textContent = `${totalFiles} Artifacts`;
  }
}

// ============================================================================
// 1. AIRY 4-COLUMN BENTO PROJECT SELECTOR
// ============================================================================
function filterFoliosByTag(tag) {
  state.tagFilter = tag;
  state.directoryCollapsed = false;
  renderFolioSelectorStrip();
}

function toggleDirectoryCollapse() {
  state.directoryCollapsed = !state.directoryCollapsed;
  renderFolioSelectorStrip();
}

function renderFolioSelectorStrip() {
  const container = document.getElementById("folio-selector-grid");
  if (!container) return;
  const folios = window.DAPORT_MANIFEST?.folios || [];

  ["ALL", "SQL", "BI", "PY", "E2E"].forEach(tag => {
    const btn = document.getElementById(`filter-tag-${tag}`);
    if (!btn) return;
    if (tag === state.tagFilter) {
      btn.style.backgroundColor = "var(--text-main)";
      btn.style.color = "var(--bg-canvas)";
    } else {
      btn.style.backgroundColor = "transparent";
      btn.style.color = "var(--text-main)";
    }
  });

  const collapseBtn = document.getElementById("dir-collapse-btn");
  if (collapseBtn) {
    collapseBtn.textContent = state.directoryCollapsed
      ? (isVi() ? "[ + Mở rộng Danh mục Dự án ]" : "[ + Expand Project Catalog ]")
      : (isVi() ? "[ — Thu gọn Danh mục ]" : "[ — Collapse Catalog ]");
  }

  if (state.directoryCollapsed) {
    const active = getActiveFolio();
    container.className = "block";
    container.innerHTML = `
      <div onclick="toggleDirectoryCollapse()" class="folio-bento-selector active-folio-card flex-row items-center">
        <div class="flex items-center space-x-3 min-w-0">
          <span class="folio-badge px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase shrink-0">${escapeHtml(active.code)}</span>
          <span class="text-sm font-extrabold truncate">${escapeHtml(active.title)}</span>
        </div>
        <span class="text-xs font-semibold shrink-0 opacity-80">${isVi() ? 'Đổi dự án ▾' : 'Switch Project ▾'}</span>
      </div>
    `;
    return;
  }

  container.className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4";

  const filtered = folios.filter(f => {
    if (state.tagFilter === "ALL") return true;
    return f.code.toUpperCase().includes(state.tagFilter) || f.folder.toUpperCase().includes(state.tagFilter);
  });

  container.innerHTML = filtered.map(folio => {
    const isActive = folio.id === state.activeFolioId;
    const fileCount = (folio.files?.length || 0) + (folio.visuals?.length || 0);

    return `
      <div onclick="selectFolio('${folio.id}')"
           class="folio-bento-selector ${isActive ? 'active-folio-card' : ''}">
        <div>
          <div class="flex items-center justify-between gap-2 mb-3">
            <span class="folio-badge px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bento-card-subtle">
              ${escapeHtml(folio.code)}
            </span>
            <span class="folio-meta text-[11px] font-bold text-sub">${fileCount} files ↗</span>
          </div>
          <h3 class="text-sm sm:text-[15px] font-extrabold leading-snug line-clamp-2 mb-3" title="${escapeAttr(folio.title)}">
            ${escapeHtml(folio.title)}
          </h3>
        </div>

        <div class="pt-2.5 border-t border-neutral-200/25 flex items-center justify-between text-[11px]">
          <span class="folio-meta font-semibold text-sub uppercase tracking-wider">BENCHMARK</span>
          <span class="font-extrabold tabular-nums truncate max-w-[140px]">${escapeHtml(folio.headlineMetric)}</span>
        </div>
      </div>
    `;
  }).join("");
}

function renderSidebarProjectSelect() {
  const selectEl = document.getElementById("sidebar-project-select");
  if (!selectEl) return;
  const folios = window.DAPORT_MANIFEST?.folios || [];
  selectEl.innerHTML = folios.map(f => `
    <option value="${escapeAttr(f.id)}" ${f.id === state.activeFolioId ? "selected" : ""}>
      ${escapeHtml(f.code)} — ${escapeHtml(f.title.slice(0, 36))}
    </option>
  `).join("");
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
// 2. STICKY LEFT COLUMN: REPOSITORY FILE TREE & MOBILE DRAWER
// ============================================================================
function toggleTreeScope() {
  state.treeScopeMode = state.treeScopeMode === "scoped" ? "all" : "scoped";
  const btn = document.getElementById("tree-scope-btn");
  if (btn) {
    btn.textContent = state.treeScopeMode === "scoped" ? "[ 1 Folder ]" : "[ All Folders ]";
  }
  renderFileTree();
}

function toggleMobileFileTree() {
  const wrap = document.getElementById("mobile-collapsible-tree");
  if (!wrap) return;
  state.mobileTreeOpen = !state.mobileTreeOpen;
  if (state.mobileTreeOpen) {
    wrap.classList.remove("hidden");
  } else {
    wrap.classList.add("hidden");
  }
}

function handleFileSearch(query) {
  state.searchQuery = query.trim().toLowerCase();
  renderFileTree();
}

function renderFileTree() {
  const container = document.getElementById("file-tree-container");
  if (!container) return;
  const activeFolio = getActiveFolio();

  const foliosToRender = state.treeScopeMode === "scoped"
    ? [activeFolio]
    : (window.DAPORT_MANIFEST?.folios || []);

  let html = "";

  foliosToRender.forEach(folio => {
    if (!folio) return;
    const isCurrentFolio = folio.id === state.activeFolioId;

    html += `
      <div class="mb-2.5">
        <div onclick="selectFolio('${folio.id}')"
             class="flex items-center justify-between px-3 py-1.5 text-xs font-bold rounded-xl cursor-pointer ${isCurrentFolio ? 'bento-card-subtle text-main' : 'text-sub hover:bento-card-subtle'}">
          <div class="flex items-center space-x-2 truncate">
            <span class="font-bold" style="color: var(--accent-highlight);">▾</span>
            <span class="truncate" title="${escapeAttr(folio.folder)}">${escapeHtml(folio.folder)}</span>
          </div>
        </div>
        <div class="pl-3 mt-1 space-y-1 border-l-2 border-neutral-200 dark:border-neutral-800 ml-2.5">
    `;

    // 1. Hiển thị README.md trên cùng của cây thư mục
    const readmeFiles = (folio.files || []).filter(f => f.type === "md");
    readmeFiles.forEach(file => {
      if (state.searchQuery && !file.name.toLowerCase().includes(state.searchQuery)) return;
      const isSelected = isCurrentFolio && state.activeLensTab === "readme" && state.activeFilePath === file.path;

      html += `
        <div onclick="openFileFromTree('${folio.id}', '${escapeAttr(file.path)}')"
             class="flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${isSelected ? 'bento-card-dark' : 'text-sub hover:bento-card-subtle'}">
          <span class="truncate" title="${escapeAttr(file.name)}">${escapeHtml(file.name)}</span>
          <span class="text-[9px] uppercase font-bold tracking-wider opacity-75 ml-2">README</span>
        </div>
      `;
    });

    // 2. Hiển thị các Visual Plates
    (folio.visuals || []).forEach((vis, idx) => {
      const fileName = vis.path.startsWith("data:image")
        ? `eda_plot_0${idx + 1}.png`
        : (vis.path.split("/").slice(1).join("/") || `assets/plate_0${idx + 1}.png`);
      if (state.searchQuery && !fileName.toLowerCase().includes(state.searchQuery)) return;
      const isSelected = state.activeLensTab === "visuals" && isCurrentFolio && state.activeVisualIndex === idx;

      html += `
        <div onclick="openVisualFromTree('${folio.id}', ${idx})"
             class="flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${isSelected ? 'bento-card-dark' : 'text-sub hover:bento-card-subtle'}">
          <span class="truncate" title="${escapeAttr(vis.title)}">${escapeHtml(fileName)}</span>
          <span class="text-[9px] uppercase tracking-wider font-bold opacity-75 ml-2">VISUAL</span>
        </div>
      `;
    });

    // 3. Hiển thị các file Code (.sql, .py, .ipynb, .dax) và Data (.csv)
    const otherFiles = (folio.files || []).filter(f => f.type !== "md");
    otherFiles.forEach(file => {
      if (state.searchQuery && !file.name.toLowerCase().includes(state.searchQuery) && !file.type.toLowerCase().includes(state.searchQuery)) return;
      const isSelected = isCurrentFolio && state.activeFilePath === file.path && ["code", "data"].includes(state.activeLensTab);
      const badgeLabel = file.type === "ipynb" ? "IPYNB" : file.type.toUpperCase();

      html += `
        <div onclick="openFileFromTree('${folio.id}', '${escapeAttr(file.path)}')"
             class="flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${isSelected ? 'bento-card-dark' : 'text-sub hover:bento-card-subtle'}">
          <span class="truncate" title="${escapeAttr(file.name)}">${escapeHtml(file.name)}</span>
          <span class="text-[9px] uppercase font-bold tracking-wider opacity-75 ml-2">${escapeHtml(badgeLabel)}</span>
        </div>
      `;
    });

    html += `</div></div>`;
  });

  container.innerHTML = html || `<div class="p-3 text-xs text-sub">No matching files found.</div>`;
}

function scrollToViewerOnMobile() {
  if (window.innerWidth < 1024) {
    const viewer = document.getElementById("viewer-main-card");
    if (viewer) {
      viewer.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
}

function openVisualFromTree(folioId, visualIdx = 0) {
  state.activeFolioId = folioId;
  state.activeVisualIndex = visualIdx;
  state.activeLensTab = "visuals";
  renderAll();
  scrollToViewerOnMobile();
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
  scrollToViewerOnMobile();
}

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

  ["readme", "visuals", "code", "data"].forEach(t => {
    const btn = document.getElementById(`tab-btn-${t}`);
    if (!btn) return;
    if (t === state.activeLensTab) {
      btn.style.backgroundColor = "var(--text-main)";
      btn.style.color = "var(--bg-canvas)";
      btn.style.borderColor = "var(--text-main)";
    } else {
      btn.style.backgroundColor = "transparent";
      btn.style.color = "var(--text-main)";
      btn.style.borderColor = "var(--border-medium)";
    }
  });

  const activeFile = folio.files.find(f => f.path === state.activeFilePath) || folio.files[0];

  if (state.activeLensTab === "visuals") {
    const vis = folio.visuals?.[state.activeVisualIndex] || folio.visuals?.[0];
    const displayPath = vis && !vis.path.startsWith("data:image") ? vis.path : `${folio.folder}/visual_plate_${state.activeVisualIndex + 1}`;
    breadcrumb.textContent = `DAport / ${displayPath}`;
    meta.textContent = `${folio.code} · VISUAL PLATE`;
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

  if (state.activeLensTab === "readme") {
    await renderReadmeStage(stage, folio);
  } else if (state.activeLensTab === "visuals") {
    renderVisualsStage(stage, folio);
  } else if (state.activeLensTab === "code") {
    await renderCodeOrNotebookStage(stage, folio);
  } else if (state.activeLensTab === "data") {
    await renderDataCsvStage(stage, folio);
  }
}

// ============================================================================
// HÀM TỰ ĐỘNG CHUẨN HÓA ĐƯỜNG DẪN ẢNH VÀ ASSET TRONG README.MD
// ============================================================================
function resolveAssetUrl(url, folioOrFolder) {
  if (!url) return url;
  url = url.trim();

  // 1. Link ảnh web (http/https), data: URI hoặc // cdn: giữ nguyên tuyệt đối
  if (/^(https?:\/\/|data:|\/\/)/i.test(url)) {
    return url;
  }

  const folio = typeof folioOrFolder === "object" ? folioOrFolder : null;
  const folder = folio ? folio.folder : (typeof folioOrFolder === "string" ? folioOrFolder : "");

  // Bỏ tiền tố './' nếu có
  let cleanUrl = url.replace(/^\.\//, "");

  // Nếu đường dẫn đã chứa sẵn tên folder dự án: giữ nguyên
  if (folder && cleanUrl.startsWith(folder + "/")) {
    return cleanUrl;
  }

  // 2. Tra cứu đối chiếu với file ảnh thực tế đã scan trong folio.visuals
  if (folio && Array.isArray(folio.visuals)) {
    const filename = cleanUrl.split("/").pop().toLowerCase();
    const matchedVis = folio.visuals.find(v => {
      if (!v.path || v.path.startsWith("data:")) return false;
      return v.path.toLowerCase().endsWith("/" + filename) || v.path.toLowerCase() === filename;
    });
    if (matchedVis && matchedVis.path) {
      return matchedVis.path;
    }
  }

  // 3. Tra cứu đối chiếu với file trong folio.files
  if (folio && Array.isArray(folio.files)) {
    const filename = cleanUrl.split("/").pop().toLowerCase();
    const matchedFile = folio.files.find(f => {
      if (!f.path) return false;
      return f.path.toLowerCase().endsWith("/" + filename) || f.path.toLowerCase() === filename;
    });
    if (matchedFile && matchedFile.path) {
      return matchedFile.path;
    }
  }

  // 4. Mặc định: Nối tên folder dự án vào trước đường dẫn tương đối
  cleanUrl = cleanUrl.replace(/^\//, "");
  return folder ? `${folder}/${cleanUrl}` : cleanUrl;
}

// ----------------------------------------------------------------------------
// TAB 01: FULL README.MD STAGE
// ----------------------------------------------------------------------------
async function renderReadmeStage(stage, folio) {
  const readmeFile = folio.files.find(f => f.type === "md") || folio.files[0];
  if (!readmeFile) return;

  state.activeFilePath = readmeFile.path;
  const rawMd = await loadFileContent(readmeFile);

  stage.innerHTML = `
    <div class="mb-5 p-3.5 bento-card-subtle flex flex-wrap items-center justify-between gap-2 text-xs">
      <div class="flex items-center space-x-2">
        <span class="font-extrabold text-main">${escapeHtml(folio.code)}</span>
        <span class="text-sub">•</span>
        <span class="text-muted font-medium">README.md (${escapeHtml(readmeFile.size || "")})</span>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button onclick="switchLensTab('visuals')" class="btn-pill text-[11px]" style="padding: 0.22rem 0.75rem;">
          ${isVi() ? 'Xem Biểu Đồ & Dashboard →' : 'View Visuals & Dashboards →'}
        </button>
        <button onclick="switchLensTab('code')" class="btn-pill text-[11px]" style="padding: 0.22rem 0.75rem; background-color: var(--text-main); color: var(--bg-canvas);">
          ${isVi() ? 'Mở Code / Notebook →' : 'Inspect Code / Notebook →'}
        </button>
      </div>
    </div>

    <article class="max-w-4xl monograph-prose overflow-x-hidden">
      ${parseMarkdownToHtml(rawMd, folio)}
    </article>
  `;
}

// ----------------------------------------------------------------------------
// TAB 02: VISUALS & DASHBOARDS STAGE
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
    <div class="bento-card-subtle p-4 sm:p-6 space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-neutral-200 dark:border-neutral-800">
        <div class="min-w-0">
          <div class="flex items-center space-x-2">
            <span class="text-[10px] uppercase font-bold tracking-wider text-sub">${escapeHtml(folio.code)}</span>
            <span class="text-sub">•</span>
            <span class="text-[10px] uppercase font-bold tracking-wider" style="color: var(--accent-highlight);">${escapeHtml(folio.headlineMetric)}</span>
          </div>
          <h3 class="text-base sm:text-xl font-extrabold text-main truncate mt-0.5">${escapeHtml(vis.title)}</h3>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button onclick="switchLensTab('code')" class="btn-pill">
            ${isVi() ? 'Xem Code →' : 'Inspect Code →'}
          </button>
          <button onclick="openLightbox()" class="btn-pill" style="background-color: var(--text-main); color: var(--bg-canvas);">
            ⛶ ${isVi() ? 'Phóng To' : 'Fullscreen'}
          </button>
        </div>
      </div>

      ${visuals.length > 1 ? `
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-[11px] font-bold text-sub mr-1">PLATES:</span>
          ${visuals.map((v, i) => `
            <button onclick="openVisualFromTree('${folio.id}', ${i})"
                    class="btn-pill text-xs ${i === state.activeVisualIndex ? 'bento-card-dark' : ''}" style="padding: 0.25rem 0.75rem;">
              ${String(i + 1).padStart(2, '0')}. ${escapeHtml(v.title.slice(0, 26))}
            </button>
          `).join("")}
        </div>
      ` : ""}

      <div class="relative rounded-2xl p-2 sm:p-4 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[380px] border border-neutral-200 dark:border-neutral-800" style="background-color: var(--bg-card);">
        <img id="folio-real-image" src="${escapeAttr(vis.path)}" alt="${escapeAttr(vis.title)}"
             class="max-h-[520px] w-auto object-contain hidden rounded-xl"
             onload="this.classList.remove('hidden'); document.getElementById('folio-canvas-fallback').classList.add('hidden');"
             onerror="this.classList.add('hidden'); document.getElementById('folio-canvas-fallback').classList.remove('hidden');" />

        <div id="folio-canvas-fallback" class="w-full overflow-x-auto">
          <canvas id="monograph-plate-canvas" height="270" class="w-full block min-w-[520px]"></canvas>
        </div>
      </div>

      <div class="pt-1 flex flex-wrap items-center justify-between gap-2 text-xs text-muted font-medium">
        <span class="italic">${escapeHtml(vis.caption)}</span>
        <button onclick="switchLensTab('readme')" class="font-bold text-main hover:underline shrink-0">
          ${isVi() ? '← Quay lại đọc README.md' : '← Back to Full README.md'}
        </button>
      </div>
    </div>
  `;

  requestAnimationFrame(() => drawArchitecturalCanvasPlate("monograph-plate-canvas", vis.chartType, folio));
}

// ----------------------------------------------------------------------------
// TAB 03: SOURCE CODE & JUPYTER NOTEBOOKS
// ----------------------------------------------------------------------------
async function renderCodeOrNotebookStage(stage, folio) {
  const codeFiles = folio.files.filter(f => CODE_FILE_TYPES.includes(f.type));
  const activeFile = codeFiles.find(f => f.path === state.activeFilePath) || codeFiles[0];

  if (!activeFile) {
    stage.innerHTML = `<div class="p-5 bento-card-subtle text-xs text-sub">No SQL, Python, Jupyter Notebook (.ipynb), or DAX files found in this folder.</div>`;
    return;
  }
  state.activeFilePath = activeFile.path;

  const switcherHtml = `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
      <div class="flex flex-wrap gap-2">
        ${codeFiles.map(cf => `
          <button onclick="openFileFromTree('${folio.id}', '${escapeAttr(cf.path)}')"
                  class="btn-pill ${cf.path === activeFile.path ? 'bento-card-dark' : ''}">
            ${escapeHtml(cf.name)}
          </button>
        `).join("")}
      </div>
      <span class="text-xs text-sub italic font-medium">${escapeHtml(activeFile.summary || "")}</span>
    </div>
  `;

  const rawText = await loadFileContent(activeFile);

  if (activeFile.type === "ipynb") {
    stage.innerHTML = switcherHtml + renderJupyterNotebookHtml(rawText, activeFile, folio);
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
    <div class="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-x-auto shadow-sm" style="background-color: var(--bg-card);">
      <table class="code-table" style="background-color: var(--bg-card);">
        <tbody>${codeRowsHtml}</tbody>
      </table>
    </div>
  `;
}

function renderJupyterNotebookHtml(rawContent, fileObj, folio) {
  let parsed = null;
  try {
    parsed = JSON.parse(rawContent);
  } catch (e) {
    return `<div class="p-5 bento-card-subtle text-xs">Unable to parse .ipynb JSON structure.</div>`;
  }

  const rawCells = parsed.notebook_cells || parsed.cells || [];
  if (rawCells.length === 0) {
    return `<div class="p-5 bento-card-subtle text-xs text-sub">This notebook contains no cells.</div>`;
  }

  const cellsHtml = rawCells.map((cell, idx) => {
    const ctype = cell.cell_type || "code";
    const source = Array.isArray(cell.source) ? cell.source.join("") : String(cell.source || "");

    if (ctype === "markdown") {
      return `
        <div class="p-4 sm:p-6 bento-card-subtle rounded-2xl mb-4 border-l-4" style="border-left-color: var(--text-main);">
          <div class="monograph-prose">
            ${parseMarkdownToHtml(source, folio)}
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
        outputsHtml += `<pre class="p-3.5 bento-card-subtle border-t border-neutral-200 dark:border-neutral-800 font-mono text-[11.5px] text-muted overflow-x-auto" style="background-color: var(--bg-card-subtle); color: var(--text-main);">${escapeHtml(out.data)}</pre>`;
      } else if (out.type === "image" && out.data) {
        outputsHtml += `
          <div class="p-3 sm:p-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-center" style="background-color: var(--bg-card);">
            <img src="data:image/png;base64,${out.data}" alt="Notebook Output Plot" class="max-h-[420px] w-auto object-contain rounded-xl" />
          </div>
        `;
      }
    });

    return `
      <div class="bento-card overflow-hidden mb-5">
        <div class="px-4 py-2 bento-card-subtle border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs font-mono">
          <span class="font-bold text-main">In [${execNum}]:</span>
          <span class="text-sub">Python 3 Kernel</span>
        </div>
        <div class="overflow-x-auto" style="background-color: var(--bg-card);">
          <table class="code-table" style="background-color: var(--bg-card);">
            <tbody>${codeLines}</tbody>
          </table>
        </div>
        ${outputsHtml}
      </div>
    `;
  }).join("");

  return `
    <div class="mb-4 px-4 py-2.5 bento-card-subtle rounded-xl flex items-center justify-between text-xs font-semibold">
      <span>JUPYTER NOTEBOOK RENDERER · ${rawCells.length} Cells Indexed</span>
      <span class="text-sub font-mono">${escapeHtml(fileObj.size || "")}</span>
    </div>
    <div class="space-y-4">${cellsHtml}</div>
  `;
}

// ----------------------------------------------------------------------------
// TAB 04: DATA SAMPLE STAGE (.CSV 10 ROWS)
// ----------------------------------------------------------------------------
async function renderDataCsvStage(stage, folio) {
  const csvFiles = folio.files.filter(f => f.type === "csv");
  const activeFile = csvFiles.find(f => f.path === state.activeFilePath) || csvFiles[0];

  if (!activeFile) {
    stage.innerHTML = `<div class="p-5 bento-card-subtle text-xs text-sub">No CSV datasets found in this folio.</div>`;
    return;
  }
  state.activeFilePath = activeFile.path;

  const rawCsv = await loadFileContent(activeFile, { maxLines: 11 });
  const lines = rawCsv.trim().split(/\r?\n/).filter(Boolean).slice(0, 11);
  const headers = lines.length > 0 ? parseCsvLine(lines[0]) : [];
  const bodyRows = lines.slice(1, 11).map(parseCsvLine);

  const switcherHtml = csvFiles.length > 1 ? `
    <div class="flex flex-wrap gap-2 mb-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
      ${csvFiles.map(cf => `
        <button onclick="openFileFromTree('${folio.id}', '${escapeAttr(cf.path)}')"
                class="btn-pill ${cf.path === activeFile.path ? 'bento-card-dark' : ''}">
          ${escapeHtml(cf.name)} <span class="opacity-60 font-mono">(${escapeHtml(cf.size || "")})</span>
        </button>
      `).join("")}
    </div>
  ` : "";

  stage.innerHTML = `
    ${switcherHtml}

    <div class="flex flex-wrap items-center justify-between gap-3 mb-4 p-4 bento-card-subtle rounded-2xl">
      <div class="min-w-0">
        <span class="text-[10px] uppercase font-bold tracking-wider text-sub block">ARCHIVAL DATA SLICE (10-ROW PREVIEW)</span>
        <h3 class="text-sm sm:text-base font-bold text-main truncate">${escapeHtml(activeFile.name)}</h3>
      </div>
      <div class="flex items-center space-x-3 text-xs shrink-0">
        <span class="text-sub font-mono">Top ${bodyRows.length} rows</span>
        <a href="${window.DAPORT_MANIFEST.githubBaseUrl}${escapeAttr(activeFile.path)}" target="_blank" rel="noopener"
           class="btn-pill" style="background-color: var(--text-main); color: var(--bg-canvas);">
          Full CSV ↗
        </a>
      </div>
    </div>

    <div class="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-x-auto shadow-sm" style="background-color: var(--bg-card);">
      <table class="w-full text-left border-collapse text-xs tabular-nums" style="background-color: var(--bg-card); color: var(--text-main);">
        <thead>
          <tr class="bento-card-subtle border-b border-neutral-200 dark:border-neutral-800 text-main font-bold">
            <th class="py-3 px-3 text-center border-r border-neutral-200 dark:border-neutral-800 w-10">#</th>
            ${headers.map(h => `<th class="py-3 px-3.5 whitespace-nowrap text-main font-bold">${escapeHtml(h)}</th>`).join("")}
          </tr>
        </thead>
        <tbody class="divide-y border-neutral-200 dark:border-neutral-800" style="background-color: var(--bg-card);">
          ${bodyRows.map((r, rIdx) => `
            <tr class="hover:bento-card-subtle transition-colors" style="background-color: var(--bg-card);">
              <td class="py-2.5 px-3 text-center text-sub border-r border-neutral-200 dark:border-neutral-800 font-mono font-medium">${rIdx + 1}</td>
              ${headers.map((_, cIdx) => `<td class="py-2.5 px-3.5 text-main whitespace-nowrap max-w-[240px] truncate font-medium" title="${escapeAttr(r[cIdx] ?? "")}">${escapeHtml(r[cIdx] ?? "")}</td>`).join("")}
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
// 3. MARKDOWN PARSER (HỖ TRỢ TỰ ĐỘNG KHẮC PHỤC ĐƯỜNG DẪN ẢNH NỘI BỘ DỰ ÁN)
// ============================================================================
function parseMarkdownToHtml(md, folioOrFolder) {
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
        <div class="monograph-pre-wrap">
          ${lang ? `<div class="monograph-pre-lang">${escapeHtml(lang)}</div>` : ""}
          <pre class="monograph-pre"><code>${escapeHtml(blockLines.join("\n"))}</code></pre>
        </div>
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
        <div class="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-x-auto my-6" style="background-color: var(--bg-card);">
          <table class="monograph-table" style="background-color: var(--bg-card); color: var(--text-main);">
            <thead>
              <tr>${headerCells.map(c => `<th>${formatInlineMd(c, folioOrFolder)}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${bodyRows.map(row => `<tr>${row.map(c => `<td>${formatInlineMd(c, folioOrFolder)}</td>`).join("")}</tr>`).join("")}
            </tbody>
          </table>
        </div>
      `;
      continue;
    }

    // Nhận diện thẻ HTML <img> thô trong README nếu có
    const rawImgMatch = trimmed.match(/^<img\s+([^>]*?)src=["']([^"']+)["']([^>]*?)(\/?>|><\/img>)$/i);
    if (rawImgMatch) {
      const rawSrc = rawImgMatch[2];
      const resolvedSrc = resolveAssetUrl(rawSrc, folioOrFolder);
      html += `
        <figure class="my-6 bento-card-subtle p-3 rounded-2xl flex flex-col items-center">
          <img src="${escapeAttr(resolvedSrc)}" class="max-h-[460px] w-auto object-contain rounded-xl" />
        </figure>
      `;
      i++;
      continue;
    }

    // Nhận diện cú pháp ảnh Markdown: ![alt](url)
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
        html += badges.map(b => {
          const resolvedUrl = resolveAssetUrl(b.url, folioOrFolder);
          return `
          <figure class="my-6 bento-card-subtle p-3 rounded-2xl flex flex-col items-center">
            <img src="${escapeAttr(resolvedUrl)}" alt="${escapeAttr(b.alt)}" class="max-h-[460px] w-auto object-contain rounded-xl" />
            ${b.alt ? `<figcaption class="text-center text-xs text-sub mt-2 font-medium">${escapeHtml(b.alt)}</figcaption>` : ""}
          </figure>
        `;
        }).join("");
      }
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = formatInlineMd(headingMatch[2], folioOrFolder);
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
      html += `<blockquote>${formatInlineMd(quoteLines.join(" "), folioOrFolder)}</blockquote>`;
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
      html += `<${tag} class="${listClass} ml-5 my-3 space-y-1.5 text-sm leading-relaxed text-muted">${items.map(it => `<li>${formatInlineMd(it, folioOrFolder)}</li>`).join("")}</${tag}>`;
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
    html += `<p class="my-3 text-sm sm:text-base leading-relaxed text-muted">${formatInlineMd(paraLines.join(" "), folioOrFolder)}</p>`;
  }

  return html;
}

function splitMarkdownTableRow(rowStr) {
  return rowStr
    .replace(/^\||\|$/g, "")
    .split("|")
    .map(c => c.trim());
}

function formatInlineMd(text, folioOrFolder) {
  let out = escapeHtml(text);

  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
    const resolvedUrl = resolveAssetUrl(url, folioOrFolder);
    return `<img src="${escapeAttr(resolvedUrl)}" alt="${escapeAttr(alt)}" class="inline-block h-5 align-middle mx-1" />`;
  });

  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, url) => {
    const folioMatch = url.match(/(\d{2})-[A-Za-z0-9_-]+/);
    if (folioMatch) {
      const targetId = folioMatch[1];
      return `<a href="#folio-${targetId}" onclick="selectFolio('${targetId}'); return false;" class="text-main font-bold underline underline-offset-4 hover:opacity-80">${label} ↗</a>`;
    }
    return `<a href="${url}" target="_blank" rel="noopener" class="text-main font-bold underline underline-offset-4 hover:opacity-80">${label} ↗</a>`;
  });

  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-main">$1</strong>');
  out = out.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
  out = out.replace(/`([^`]+)`/g, '<code class="bento-card-subtle px-1.5 py-0.5 rounded font-mono text-xs text-main">$1</code>');

  return out;
}

// ============================================================================
// 4. ARCHITECTURAL CANVAS FALLBACK & LIGHTBOX
// ============================================================================
function drawArchitecturalCanvasPlate(canvasId, chartType, folio) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !folio) return;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(rect.width || 720, 520);
  const height = canvas.height || 270;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const bgCanvas = isDark ? "#161514" : "#FFFFFF";
  const bgCard = isDark ? "#211F1D" : "#F3EDE2";
  const textInk = isDark ? "#F4EFE6" : "#141312";
  const textStone = isDark ? "#8C8579" : "#7A7368";
  const accentBordeaux = "#722F37";
  const gridStroke = isDark ? "rgba(244, 239, 220, 0.05)" : "rgba(20, 19, 18, 0.05)";

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
    { x: 30, y: 75, w: 165, h: 110, tag: "01. INGESTION", title: folio.code, sub: `${folio.files?.length || 0} Files`, color: textInk },
    { x: width / 2 - 85, y: 65, w: 175, h: 130, tag: "02. ARCHITECTURE", title: folio.headlineMetric, sub: folio.folder.slice(0, 22), color: accentBordeaux },
    { x: width - 200, y: 75, w: 165, h: 110, tag: "03. DECISION SUITE", title: "Verified Artifacts", sub: "Code & README", color: textInk }
  ];

  ctx.strokeStyle = accentBordeaux;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(195, 130);
  ctx.lineTo(width / 2 - 85, 130);
  ctx.moveTo(width / 2 + 90, 130);
  ctx.lineTo(width - 200, 130);
  ctx.stroke();
  ctx.setLineDash([]);

  boxes.forEach(b => {
    ctx.fillStyle = bgCard;
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.strokeStyle = b.color;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(b.x, b.y, b.w, b.h);

    ctx.fillStyle = b.color;
    ctx.font = "700 9.5px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(b.tag, b.x + 12, b.y + 26);

    ctx.fillStyle = textInk;
    ctx.font = "800 13px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(String(b.title).slice(0, 20), b.x + 12, b.y + 58);

    ctx.fillStyle = textStone;
    ctx.font = "500 10px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(String(b.sub).slice(0, 24), b.x + 12, b.y + 84);
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
    <div class="w-full max-w-5xl bento-card p-3 sm:p-6 flex flex-col items-center">
      <img src="${escapeAttr(vis.path)}" alt="${escapeAttr(vis.title)}"
           class="max-h-[72vh] w-auto object-contain hidden rounded-2xl"
           onload="this.classList.remove('hidden'); document.getElementById('lightbox-canvas-wrap').classList.add('hidden');"
           onerror="this.classList.add('hidden'); document.getElementById('lightbox-canvas-wrap').classList.remove('hidden');" />
      <div id="lightbox-canvas-wrap" class="w-full overflow-x-auto">
        <canvas id="lightbox-canvas" height="360" class="w-full block min-w-[520px]"></canvas>
      </div>
      <p class="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800 text-xs text-muted italic w-full text-center">${escapeHtml(vis.caption || "")}</p>
    </div>
  `;

  modal.classList.remove("hidden");
  requestAnimationFrame(() => drawArchitecturalCanvasPlate("lightbox-canvas", vis.chartType, folio));
}

function closeLightbox() {
  document.getElementById("lightbox-modal")?.classList.add("hidden");
}

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