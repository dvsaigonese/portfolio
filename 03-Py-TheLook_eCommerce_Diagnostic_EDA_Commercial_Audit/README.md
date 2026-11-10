# 🛒 TheLook eCommerce: Diagnostic EDA & Commercial Audit

![Data Analysis](https://img.shields.io/badge/Data-Analysis-green?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.x-blue?style=for-the-badge&logo=python&logoColor=white)
![Status](https://img.shields.io/badge/Status-Completed-success?style=for-the-badge)
![Domain](https://img.shields.io/badge/Domain-eCommerce-red?style=for-the-badge)

A diagnostic exploratory data analysis (EDA) and commercial health audit of **TheLook eCommerce**, dissecting **180K+ transaction items** and **79K+ customer profiles** to uncover the root causes of a **25% ($2.69M) GMV leakage**, evaluate product margin resilience, and establish RFM-based customer retention strategies.

> 🚀 **Next Phase - Production E2E Pipeline (MySQL + Power BI):** The diagnostic findings from this Python audit were scaled into an indexed **MySQL Star Schema Data Warehouse** (incorporating 2.4M+ web events) and a **3-Page Executive Power BI Intelligence Suite** in **[Project 04: TheLook eCommerce E2E Warehouse & BI Suite](../04-E2E-TheLook_eCommerce_Warehouse_and_BI_Suite/)**.

---

## 📌 Project Overview & Business Context

In fast-growing eCommerce platforms, top-line Gross Merchandise Value (GMV) often masks critical operational inefficiencies. High order volume does not automatically translate into realized cash flow if fulfillment bottlenecks, order cancellations, and post-delivery returns go unchecked. Furthermore, surging customer acquisition costs (CAC) make one-time buyers unprofitable over the long run.

This project conducts an end-to-end **Commercial Health Audit** across four core business pillars:
1. **Pricing & Catalog Architecture:** Understanding unit price distributions and cost-to-price scaling.
2. **Revenue Efficiency & Leakage:** Quantifying the financial gap between Gross GMV ($10.76M), Active Pipeline Revenue ($8.07M), and Realized Completed Cash Revenue ($2.67M) across product categories.
3. **Operational Bottlenecks:** Auditing fulfillment SLAs and identifying high-return merchandise categories.
4. **Customer Lifecycle & Retention:** Measuring registration-to-purchase velocity, longitudinal cohort retention, and RFM value concentration.

---

## 🛠️ Technical Specifications

| Category | Specification |
| :--- | :--- |
| **Language & Libraries** | `Python 3.x`, `pandas`, `numpy`, `matplotlib`, `seaborn` |
| **Analytical Techniques** | Statistical Distribution Analysis (Log-scale, Skewness, IQR), Pearson Correlation Matrix, Pareto Revenue Tiering, Longitudinal Cohort Analysis, 5x5 Quantile RFM Segmentation |
| **Dataset Scope** | **4 Core Relational Tables:** `orders` (124,923), `order_items` (180,952), `products` (29,120), `users` (100,000 registered / 79,893 active buyers) |
| **Financial Baseline** | **$10.76M** Gross GMV \| **$8.07M** Active Net Pipeline \| **$2.67M** Realized Completed Revenue \| **$1.39M** Realized Gross Profit (**51.82% Margin**) |

---

## 🔍 Data Quality Audit & Synthetic Dataset Limitations

Before conducting business analysis, a rigorous programmatic audit was performed across all four tables. While referential integrity is intact (0 orphan keys, 0 duplicate primary keys), several **synthetic data artifacts** were discovered and accounted for:

1. **Boundary Truncation Surge (Recent Days):** The dataset exhibits an artificial spike in transaction volume during the final days of the recording window due to simulation boundary cutoffs. All time-series trends were truncated to full calendar months (`2019-01` to `2024-01`) to prevent distortion.
2. **Zero-Discount Policy:** Recorded `retail_price` is strictly equal to `sale_price` across 100% of historical transactions, indicating the absence of markdown/promotional pricing data.
3. **Missing Cancellation Timestamps:** Orders in `Cancelled` status contain `NaN` values for `shipped_at` and `delivered_at`, preventing exact timestamp tracking of when within the pre-shipment window cancellations occur.
4. **Uniform Fulfillment Lead Times:** Dispatched orders show a uniform median processing turnaround of **1.4 days (~34 hrs)** across all categories and distribution centers, reflecting a synthetic random distribution rather than physical warehouse congestion.

---

## 📊 Key Findings & Business Insights

### 1. Catalog Pricing & The Pareto Revenue Asymmetry
- **Extreme Right-Skewed Pricing:** Transacted unit prices exhibit a skewness of **4.79**, where high-ticket luxury items (> $500, up to $999) pull the mean price (**$59.46**) nearly **50%** above the median (**$39.99**).
- **Volume vs. Value Inverse Split:** 
  * **Budget (<$30) & Core ($30 - $70) items account for >75% of total units sold** (high warehouse pick-and-pack workload) but generate only **~50% of realized GMV**.
  * **Mid-Tier ($70 - $150) & Premium ($150 - $500)** items represent **<25% of unit volume yet anchor >50% of completed revenue**, serving as the primary drivers of average order value (AOV).

### 2. The 25% ($2.69M) GMV Leakage & Margin Resilience
- **Strict Cost-Plus Pricing:** A near-perfect linear correlation (**r = 0.98**) between `cost` and `sale_price` ensures a highly stable **Blended Gross Margin of 51.82%** across the platform.
- **The Operational Bleed:** Out of **$10.76M** in total platform GMV, **$2.69M (25.01%)** is permanently lost before realization—driven by **14.91% in pre-shipment Cancellations ($1.60M)** and **10.10% in post-delivery Returns ($1.09M)** (equivalent to a ~15.0% return rate when evaluated strictly against post-dispatch orders in Phase 2). Only **$2.67M (24.85%)** is currently locked in as `Complete`, while the remaining **$5.40M** sits in active transit/processing (`Shipped + Processing`, forming the **$8.07M** Active Net Pipeline tracked in the Phase 2 Power BI Suite).
- **Category Return Risk:** High-ticket apparel categories such as *Suits*, *Outerwear & Coats*, and *Jeans* suffer from elevated return rates, directly eroding net profit dollars despite healthy initial markups.

### 3. Customer Activation Velocity & The Month-1 Churn Cliff
- **Sluggish Onboarding Conversion:** Only **0.81%** of newly registered users complete their first purchase within 24 hours (`Day <= 1`), and just **4.59%** convert within their first week (`Day <= 7`). The median time-to-first-purchase sits at **180.9 days**, indicating a massive "cold lead" bottleneck after account creation.
- **Longitudinal Cohort Decay:** Across all annual cohorts (`2020–2023`), Month-1 (M1) repeat purchase retention drops sharply to **2.2% - 6.5%** before stabilizing at a low single-digit baseline through Month 12.

### 4. RFM Customer Value Concentration & The 23% Revenue Cliff
- **High-Value Anchors:** **Champions (16.5% of buyers)** and **Loyal Customers (20.6%)** generate **62.6% of total realized revenue** (**$1.67M combined**), with Champions averaging **$85.94** per customer (3.6x higher than At-Risk/Hibernating tiers).
- **Urgent Churn Exposure:** The **Potential / Need Attention** segment (**18.6% of users, avg spend $35.87**) and **At Risk / Hibernating** segment (**34.2% of users**) collectively hold over **$616K (~23%) of historical realized revenue** (and over **$1.10M** in active pipeline value for the 2021 cohort alone). Without proactive win-back interventions before the 180 to 300-day inactivity mark, this revenue pool faces permanent churn.

---

## 💡 Strategic Recommendations

1. **Deploy Automated Win-Back Flows for "Need Attention" & "At-Risk" Tiers:**
   * *Action:* Trigger automated, margin-backed discount vouchers (10% - 15% off, protected by the platform's 51.8% gross margin) when multi-time buyers cross 90 to 180 days of inactivity.
   * *Impact:* Defend the **$616K+** historical revenue pool before users slip into the >300-day *Hibernating* state.
2. **Overhaul New-User Onboarding (First 7 Days):**
   * *Action:* Introduce a time-sensitive "Welcome Offer" valid for 72 hours post-registration to compress the 180-day median activation lag and lift Day-7 conversion from **4.59% to >10%**.
3. **Mitigate Category-Specific Return Leakage ($1.09M):**
   * *Action:* Implement interactive sizing calculators and virtual fit guides on product detail pages (PDPs) for fitted garments (*Outerwear, Suits, Jeans, Sweaters*) to reduce post-delivery size/fit returns.
4. **Reallocate Marketing Spend Toward the $70 - $150 Mid-Tier Sweet Spot:**
   * *Action:* Shift paid acquisition and upsell recommendations away from sub-$30 items toward the **$70 - $150 Mid-Tier** bracket to maximize gross profit dollars per warehouse fulfillment cycle.

---

## 📁 Project Structure

```text
├── data/
│   ├── thelook_ecommerce.orders.csv
│   ├── thelook_ecommerce.order_items.csv
│   ├── thelook_ecommerce.products.csv
│   └── thelook_ecommerce.users.csv
├── thelook_commercial_health_audit.ipynb
└── README.md

```

## 📂 Data Source
* **Data Source:** [TheLook eCommerce Dataset on Kaggle / Google BigQuery Public Data](https://console.cloud.google.com/marketplace/product/bigquery-public-data/thelook-ecommerce?pli=1&project=goal-line-messenger-bot)
* **Next Phase Repository:** [04-E2E-TheLook_eCommerce_Warehouse_and_BI_Suite](../04-E2E-TheLook_eCommerce_Warehouse_and_BI_Suite/)