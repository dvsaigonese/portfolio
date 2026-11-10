/* =================================================================
   PHASE 1: DATA PREPARATION & DATA QUALITY
   Validate the data before drawing football or financial conclusions.
   ================================================================= */

-- Q1
-- DDL & DML (Create table & Insert data)
-- Casting data type from the base DB (with all string types)
-- First: create new data table
-- Then insert data from base DB to new table with new compatible format
create table epl_players (
    position varchar(30),
    foot varchar(15),
    status varchar(255),
    joined_on date,
    name varchar(255),
    height decimal(5,2),
    id int unsigned,
    nationality varchar(255),
    market_value decimal(15,2),
    signed_from varchar(255),
    age tinyint unsigned,
    date_of_birth date,
    current_club varchar(255),
    jersey_number tinyint unsigned,
    age_at_season_start tinyint unsigned,
    is_loan varchar(50),
    loaned_from varchar(255),
    season smallint unsigned,
    club varchar(255)
);

insert into epl_players (
    position, foot, status, joined_on, name, height, id, nationality, 
    market_value, signed_from, age, date_of_birth, current_club, 
    jersey_number, age_at_season_start, is_loan, loaned_from, season, club
)
select     
    trim(position),
    trim(foot),
    trim(status),
    case 
        when trim(joinedOn) = '' or joinedOn is null then null 
        when joinedOn like '%,%' then str_to_date(joinedOn, '%b %e, %Y')
        when joinedOn like '%-%' then cast(joinedOn as date)
        else null 
    end as joined_on,
    trim(name),
    nullif(trim(replace(replace(height, 'm', ''), ',', '.')), ''),
    nullif(trim(id), ''),
    trim(nationality),
    case 
        when trim(marketValue) = '' or marketValue is null then null
        when marketValue like '%m' then 
            cast(replace(replace(marketValue, '€', ''), 'm', '') as decimal(15,2)) * 1000000
        when marketValue like '%k' then 
            cast(replace(replace(marketValue, '€', ''), 'k', '') as decimal(15,2)) * 1000
        else 
            cast(replace(marketValue, '€', '') as decimal(15,2)) 
    end,
    case 
        when signedFrom like '%Ablöse%' then null 
        else trim(signedFrom)
    end,
    nullif(trim(age), ''),
    case 
        when trim(dateOfBirth) = '' or dateOfBirth is null then null 
        when dateOfBirth like '%,%' then str_to_date(dateOfBirth, '%b %e, %Y')
        when dateOfBirth like '%-%' then cast(dateOfBirth as date)
        else null 
    end,
    trim(currentClub),
    nullif(trim(jerseyNumber), ''),
    nullif(trim(ageAtSeasonStart), ''),
    trim(isLoan),
    trim(loanedFrom),
    nullif(trim(Season), ''),
    trim(Club)
from master_premierleague;

-- Q2
-- Get the first nationality of players, 
-- format from array nationality from the base DB to only string with their first nationality
update epl_players 
set nationality = trim(substring_index(replace(replace(replace(replace(nationality, '[', ''), ']', ''), '''', ''), '"', ''), ',', 1));

-- Q3
-- Fix the data on the club column
update epl_players 
set club = trim(left(replace(club, '_', ' '), length(replace(club, '_', ' ')) - length(substring_index(replace(club, '_', ' '),' ',-2))));

-- Q4
-- Dataset Size
select count(*) from epl_players;

-- Q5
-- Dataset Season Coverage
select min(season), max(season) from epl_players;

-- Q6
-- Latest Available Update
-- Because the 2026 Premier League summer transfer window opened on Monday, June 15, 2026 
-- and will close on Tuesday, September 1, 2026
-- We need to find the max(joined_on) date of this DB to get when this DB was updated
select joined_on 
from epl_players 
where joined_on is not null 
order by joined_on desc 
limit 1;

-- Q7
-- Unique Player Count in EPL history
select count(distinct id) from epl_players;

-- Q8
-- Duplicate Record Validation
-- Player cannot exist in more than 1 row per season
select id, season, club, count(*) 
from epl_players
group by id, season, club
having count(*) > 1;

-- Q9
-- Missing Data Profile
select 
	count(*) as total,
	round(sum(case when position is null or position = '' then 1 else 0 end)/count(*)*100,2) as position_missing_percentile,
	round(sum(case when foot is null or foot = '' then 1 else 0 end)/count(*)*100,2) as foot_missing_percentile,
	round(sum(case when status is null or status = '' then 1 else 0 end)/count(*)*100,2) as status_missing_percentile,
	round(sum(case when joined_on is null then 1 else 0 end)/count(*)*100,2) as joined_on_missing_percentile,
	round(sum(case when name is null or name = '' then 1 else 0 end)/count(*)*100,2) as name_missing_percentile,
	round(sum(case when height is null then 1 else 0 end)/count(*)*100,2) as height_missing_percentile,
	round(sum(case when id is null then 1 else 0 end)/count(*)*100,2) as id_missing_percentile,
	round(sum(case when nationality is null or nationality = '' then 1 else 0 end)/count(*)*100,2) as nationality_missing_percentile,
	round(sum(case when market_value is null then 1 else 0 end)/count(*)*100,2) as market_value_missing_percentile,
	round(sum(case when signed_from is null or signed_from = '' then 1 else 0 end)/count(*)*100,2) as signed_from_missing_percentile,
	round(sum(case when age is null then 1 else 0 end)/count(*)*100,2) as age_missing_percentile,
	round(sum(case when date_of_birth is null then 1 else 0 end)/count(*)*100,2) as date_of_birth_missing_percentile,
	round(sum(case when current_club is null or current_club = '' then 1 else 0 end)/count(*)*100,2) as current_club_missing_percentile,
	round(sum(case when jersey_number is null then 1 else 0 end)/count(*)*100,2) as jersey_number_missing_percentile,
	round(sum(case when age_at_season_start is null then 1 else 0 end)/count(*)*100,2) as age_at_season_start_missing_percentile,
	round(sum(case when is_loan is null or is_loan = '' then 1 else 0 end)/count(*)*100,2) as is_loan_missing_percentile,
	round(sum(case when loaned_from is null or loaned_from = '' then 1 else 0 end)/count(*)*100,2) as loaned_from_missing_percentile,
	round(sum(case when season is null then 1 else 0 end)/count(*)*100,2) as season_missing_percentile,
	round(sum(case when club is null or club = '' then 1 else 0 end)/count(*)*100,2) as club_missing_percentile
from epl_players;


/* =================================================================
   PHASE 2: DATASET OVERVIEW & PLAYER DEMOGRAPHICS
   Establish who the historical EPL player population is.
   ================================================================= */

-- Q10
-- Players by Nationality
-- England, Ireland, Scotland, and Wales dominate the Top 5, with France breaking into the 4th position.
-- Northern Ireland in the top 10 indicates a strong historical presence of UK-born players.
select 
	nationality, 
	count(distinct id) as quantity,
	rank() over (order by count(distinct id) desc) as ranking
from epl_players
group by nationality;


/* =================================================================
   PHASE 3: ON-PITCH ANALYTICS (Tactical & Physical Trends)
   Examine how player profiles change across football eras.
   ================================================================= */

-- Q11
-- Player Distribution by Position Across Decades
-- Reflects the tactical shift from classic 4-4-2 formations to 4-3-3 or back-3 systems.
-- Wide Midfielders noticeably decrease while Wingers increase over time.
select
	position,
	count(distinct case when season between 1992 and 1999 then id end) as quantity_90s,
	count(distinct case when season between 2000 and 2009 then id end) as quantity_00s,
	count(distinct case when season between 2010 and 2019 then id end) as quantity_10s,
	count(distinct case when season >= 2020 then id end) as quantity_20s,
	count(distinct id) as total_quantity
from epl_players
group by position
order by total_quantity desc;

-- Q12
-- Average Height Evolution by Position
-- Height has consistently increased over time across almost all positions.
-- Goalkeepers (GK) and Centre-Backs (CB) are the tallest, followed by CFs and CDMs.
-- Full-Backs (FB) tend to be slightly taller than Wingers due to heavier defensive duel responsibilities.
select
	position, 
	round(avg(case when season between 1992 and 1999 then height end), 1) as avg_height_90s,
	round(avg(case when season between 2000 and 2009 then height end), 1) as avg_height_00s,
	round(avg(case when season between 2010 and 2019 then height end), 1) as avg_height_10s,
	round(avg(case when season >= 2020 then height end), 1) as avg_height_20s,
	round(avg(height), 1) as avg_height
from epl_players
group by position
order by avg_height desc;

-- Q13
-- The Rise of Inverted Wingers
-- As modern football shifted to front-three formations, the percentage of inverted wingers 
-- (Right-footed LW, Left-footed RW) relative to the total players in those positions increased significantly.
with winger_counts as (
	select 
		position, 
		foot, 
		count(distinct case when season between 1992 and 1999 then id end) as qty_90s,
		count(distinct case when season between 2000 and 2009 then id end) as qty_00s,
		count(distinct case when season between 2010 and 2019 then id end) as qty_10s,
		count(distinct case when season >= 2020 then id end) as qty_20s
	from epl_players
	where position in ('Left Winger', 'Right Winger')
	  and foot is not null
	group by position, foot
),
winger_percentages as (
	select 
		position,
		foot,
		qty_90s, round(qty_90s / nullif(sum(qty_90s) over(partition by position), 0) * 100, 2) as pct_90s,
		qty_00s, round(qty_00s / nullif(sum(qty_00s) over(partition by position), 0) * 100, 2) as pct_00s,
		qty_10s, round(qty_10s / nullif(sum(qty_10s) over(partition by position), 0) * 100, 2) as pct_10s,
		qty_20s, round(qty_20s / nullif(sum(qty_20s) over(partition by position), 0) * 100, 2) as pct_20s
	from winger_counts
)
select *
from winger_percentages
where (position = 'Left Winger' and foot = 'right')
   or (position = 'Right Winger' and foot = 'left')
order by position;

-- Q14
-- The Evolution of Left-Footed Centre-Backs
-- Modern football demands more from CBs in build-up play. Left-footed CBs provide better passing angles 
-- on the left side, making their relative percentage increase over time.
with cb_decade_counts as (
	select
		position,
		foot,
		count(distinct case when season between 1992 and 1999 then id end) as qty_90s,
		count(distinct case when season between 2000 and 2009 then id end) as qty_00s,
		count(distinct case when season between 2010 and 2019 then id end) as qty_10s,
		count(distinct case when season >= 2020 then id end) as qty_20s
	from epl_players
	where position = 'Centre-Back' and foot in ('left', 'right')
	group by position, foot
)
select 
	position,
	foot,
	qty_90s, round(qty_90s / nullif(sum(qty_90s) over(partition by position), 0) * 100, 2) as pct_90s,
	qty_00s, round(qty_00s / nullif(sum(qty_00s) over(partition by position), 0) * 100, 2) as pct_00s,
	qty_10s, round(qty_10s / nullif(sum(qty_10s) over(partition by position), 0) * 100, 2) as pct_10s,
	qty_20s, round(qty_20s / nullif(sum(qty_20s) over(partition by position), 0) * 100, 2) as pct_20s
from cb_decade_counts
order by foot desc;


/* =================================================================
   PHASE 4: MARKET VALUE, CLUB & PLAYER ANALYTICS
   Move from descriptive football trends into valuation and business analysis.
   ================================================================= */

-- Q15
-- Market Valuation Coverage by Season
-- Transfermarkt started valuing players robustly from 2004. 
-- Validates data completeness before executing financial analysis.
select 
	season, 
	count(*) as total_players,
	count(market_value) as players_with_valuation,
	round((count(market_value)/count(*))*100, 2) as valuation_coverage_ratio
from epl_players
group by season;

-- Q16
-- EPL Market Value Inflation Over Time (2004-2026)
-- Calculates YoY ratio for Total and Average Player Market Value.
-- Reflects macro financial trends and market booms.
select
	season,
	sum(case when market_value is not null then 1 else 0 end) as total_valuable_player,
	sum(market_value) as total_market_value,
	round((sum(market_value)/sum(case when market_value is not null then 1 else 0 end)),2) as average_player_market_value,
	case when lag(sum(market_value)) over (order by season) is null or season = 2004
		then 0
		else
			round((sum(market_value) - lag(sum(market_value)) over (order by season)) / lag(sum(market_value)) over (order by season) * 100, 2)
	end as total_value_yoy_ratio,
	case when season = 2004
		then 0
		else
			round(
				(
					round((sum(market_value)/sum(case when market_value is not null then 1 else 0 end)),2)
					-
					lag(round((sum(market_value)/sum(case when market_value is not null then 1 else 0 end)),2)) over (order by season)
				)
				/
				lag(round((sum(market_value)/sum(case when market_value is not null then 1 else 0 end)),2)) over (order by season)
				* 100
			, 2)
	end as avg_value_yoy_ratio
from epl_players
where season >= 2004
group by season;

-- Q17
-- Club Longevity & Peak Squad Market Value
-- Identifies each club's "Golden Season" (highest total squad market value).
-- Highlights the single most valuable player during that specific peak season.
with club_longevity as (
	select 
		club,
		count(distinct season) as total_season_played,
		max(case when season = 2026 then 1 else 0 end) as is_active_2026
	from epl_players
	group by club
),
wealth_by_season as (
	select 
		club,
		season,
		sum(market_value) as total_market_value,
		rank() over (partition by club order by sum(market_value) desc) as wealth_rank
	from epl_players
	where market_value is not null
	group by club, season
),
most_valuable_player_per_season as (
	select 
		club,
		season,
		name,
		market_value,
		row_number() over (partition by club, season order by market_value desc) as value_ranking
	from epl_players
	where market_value is not null
)
select 
	cl.club,
	cl.total_season_played,
	wbs.season as peak_value_season,
	wbs.total_market_value,
	mvpps.name as most_valuable_player,
	mvpps.market_value as mvp_market_value,
	cl.is_active_2026
from club_longevity cl
inner join wealth_by_season wbs on cl.club = wbs.club 
left join most_valuable_player_per_season mvpps on mvpps.club = cl.club and mvpps.season = wbs.season
where wbs.wealth_rank = 1 and mvpps.value_ranking = 1
order by cl.total_season_played desc, wbs.total_market_value desc;

-- Q18
-- Peak Player Valuation by Age (Modern Era: 2020-2026)
-- Filters out duplicate entries and removes ages with insufficient sample sizes (< 10 players).
-- Isolates data from 2020 onward to find the absolute peak age of a footballer in the modern era.
with duplicate_filter as (
	select distinct
		id,
		age,
		market_value
	from epl_players
	where market_value is not null
	  and age is not null
	  and season >= 2020
)
select
	age,
	round(avg(market_value)) as avg_market_value
from duplicate_filter
group by age
having count(id) > 10
order by age asc;

-- Q19
-- Player Market Value by Position (Modern Era: 2020-2026)
-- Groups granular positions into macro roles to analyze which areas of the pitch demand the highest financial investment.
with position_combine as ( 
	select 
		case 
			when position in ('Left Winger', 'Right Winger') then 'Winger'
			when position in ('Left-Back', 'Right-Back') then 'Full-Back'
			when position in ('Attacking Midfield', 'Second Striker') then 'Attacking Midfield'
			when position in ('Left Midfield', 'Right Midfield') then 'Wide Midfield'
			else position
		end as macro_position,
		market_value
	from epl_players
	where season >= 2020 
)
select 
	macro_position,
	round(avg(market_value)) as avg_market_value
from position_combine
group by macro_position
order by avg_market_value desc;

-- Q20
-- English Player Market Premium (2021-Present)
-- Dynamically isolates the top 25% (75th percentile) most valuable players to correct for sample size bias (homegrown youth).
-- Observes whether elite English players command a higher premium than their foreign equivalents.
with ranked_value_players as (
	select 
		case when nationality = 'England' then 'England' else 'Others' end as nation_group,
		market_value,
		percent_rank() over (order by market_value) as market_value_rank
	from epl_players
	where season >= 2021 and market_value is not null
)
select 
	nation_group,
	count(*),
	round(avg(market_value)) as avg_market_value
from ranked_value_players
where market_value_rank >= 0.75
group by nation_group
order by avg_market_value;

-- Q21
-- Left-Footed Centre-Back Market Value Comparison (2021-Present)
-- Applies the 75th percentile threshold specifically within the CB population to compare established first-team values.
with ranked_cbs as (
	select
		position,
		foot,
		market_value,
		percent_rank() over (order by market_value) as market_value_rank
	from epl_players
	where season >= 2021 
	  and market_value is not null
	  and position = 'Centre-Back'
	  and foot in ('left', 'right')
)
select
	position,
	foot,
	count(*),
	round(avg(market_value)) as avg_market_value
from ranked_cbs
where market_value_rank >= 0.75 
group by position, foot
order by avg_market_value desc;

-- Q22
-- Breakout Wonderkids — Year-over-Year Value Growth
-- Tracks U23 players who experienced dramatic YoY market value growth, highlighting potential breakout seasons.
with yearly_growth as (
	select
		id,
		name,
		club,
		season,
		age,
		market_value as current_value,
		lag(market_value) over(partition by id order by season) as previous_value
	from epl_players
	where market_value is not null 
)
select
	name,
	club,
	season as breakout_season,
	age,
	previous_value,
	current_value,
	(current_value - previous_value) as value_increase_amount,
	round((current_value - previous_value) / nullif(previous_value, 0) * 100, 2) as growth_pct
from yearly_growth
where previous_value is not null
  and age <= 23
  and (current_value - previous_value) > 0
order by value_increase_amount desc;

-- Q23
-- Domestic Transfer Impact & Intra-League Breakthroughs
-- Enforces a 1-year interval (season - previous_season = 1) to isolate inferred consecutive domestic EPL transfers.
-- Highlights scenarios where a change in club environment coincided with an immediate market value explosion.
with player_timeline as (
	select
		id,
		name,
		season,
		lag(season) over (partition by id order by season) as previous_season,
		club as current_club,
		market_value as current_value,
		lag(club) over(partition by id order by season) as previous_club,
		lag(market_value) over(partition by id order by season) as previous_value
	from epl_players
	where market_value is not null
)
select
	name,
	previous_club,
	current_club,
	season as transfer_season,
	previous_value,
	current_value,
	(current_value - previous_value) as value_increase_amount,
	round((current_value - previous_value) / nullif(previous_value, 0) * 100, 2) as growth_pct
from player_timeline
where previous_club is not null 
  and current_club != previous_club 
  and season - previous_season = 1
order by value_increase_amount desc;

-- Q24
-- Squad Dependency Risk - Big Six Current Season (2026)
-- Evaluates valuation concentration. If a single star holds a disproportionately high % of the squad's total valuation,
-- it indicates potential financial or tactical vulnerability.
with squad_valuations as (
    select 
        club,
        sum(market_value) as total_squad_value,
        max(market_value) as highest_player_value
    from epl_players
    where season = 2026 
      and market_value is not null
      and club in ('Arsenal FC', 'Chelsea FC', 'Liverpool FC', 'Manchester City', 'Manchester United', 'Tottenham Hotspur')
    group by club
),
star_players as (
    select 
        p.club, 
        p.name as key_player,
        p.market_value
    from epl_players p
    inner join squad_valuations s on p.club = s.club and p.market_value = s.highest_player_value
    where p.season = 2026
)
select 
    s.club,
    s.total_squad_value,
    sp.key_player,
    s.highest_player_value,
    round((s.highest_player_value / s.total_squad_value) * 100, 2) as dependency_pct
from squad_valuations s
inner join star_players sp on s.club = sp.club
order by dependency_pct desc;