# ⚽ Premier League Analytics: Football Tactics & Finance (1992-2026)

![SQL](https://img.shields.io/badge/SQL-MySQL-blue?style=for-the-badge&logo=mysql)
![Data Analysis](https://img.shields.io/badge/Data-Analysis-green?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-ETL_Pipeline-yellow?style=for-the-badge&logo=python)

## 📌 Executive Summary
This project connects on-pitch tactics with football finance. By analyzing a historical dataset of Premier League players (1992-2026), I want to find hidden market trends, prove tactical changes with data, and check team financial risks.

Instead of using basic SQL, this project uses **Advanced Analytical SQL** (Window Functions, Time-Series Tracking, Percentile Segmentation) on a large single-table dataset to find professional football insights.

---

## 🛠️ Data Engineering (From Raw Data to Clean Data)
Real-world data is rarely ready to use. The raw dataset (from [Kaggle: All Premier League Teams & Players 1992-2024](https://www.kaggle.com/datasets/samoilovmikhail/all-premier-league-team-and-players-1992-2024/)) was split into hundreds of small CSV files by seasons and clubs.

Before writing SQL, I built a Python script ([`data_combiner.py`](data_combiner.py)) to extract, clean, and combine all these files into one single `Master_PremierLeague_1992_2026.csv`.

```text
📦 Raw_Data/
 ┣ 📂 1992_season/ (arsenal.csv, chelsea.csv...)
 ┣ 📂 .../
 ┗ 📂 2026_season/
                 ⬇️ Processed via Python ETL Pipeline ⬇️
📦 Clean_Data/
 ┗ 📜 Master_PremierLeague_1992_2026.csv (Ready for SQL Database)
```

**Dataset Scale (After Processing):**
* **Table:** 1 Master Table
* **Columns:** 19 Attributes (Demographics, physical stats, market value, club info, etc.)
* **Rows:** 24,541 Player-season records

---

## 🗂️ SQL Project Structure (24 Queries)
The core analysis is written in a single SQL script. It contains **24 analytical queries**, broken down into 4 logical phases. Focused on analytical depth and data quality.

[Click here to view the full SQL Analysis Script](SQL_Script.sql)

| Phase | Focus Area | Query Numbers | Description |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Data Preparation & Quality | **Q1 to Q9** | Checking dataset size, timelines, duplicates, and missing values. |
| **Phase 2** | Player Demographics | **Q10** | Looking at the historical player population by nationality. |
| **Phase 3** | On-Pitch Analytics | **Q11 to Q14** | Analyzing tactical formations, height trends, and foot preferences. |
| **Phase 4** | Financial Analytics | **Q15 to Q24** | Analyzing market inflation, club wealth, breakout players, and transfer impacts. |

---

## 📊 Key Insights

Based on the SQL data analysis, here are the top findings:

* 🔄 **The Tactical Shift (4-4-2 to 4-3-3):** The data clearly shows "Wide Midfielders" are slowly disappearing over the decades. They are being replaced by "Wingers", especially "Inverted Wingers" (players using their opposite strong foot to cut inside), which matches the modern shift to front-three formations.
* 💷 **Measuring the "English Tax":** Are English players really more expensive? By filtering only the top 25% of elite players (value ≥ 75th percentile), the data proves that top English players cost much more than foreign players at the exact same level.
* 🛡️ **The Left-Footed Premium:** Modern football values passing from the defense. The data confirms that Left-footed Centre-Backs are not only increasing in numbers, but they also command a higher average market value than right-footed defenders.
* 📈 **Physical Evolution:** Player height has consistently increased over time across almost all positions, with Goalkeepers (GK) and Centre-Backs (CB) remaining the tallest on the pitch.
* ⚠️ **Financial Risk in the "Big Six":** Measuring "Squad Dependency Risk" for the 2026 season shows that some top clubs rely too much on a single star player. This player holds a very large part of the team's total value, creating high tactical and financial risk if they get injured or leave.

---

## 🧠 Data Logic & Methodology

Writing SQL is easy; writing meaningful SQL is hard. Here is how I handled data limits:

1.  **Fixing Data Bias:** I did not use fixed numbers (like `WHERE value > 10m`). Instead, I used `PERCENT_RANK()` to group elite players dynamically. This keeps the queries accurate even if player prices increase in the future.
2.  **Fixing Missing Time Data:** Because data from other leagues was missing, tracking player transfers was hard. I created a strict 1-year rule (`season - previous_season = 1`) using the `LAG()` function to find exact, direct transfers between EPL clubs.
3.  **Filtering by Time Periods:** We cannot compare money in 2004 with money in 2026. I used strict time filters (e.g., post-2004 for stable Transfermarkt data, post-2020 for modern age curves).

---

## 💻 SQL Skills Used

This analysis was done in a single, carefully documented SQL script showing:
*   **Data Cleaning:** `CAST`, `STR_TO_DATE`, `TRIM`, `REPLACE`, `NULLIF`.
*   **Advanced Grouping:** `GROUP BY`, `HAVING`, `JOIN`, Conditional Aggregation (`SUM(CASE WHEN...)`).
*   **Window Functions:** `LAG()` for historical tracking, `RANK()` & `ROW_NUMBER()` for ranking, `PERCENT_RANK()` for dynamic grouping.
*   **Clean Code:** Heavy use of `CTEs` to break down complex logic into easy-to-read steps.

