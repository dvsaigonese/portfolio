-- Team dimension view mapping unique IDs to team names.
create or replace view vw_team_name as
select
	id as team_id,
	team as team_name
from teams;

-- Season calendar dimension extracting integer year keys for chronological sorting.
create or replace view vw_seasons as
select 
	id as season_id,
	season as season_text,
	cast(left(season, 4) as signed) as season_int
from seasons
where cast(left(season, 4) as signed) >= 1992;

-- Macro seasonal team performance tracking attacking, defensive, and discipline metrics.
create or replace view vw_team_season_performance as
select 
    season,
    team,
    w as wins,
    d as draws,
    l as losses,
    (w + d + l) as total_matches,
    round((w / nullif((w + d + l), 0)) * 100, 2) as win_rate_pct,
    gf as goals_for,
    ga as goals_against,
    (gf - ga) as goal_difference,
    pts as points,
    sh as total_shots,
    sot as shots_on_target,
    round((sot / nullif(sh, 0)) * 100, 2) as shot_accuracy_pct,
    cmppct as pass_completion_pct,
    ck as corners,
    crdy as yellow_cards,
    crdr as red_cards,
    fls as fouls,
    og as own_goals
from seasonstats
where cast(left(season, 4) as signed) >= 1992;

-- Unpivoted fixture view providing dual-perspective records for H2H and xG calculations.
create or replace view vw_match_analysis as
with basematches as (
    select 
        id as match_id,
        season,
        date,
        home,
        away,
        home_goals,
        away_goals,
        xg as home_xg,
        `xg.1` as away_xg,
        attendance,
        venue
    from matches
    where cast(left(season, 4) as signed) >= 1992
      and date is not null
)
select 
    match_id,
    season,
    date,
    home as team_name,          
    away as opponent,           
    'Home' as match_location,   
    home_goals as goals_for,
    away_goals as goals_against,
    (home_goals - away_goals) as goal_diff,
    home_xg as xg_for,
    away_xg as xg_against,
    (home_xg - away_xg) as xg_diff,
    case 
        when home_goals > away_goals then 'Win'
        when home_goals < away_goals then 'Loss'
        else 'Draw'
    end as match_result,
    case 
        when home_goals > away_goals then 3
        when home_goals < away_goals then 0
        else 1
    end as points,
    attendance,
    venue
from basematches

union all

select 
    match_id,
    season,
    date,
    away as team_name,          
    home as opponent,           
    'Away' as match_location,   
    away_goals as goals_for,
    home_goals as goals_against,
    (away_goals - home_goals) as goal_diff,
    away_xg as xg_for,
    home_xg as xg_against,
    (away_xg - home_xg) as xg_diff,
    case 
        when away_goals > home_goals then 'Win'
        when away_goals < home_goals then 'Loss'
        else 'Draw'
    end as match_result,
    case 
        when home_goals > away_goals then 0
        when home_goals < away_goals then 3
        else 1
    end as points,
    attendance,
    venue
from basematches;

-- Historical league standings with dynamic ranking based on official tie-breakers.
create or replace view vw_standing as
select
	season,
	team,
	Pts as points,
	W as win,
	D as draw,
	L as lost,
	rank() over (partition by season order by Pts desc, (GF - GA) desc, GF desc) as season_rank
from seasonstats
where cast(left(season, 4) as signed) >= 1992;