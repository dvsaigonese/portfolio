#!/usr/bin/env python3
"""
sync_manifest.py — Auto-Scanner & Manifest Generator for DAport Monograph (v2.0)
Fixes:
1. Reads ONLY the first 10 data rows of .csv files using itertools.islice (zero RAM spike).
2. Parses Jupyter Notebooks (.ipynb) into structured Markdown + Code + Output cells.
3. Automatically extracts real quantitative metrics from README.md for Folio cards.
"""

import itertools
import json
import os
import re
from pathlib import Path

ROOT_DIR = Path(__file__).parent.resolve()
OUTPUT_MANIFEST = ROOT_DIR / "js" / "manifest.js"

CODE_EXTS = {
    ".sql": "sql",
    ".py": "py",
    ".ipynb": "ipynb",
    ".dax": "dax",
    ".csv": "csv",
    ".md": "md"
}
IMAGE_EXTS = {".png", ".gif", ".jpg", ".jpeg", ".webp", ".svg"}
CSV_PREVIEW_MAX_ROWS = 10  # Chỉ lấy 1 dòng Header + 10 dòng dữ liệu đầu tiên


def format_size(num_bytes: int) -> str:
    if num_bytes < 1024:
        return f"{num_bytes} B"
    elif num_bytes < 1024 * 1024:
        return f"{num_bytes / 1024:.1f} KB"
    return f"{num_bytes / (1024 * 1024):.2f} MB"


def infer_folio_tag(folder_name: str, index_str: str) -> str:
    upper = folder_name.upper()
    if "E2E" in upper:
        return f"FOLIO {index_str} • E2E SUITE"
    if "SQL" in upper:
        return f"FOLIO {index_str} • SQL"
    if "BI" in upper:
        return f"FOLIO {index_str} • POWER BI"
    if "PY" in upper:
        return f"FOLIO {index_str} • PYTHON EDA"
    return f"FOLIO {index_str} • CASE STUDY"


def read_csv_top_10_rows(csv_path: Path) -> str:
    """Chỉ đọc đúng 1 dòng tiêu đề + 10 dòng đầu tiên của file CSV, không nạp cả file vào RAM."""
    lines = []
    try:
        with csv_path.open("r", encoding="utf-8", errors="ignore") as f:
            for line in itertools.islice(f, CSV_PREVIEW_MAX_ROWS + 1):
                stripped = line.rstrip("\r\n")
                if stripped:
                    lines.append(stripped)
    except Exception as e:
        return f"error_reading_csv\n{str(e)}"
    return "\n".join(lines)


def parse_ipynb_file(ipynb_path: Path) -> str:
    """
    Đọc file Jupyter Notebook (.ipynb) và trích xuất các cell (markdown + code + text output)
    thành chuỗi JSON gọn nhẹ để trình duyệt render mượt mà không bị treo vì ảnh base64 nặng.
    """
    try:
        raw_json = json.loads(ipynb_path.read_text(encoding="utf-8", errors="ignore"))
        cells_out = []
        exec_counter = 1

        for cell in raw_json.get("cells", []):
            ctype = cell.get("cell_type", "code")
            source_lines = cell.get("source", [])
            source_text = "".join(source_lines) if isinstance(source_lines, list) else str(source_lines)

            if not source_text.strip():
                continue

            cell_item = {
                "cell_type": ctype,
                "source": source_text
            }

            if ctype == "code":
                cell_item["execution_count"] = cell.get("execution_count") or exec_counter
                exec_counter += 1

                # Lấy output dạng text/plain hoặc bảng (bỏ qua base64 nặng hàng MB nếu quá nhiều)
                outputs_clean = []
                for out in cell.get("outputs", [])[:3]:
                    out_type = out.get("output_type", "")
                    if out_type == "stream":
                        txt = "".join(out.get("text", []))
                        if txt.strip():
                            outputs_clean.append({"type": "text", "data": txt[:1200]})
                    elif out_type in ("execute_result", "display_data"):
                        data_dict = out.get("data", {})
                        if "image/png" in data_dict:
                            img_b64 = data_dict["image/png"]
                            if isinstance(img_b64, list):
                                img_b64 = "".join(img_b64)
                            outputs_clean.append({"type": "image", "data": img_b64.strip()})
                        elif "text/plain" in data_dict:
                            txt = "".join(data_dict["text/plain"])
                            if txt.strip():
                                outputs_clean.append({"type": "text", "data": txt[:1200]})

                if outputs_clean:
                    cell_item["outputs"] = outputs_clean

            cells_out.append(cell_item)

        return json.dumps({"notebook_cells": cells_out}, ensure_ascii=False)
    except Exception as e:
        return json.dumps({
            "notebook_cells": [
                {"cell_type": "markdown", "source": f"### Error parsing notebook\n`{str(e)}`"}
            ]
        })


def extract_readme_metadata(readme_path: Path, default_title: str):
    if not readme_path.exists():
        return default_title, "Empirical analytics & data engineering module.", "Verified Module"

    text = readme_path.read_text(encoding="utf-8", errors="ignore")
    lines = [l.strip() for l in text.splitlines() if l.strip()]

    title = default_title
    desc = "Production analytics & relational warehousing case study."
    headline_metric = "Production Suite"

    # 1. Trích xuất tiêu đề H1 (giữ nguyên dấu gạch ngang 1992-2024)
    for line in lines:
        if line.startswith("# "):
            raw_t = re.sub(r"^#\s+", "", line)
            # Xóa emoji ở đầu dòng nhưng giữ nguyên chữ, số, dấu gạch ngang, dấu hai chấm
            title = re.sub(r"^[^\w\d]+", "", raw_t).strip()
            break

    # 2. Trích xuất đoạn mô tả văn bản đầu tiên (bỏ qua dòng badge ![...])
    for line in lines:
        if (
            not line.startswith("#")
            and not line.startswith("!")
            and not line.startswith("[!")
            and not line.startswith(">")
            and not line.startswith("|")
            and not line.startswith("---")
            and not line.startswith("```")
            and len(line) > 40
        ):
            clean_desc = re.sub(r"\*\*|\*|`|\[([^\]]+)\]\([^)]+\)", r"\1", line).strip()
            desc = clean_desc[:135] + ("..." if len(clean_desc) > 135 else "")
            break

    # 3. Trích xuất con số nổi bật đầu tiên nằm trong cặp **...** làm Headline Metric
    bold_matches = re.findall(r"\*\*([^*]{4,36})\*\*", text)
    for bm in bold_matches:
        if any(ch.isdigit() for ch in bm):
            headline_metric = bm.strip()
            break

    return title, desc, headline_metric


def scan_repository():
    folios = []
    project_dirs = sorted([
        d for d in ROOT_DIR.iterdir()
        if d.is_dir() and re.match(r"^\d{2}-", d.name)
    ])

    for proj_dir in project_dirs:
        match = re.match(r"^(\d{2})-(.+)$", proj_dir.name)
        idx_str = match.group(1)
        clean_name = match.group(2).replace("_", " ")

        readme_path = proj_dir / "README.md"
        title, short_desc, headline_metric = extract_readme_metadata(readme_path, clean_name)

        folio_meta_file = proj_dir / "folio.json"
        custom_meta = {}
        if folio_meta_file.exists():
            try:
                custom_meta = json.loads(folio_meta_file.read_text(encoding="utf-8"))
            except Exception:
                pass

        files_list = []
        visuals_list = []

        for root, _, filenames in os.walk(proj_dir):
            # Bỏ qua các thư mục ẩn như .ipynb_checkpoints hoặc __pycache__
            if any(part.startswith(".") or part == "__pycache__" for part in Path(root).parts):
                continue

            for fname in sorted(filenames):
                if fname.startswith("."):
                    continue
                fpath = Path(root) / fname
                rel_path = fpath.relative_to(ROOT_DIR).as_posix()
                rel_in_proj = fpath.relative_to(proj_dir).as_posix()
                ext = fpath.suffix.lower()
                fsize_str = format_size(fpath.stat().st_size)

                if ext in IMAGE_EXTS:
                    visuals_list.append({
                        "title": fname.replace("_", " ").replace("-", " ").rsplit(".", 1)[0].title(),
                        "path": rel_path,
                        "caption": f"Visual artifact ({fsize_str}) in {proj_dir.name}",
                        "chartType": "warehouse",
                        "metrics": []
                    })
                elif ext in CODE_EXTS:
                    ftype = CODE_EXTS[ext]
                    if ext == ".csv":
                        content = read_csv_top_10_rows(fpath)
                        summary_txt = f"Top 10 rows preview of {fsize_str} dataset"
                    elif ext == ".ipynb":
                        content = parse_ipynb_file(fpath)
                        summary_txt = f"Jupyter Notebook ({fsize_str}) — Markdown, Python & Outputs"
                    else:
                        content = fpath.read_text(encoding="utf-8", errors="ignore")
                        summary_txt = f"{ftype.upper()} artifact ({fsize_str})"

                    files_list.append({
                        "name": rel_in_proj,
                        "path": rel_path,
                        "type": ftype,
                        "size": fsize_str,
                        "summary": summary_txt,
                        "content": content
                    })

        # Đưa README.md lên đầu danh sách file
        files_list.sort(key=lambda x: (0 if x["name"].lower() == "readme.md" else 1, x["name"]))

        folios.append({
            "id": idx_str,
            "code": custom_meta.get("code", infer_folio_tag(proj_dir.name, idx_str)),
            "folder": proj_dir.name,
            "title": custom_meta.get("title", title),
            "shortDesc": custom_meta.get("shortDesc", short_desc),
            "headlineMetric": custom_meta.get("headlineMetric", headline_metric),
            "stack": custom_meta.get("stack", ["SQL", "Python", "Power BI", "Data Modeling"]),
            "kpis": custom_meta.get("kpis", [
                {"label": "KEY HIGHLIGHT", "value": headline_metric, "sub": proj_dir.name},
                {"label": "CODE & DATA FILES", "value": f"{len(files_list)} Artifacts", "sub": "SQL · Python · Notebook · CSV"},
                {"label": "VISUAL PLATES", "value": f"{len(visuals_list)} Visuals", "sub": "Dashboards & Architecture"}
            ]),
            "brief": custom_meta.get("brief", {
                "problem": short_desc,
                "architecture": f"Repository module '{proj_dir.name}' containing {len(files_list)} reproducible code/data files.",
                "impact": f"Headline benchmark: {headline_metric}. Open Full README.md or Code & Notebooks tab for full details."
            }),
            "visuals": visuals_list if visuals_list else [{
                "title": f"{title} — Architectural Overview",
                "path": f"{proj_dir.name}/assets/preview.png",
                "caption": short_desc,
                "chartType": "warehouse",
                "metrics": []
            }],
            "files": files_list
        })

    manifest_obj = {
        "repoName": "DAport",
        "githubBaseUrl": "https://github.com/username/DAport/tree/main/",
        "folios": folios
    }

    OUTPUT_MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    js_payload = "window.DAPORT_MANIFEST = " + json.dumps(manifest_obj, indent=2, ensure_ascii=False) + ";\n"
    OUTPUT_MANIFEST.write_text(js_payload, encoding="utf-8")
    print(f"[SUCCESS] Indexed {len(folios)} folios (CSV capped at 10 rows, .ipynb notebooks parsed) -> {OUTPUT_MANIFEST}")


if __name__ == "__main__":
    scan_repository()