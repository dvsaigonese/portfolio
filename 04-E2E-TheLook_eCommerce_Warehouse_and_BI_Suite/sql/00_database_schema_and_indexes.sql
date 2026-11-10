create database if not exists thelook_ecommerce;
use thelook_ecommerce;

drop table if exists dim_distribution_centers;
create table dim_distribution_centers (
    distribution_center_id int primary key,
    name varchar(255),
    latitude decimal(10, 6),
    longitude decimal(10, 6)
) engine=innodb;

drop table if exists dim_products;
create table dim_products (
    product_id int primary key,
    cost decimal(10, 2),
    category varchar(100),
    name varchar(255),
    brand varchar(100),
    retail_price decimal(10, 2),
    department varchar(50),
    sku varchar(100),
    distribution_center_id int,
    index idx_prod_dc (distribution_center_id),
    index idx_prod_cat (category)
) engine=innodb;

drop table if exists dim_users;
create table dim_users (
    user_id int primary key,
    first_name varchar(100),
    last_name varchar(100),
    email varchar(255),
    age int,
    gender varchar(10),
    state varchar(100),
    street_address varchar(255),
    postal_code varchar(50),
    city varchar(100),
    country varchar(100),
    latitude decimal(10, 6),
    longitude decimal(10, 6),
    traffic_source varchar(50),
    created_at datetime,
    index idx_user_country (country),
    index idx_user_created (created_at)
) engine=innodb;

drop table if exists fact_orders;
create table fact_orders (
    order_id int primary key,
    user_id int,
    status varchar(50),
    gender varchar(10),
    created_at datetime,
    returned_at datetime,
    shipped_at datetime,
    delivered_at datetime,
    num_of_item int,
    index idx_orders_user (user_id),
    index idx_orders_status (status),
    index idx_orders_created (created_at)
) engine=innodb;

drop table if exists fact_order_items;
create table fact_order_items (
    order_item_id int primary key,
    order_id int,
    user_id int,
    product_id int,
    inventory_item_id int,
    status varchar(50),
    created_at datetime,
    shipped_at datetime,
    delivered_at datetime,
    returned_at datetime,
    sale_price decimal(10, 2),
    index idx_items_order (order_id),
    index idx_items_user (user_id),
    index idx_items_product (product_id),
    index idx_items_status (status)
) engine=innodb;

drop table if exists fact_sessions;
create table fact_sessions (
    session_id varchar(100) primary key,
    user_id int,
    session_start datetime,
    session_end datetime,
    browser varchar(50),
    traffic_source varchar(50),
    has_home tinyint,
    has_department tinyint,
    has_product tinyint,
    has_cart tinyint,
    has_purchase tinyint,
    total_events int,
    duration_seconds double,
    index idx_sess_user (user_id),
    index idx_sess_traffic (traffic_source)
) engine=innodb;
