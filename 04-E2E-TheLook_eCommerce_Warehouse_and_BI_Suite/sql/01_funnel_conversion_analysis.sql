-- analysis of user traffic conversion funnel and drop-off rates across traffic sources and browsers
with funnel_base as (
    select 
        traffic_source,
        browser,
        count(session_id) as total_sessions,
        sum(has_home) as step_1_home,
        sum(case when has_home = 1 and has_department = 1 then 1 else 0 end) as step_2_department,
        sum(case when has_department = 1 and has_product = 1 then 1 else 0 end) as step_3_product,
        sum(case when has_product = 1 and has_cart = 1 then 1 else 0 end) as step_4_cart,
        sum(case when has_cart = 1 and has_purchase = 1 then 1 else 0 end) as step_5_purchase
    from fact_sessions
    group by traffic_source, browser
)
select 
    traffic_source,
    browser,
    total_sessions,
    step_1_home,
    step_2_department,
    step_3_product,
    step_4_cart,
    step_5_purchase,
    -- drop-off rate between step 1 and step 2
    round(100.0 * (1 - (step_2_department * 1.0 / nullif(step_1_home, 0))), 2) as dropoff_home_to_dept_pct,
    -- drop-off rate between step 2 and step 3
    round(100.0 * (1 - (step_3_product * 1.0 / nullif(step_2_department, 0))), 2) as dropoff_dept_to_prod_pct,
    -- drop-off rate between step 3 and step 4
    round(100.0 * (1 - (step_4_cart * 1.0 / nullif(step_3_product, 0))), 2) as dropoff_prod_to_cart_pct,
    -- cart abandonment rate between step 4 and step 5
    round(100.0 * (1 - (step_5_purchase * 1.0 / nullif(step_4_cart, 0))), 2) as cart_abandonment_rate_pct,
    -- overall conversion rate from session to purchase
    round(100.0 * step_5_purchase / nullif(total_sessions, 0), 2) as overall_conversion_rate_pct
from funnel_base
order by total_sessions desc;

-- calculation of customer retention cohort by monthly active users over a 12-month period
with customer_cohort as (
    -- identify the first order month for each customer
    select 
        user_id,
        date_format(min(created_at), '%y-%m-01') as cohort_month
    from fact_orders
    where status not in ('cancelled', 'returned')
    group by user_id
),
customer_orders_monthly as (
    -- record subsequent order months for each customer
    select distinct
        o.user_id,
        c.cohort_month,
        date_format(o.created_at, '%y-%m-01') as order_month,
        timestampdiff(month, str_to_date(c.cohort_month, '%y-%m-%d'), str_to_date(date_format(o.created_at, '%y-%m-01'), '%y-%m-%d')) as month_offset
    from fact_orders o
    join customer_cohort c on o.user_id = c.user_id
    where o.status not in ('cancelled', 'returned')
),
cohort_base_size as (
    -- determine initial customer cohort size at month zero
    select 
        cohort_month,
        count(distinct user_id) as cohort_size
    from customer_cohort
    group by cohort_month
)
select 
    m.cohort_month,
    b.cohort_size,
    m.month_offset,
    count(distinct m.user_id) as active_users,
    round(100.0 * count(distinct m.user_id) / b.cohort_size, 2) as retention_rate_pct
from customer_orders_monthly m
join cohort_base_size b on m.cohort_month = b.cohort_month
where m.month_offset <= 12
group by m.cohort_month, b.cohort_size, m.month_offset
order by m.cohort_month, m.month_offset;

-- evaluation of distribution center fulfillment lead times and service level agreements
select 
    dc.distribution_center_id,
    dc.name as warehouse_name,
    count(distinct o.order_id) as total_orders_fulfilled,
    -- dispatch sla from order creation to shipment
    round(avg(timestampdiff(hour, o.created_at, o.shipped_at) / 24.0), 2) as avg_dispatch_days,
    -- transit sla from shipment to delivery
    round(avg(timestampdiff(hour, o.shipped_at, o.delivered_at) / 24.0), 2) as avg_transit_days,
    -- total lead-time from order creation to delivery
    round(avg(timestampdiff(hour, o.created_at, o.delivered_at) / 24.0), 2) as avg_total_lead_time_days
from fact_orders o
join fact_order_items oi on o.order_id = oi.order_id
join dim_products p on oi.product_id = p.product_id
join dim_distribution_centers dc on p.distribution_center_id = dc.distribution_center_id
where o.status = 'complete' 
  and o.shipped_at is not null 
  and o.delivered_at is not null
group by dc.distribution_center_id, dc.name
order by avg_total_lead_time_days desc;