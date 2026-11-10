-- create customer rfm dimensional data mart table
drop table if exists mart_customer_rfm_dim;

create table mart_customer_rfm_dim as
with rfm_metrics as (
    select 
        user_id,
        datediff('2022-06-12', max(created_at)) as recency_days,
        count(distinct order_id) as frequency_orders,
        round(sum(sale_price), 2) as monetary_spend
    from fact_order_items
    where status not in ('cancelled', 'returned')
    group by user_id
),
rfm_scores as (
    select 
        user_id,
        recency_days,
        frequency_orders,
        monetary_spend,
        -- recency score where lower recency days get higher scores
        ntile(5) over (order by recency_days desc) as r_score,
        -- frequency score where higher order count gets higher scores
        ntile(5) over (order by frequency_orders asc) as f_score,
        -- monetary score where higher spend gets higher scores
        ntile(5) over (order by monetary_spend asc) as m_score
    from rfm_metrics
)
select 
    user_id,
    recency_days,
    frequency_orders,
    monetary_spend,
    r_score,
    f_score,
    m_score,
    -- composite rfm score string concatenation
    concat(r_score, f_score, m_score) as rfm_score_composite,
    -- customer segment classification based on rfm scores
    case 
        when r_score >= 4 and f_score >= 4 and m_score >= 4 then 'champions'
        when r_score >= 3 and f_score >= 3 then 'loyal customers'
        when r_score >= 4 and f_score <= 2 then 'recent new customers'
        when r_score >= 3 and f_score <= 2 then 'promising'
        when r_score <= 2 and f_score >= 3 then 'at risk / need attention'
        when r_score <= 2 and f_score >= 4 and m_score >= 4 then 'cant lose them'
        when r_score <= 1 and f_score <= 2 then 'lost / inactive'
        else 'potential loyalists'
    end as customer_segment
from rfm_scores;

-- add primary key index on user id for joining with dim users
alter table mart_customer_rfm_dim add primary key (user_id);