# ⚽ The Anatomy of Champions: Premier League Dynasty & Expected Metrics (1992–2024)

![Data Analysis](https://img.shields.io/badge/Data-Analysis-green?style=for-the-badge)
![Power BI](https://img.shields.io/badge/Power_BI-Desktop-F2C811?style=for-the-badge&logo=powerbi&logoColor=black)
![DAX](https://img.shields.io/badge/DAX-Calculations-005FB8?style=for-the-badge&logo=microsoft&logoColor=white)
![SQL](https://img.shields.io/badge/SQL-MySQL-blue?style=for-the-badge&logo=mysql)
![Domain](https://img.shields.io/badge/Domain-Sports_Analytics-red?style=for-the-badge)

A 4-page Power BI intelligence report analyzing 32-year Big Six dynasties, xG conversion variance, and the strategic formula of title-winning sides.

---

## 📌 Project Overview

In football, the final score does not always show how well a team played. A team can win because of good luck or great saves by their goalkeeper, not just good tactics.

This project focuses on three main questions:
1. **Big Six History:** How have the top six clubs performed and shared points over the last 32 years?
2. **Team Quality vs. Luck:** Did champions win because they created better chances, or were they just lucky with finishing (xG vs. actual goals)?
3. **Winning Strategy:** Is it more important to win big matches against top rivals, or to consistently beat smaller teams?

---

## 🖥️ Project Pages

```text
Page 1: The Big Six Dynasty        -> Long-term history and head-to-head records (1992–Present)
Page 2: Attack & Luck Analyzer     -> Chance creation vs. Finishing efficiency (xG vs. Goals)
Page 3: Defensive & Goalkeeping    -> Defensive structure vs. Goalkeeper performance (xGA)
Page 4: The Champions' Blueprint   -> Points Per Game (PPG) against top rivals vs. other teams
```

### 1. The Big Six Dynasty
* **Goal:** Track total points, win rates, and direct match results between the Big Six clubs since 1992.
* **Key Visuals:** Cumulative points line chart with key football milestones, head-to-head win rate chart, historical total KPI cards.

### 2. Attack & Luck Analyzer
* **Goal:** Separate real attacking quality from short-term finishing luck.
* **Key Visuals:** Scatter chart comparing Expected Goals (xG) per game with actual goals scored, variance chart showing lucky and unlucky teams.

### 3. Defensive & Goalkeeping
* **Goal:** Measure how many dangerous chances a defense allows, and how many goals the goalkeeper prevents.
* **Key Visuals:** Shots conceded vs. Expected Goals Against (xGA), chart showing goalkeepers who saved points for their teams.

### 4. The Champions' Blueprint
* **Goal:** Find the common patterns of Premier League champions.
* **Key Visuals:** Scatter chart comparing **Points Per Game (PPG) vs. Big Six** against **PPG vs. Other Teams**.

---

## 🔍 Key Insights

### 1. Structural Resets Shape the "Big Six" Trajectory (Cumulative Points)

The 32-year cumulative points chart shows that long-term dominance is never a straight line. The sharpest changes in a club's point trajectory (slope shifts) are driven by two key structural events: **Ownership Takeovers** and **Managerial Eras**:

* **Ownership Changes (Capital & Vision):**
  * *Chelsea (2003) & Manchester City (2008):* The takeovers by Roman Abramovich and Sheikh Mansour created clear inflection points. Massive financial investment instantly steepened their cumulative point curves, turning them from upper-mid-table sides into perennial title contenders.
* **Managerial Transitions (Tactical Stability):**
  * *Manchester United (2013):* Sir Alex Ferguson's retirement caused an immediate flattening of United's curve. Frequent managerial turnover broke tactical continuity, resulting in slower point accumulation and volatile league finishes.
  * *Manchester City (2016) & Arsenal (2019):* Long-term sporting projects produce sustained acceleration. Pep Guardiola raised City's point trajectory to record-breaking levels, while Arsenal’s curve flattened during early rebuilding years before steepening rapidly once Mikel Arteta's tactical system matured.
* **Analytical Takeaway:** Long-term point accumulation reflects organizational stability rather than just squad value. A broken club structure immediately flattens the curve, while clear sporting direction protects both league status and crucial Champions League revenue.

### 2. Team Quality Sets the Floor, Star Players Set the Ceiling (xG Analysis)

Data from the xG era (2017/18 – 2023/24) shows that team tactics help create chances, but individual quality decides if those chances turn into goals (xG Delta):

* **Breaking Down Low Blocks:** Top clubs always keep a high xG baseline because they control matches. However, when smaller teams play a deep low block, top clubs need star moments to score:
  * *Manchester City (2017/18):* In their 100-point season (106 goals), City combined high goal volume from their forwards (Aguero, Sterling, Jesus, Sane) with crucial long-range moments from De Bruyne, Fernandinho, and Kompany to create a record-breaking positive xG Delta.
  * *Tottenham & Arsenal:* Spurs regularly scored more than their xG thanks to the clinical finishing of Son Heung-min and Harry Kane. At Arsenal, their xG Delta improved steadily season by season as Mikel Arteta completed his tactical system.
* **The Cost of Inconsistency (Chelsea & Manchester United):** Both teams regularly generated high xG, but their finishing was very unstable. This inconsistent conversion caused their league positions to swing up and down, directly hurting their Champions League qualification chances.
* **Mid-Table Safety vs. Relegation Battle:** Among teams with lower xG:
  * *Stable teams (e.g., Aston Villa, Bournemouth):* They created fewer chances but stayed safe because their wingers and forwards finished their rare opportunities efficiently.
  * *Relegated teams:* They suffered twice - not only struggling to create chances, but also wasting the few chances they had.

### 3. Defensive Structure vs. Goalkeeper Shot-Stopping (xGA Analysis)

Defensive performance relies on two distinct layers: **Team Suppression (xGA)** and **Goalkeeper Shot-Stopping (Goals Prevented)**:

* **The Championship Standard (Low xGA + Reliable Keeper):** 
  * Title contenders systematically suppress shot quality first. Teams like Arsenal (2023/24) and Manchester City control games to maintain the lowest xGA in the league, reducing the goalkeeper's workload.
  * Elite keepers (e.g., Alisson at Liverpool) act as a secondary safety net, consistently preventing 5 to 10 extra goals per season from rare defensive lapses.
* **The "Hero Goalkeeper" Trap (High xGA Reliance):**
  * Teams with passive midfields often surrender high shot volumes. While world-class shot-stopping can temporarily hide tactical flaws (e.g., De Gea saving +14 goals above expectation in 2017/18), this reliance is unsustainable over multiple seasons once keeper form cools down.
* **The Shot-Stopping Penalty (Low xGA, High Conceded):**
  * Conversely, Chelsea's volatility post-2018 shows that even with a decent defensive structure, below-average shot-stopping immediately damages league position and points.

### 4. Beating Smaller Teams Is the Key to the Title
* The data shows that **winning consistently against non-Big Six teams (PPG >= 2.40, meaning achieving 80% of the possible points against smaller teams) is the most important factor to win the league**.
* Top championship teams, such as Manchester City (2017/18) and Liverpool (2019/20), dropped less than 10% of their points against bottom-half teams.
* Teams that did well in big matches but lost points to smaller teams are very difficult to win the title.

---

## 🏛️ Data Model (Star Schema)

The project uses a Star Schema model to connect two different data tables without filter conflicts:

```text
               ┌───────────────────────────┐
               │         Dim_Team          │
               │   (team_name, team_short) │
               └─────────────┬─────────────┘
                             │ 1:N
        ┌────────────────────┴────────────────────┐
        ▼                                         ▼
┌───────────────────────────┐       ┌───────────────────────────┐
│       Stats_Standing      │       │       Stats_Matches       │
│  Summary data (1992-2024) │       │  Match-by-match data      │
│  Wins, Losses, Points     │       │  Goals, xG, xGA, Opponent │
└───────────────────────────┘       └───────────────────────────┘
        ▲                                         ▲
        └────────────────────┬────────────────────┘
                             │ 1:N
               ┌─────────────┴─────────────┐
               │        Dim_Season         │
               │  (season_id, season_text) │
               └───────────────────────────┘
```

* **`Stats_Standing`:** Used for historical totals across 32 years (all matches, total points, win rate).
* **`Stats_Matches`:** Used for fixture details, head-to-head records, and modern metrics (xG, xGA).

---

## 💻 Core DAX

Below are key DAX measures designed to handle multi-granularity data modeling, virtual relationships, and tactical football analytics:

### 1. Cross-Fact Virtual Relationship (`TREATAS`)
* **Problem:** Match-level data (`Stats_Matches`) does not store final league rank, which only exists in the macro seasonal table (`Stats_Standing`). Adding physical calculated columns would inflate file size.
* **Solution:** Use `TREATAS` to create an on-the-fly virtual relationship between team and season attributes to flag champions on scatter plots.

```dax
Is_Champion = 
VAR CurrentTeam = SELECTEDVALUE(Stats_Matches[team_name])
VAR CurrentSeason = SELECTEDVALUE(Stats_Matches[season])
VAR RankValue = 
    CALCULATE(
        MAX(Stats_Standing[season_rank]),
        TREATAS({CurrentTeam}, Stats_Standing[team]),
        TREATAS({CurrentSeason}, Stats_Standing[season])
    )
RETURN
    IF(RankValue = 1, 1, BLANK())
```

---

### 2. Safe Time-Series Iteration (`SUMX` & `VALUES`)
* **Problem:** Advanced expected metrics (xG) only exist from 2017/18 onward. A simple subtraction (`Goals - xG`) would distort historical seasons prior to 2017 by treating missing xG as zero.
* **Solution:** Iterate season-by-season using `VALUES()` and only compute `xG Delta` when valid xG records are present.

```dax
xG_Delta = 
SUMX(
    VALUES(Dim_Season[season_text]),
    VAR Season_xG = [Total_xG]
    VAR Season_Goals = [Total_Goals]
    RETURN
        IF(
            NOT ISBLANK(Season_xG) && Season_xG > 0,
            Season_Goals - Season_xG,
            BLANK()
        )
)
```

---

### 3. Tactical Domain Metric: Non-Big Six Points Dropped
* **Problem:** Standard loss or draw counters do not reflect the true opportunity cost of dropping points against mid-to-lower table teams in a title race.
* **Solution:** Filter specifically for non-Big Six opponents and calculate the exact margin of dropped points (`3 - actual points won`).

```dax
Points_Dropped_vs_NonBig6 = 
IF(
    ISFILTERED(Stats_Matches[team_season]),
    VAR Big6Clubs = {"Arsenal", "Chelsea", "Liverpool", "Manchester City", "Manchester Utd", "Tottenham"}
    VAR NonBig6Matches = 
        FILTER(
            Stats_Matches, 
            NOT(Stats_Matches[opponent] IN Big6Clubs)
        )
    VAR Dropped = 
        SUMX(
            NonBig6Matches, 
            3 - Stats_Matches[points]
        )
    RETURN
        IF(Dropped > 0, Dropped, BLANK()),
    BLANK()
)
```

---

### 4. 32-Year Running Total (`ALL` & Cumulative Window)
* **Problem:** Cumulative points must flow continuously across 32 seasons without breaking when users interact with visual slicers.
* **Solution:** Use `ALL(Dim_Season)` to clear seasonal filter context while keeping an integer-based sequence check (`season_int`).

```dax
Cumulative_Points = 
CALCULATE(
    SUM(Stats_Standing[points]),
    FILTER(
        ALL(Dim_Season), 
        Dim_Season[season_int] <= MAX(Dim_Season[season_int])
    )
)
```
---

## 📁 Project Structure

```text
├── assets/
│   ├── 01_big_six_dynasty.png
│   ├── 02_attack_xg_luck.png
│   ├── 03_defense_goalkeeping.png
│   ├── 04_champions_blueprint.png
├── data/
│   ├── matches.csv
│   ├── seasons.csv
│   ├── seasonstats.csv
│   ├── teams.csv
├── Premier_League_Analytics_1992_2024.pbix
├── create_views.sql
├── measures.dax
└── README.md
```

---

## 📂 Data Sources & Project Files

* **Data Source:** [Premier League Match Data and Season Stats by Evan Gora on Kaggle](https://www.kaggle.com/datasets/evangora/premier-league-data)
* **Project Files:**
  * **Power BI File:** [`Premier_League_Analytics_1992_2024.pbix`](./Premier_League_Analytics_1992_2024.pbix) (Full 4-page interactive report)
  * **SQL File:** [`create_views.sql`](./create_views.sql) 
  * **DAX Codebase:** [`measures.dax`](./measures.dax) (All 25+ production measures)
  * **Data Files:** [`/data/`](./data/) (Cleaned relational CSV tables)
