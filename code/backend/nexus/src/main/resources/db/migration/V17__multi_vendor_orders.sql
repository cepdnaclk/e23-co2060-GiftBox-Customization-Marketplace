-- V17__multi_vendor_orders.sql
-- Modify orders to support multi-vendor custom boxes (null vendor_id)
ALTER TABLE orders MODIFY COLUMN vendor_id INT NULL;

-- Update Views to use order_items for accurate per-vendor revenue tracking
CREATE OR REPLACE VIEW vendor_daily_revenue AS
SELECT
    p.vendor_id,
    DATE(o.created_at)  AS order_date,
    COUNT(DISTINCT o.order_id)   AS total_orders,
    SUM(oi.subtotal) AS daily_revenue
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE o.status NOT IN ('CANCELLED')
GROUP BY p.vendor_id, DATE(o.created_at);

CREATE OR REPLACE VIEW vendor_weekly_revenue AS
SELECT
    p.vendor_id,
    YEAR(o.created_at)  AS yr,
    WEEK(o.created_at)  AS wk,
    COUNT(DISTINCT o.order_id)   AS total_orders,
    SUM(oi.subtotal) AS weekly_revenue
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE o.status NOT IN ('CANCELLED')
GROUP BY p.vendor_id, YEAR(o.created_at), WEEK(o.created_at);

CREATE OR REPLACE VIEW best_selling_products AS
SELECT
    p.id          AS product_id,
    p.name        AS product_name,
    p.vendor_id,
    SUM(oi.quantity) AS total_sold
FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN orders   o ON oi.order_id   = o.order_id
WHERE o.status NOT IN ('CANCELLED')
GROUP BY p.id, p.name, p.vendor_id
ORDER BY total_sold DESC;

CREATE OR REPLACE VIEW admin_order_overview AS
SELECT
    o.order_id,
    u_c.name    AS customer_name,
    IFNULL(u_p.name, 'Multi-Vendor') AS vendor_name,
    IFNULL(pt.shop_name, 'Multi-Vendor') AS shop_name,
    o.status,
    o.total_amount,
    o.created_at
FROM orders o
JOIN customers c  ON o.customer_id = c.customer_id
JOIN users u_c    ON c.customer_id = u_c.user_id
LEFT JOIN vendors pt   ON o.vendor_id   = pt.vendor_id
LEFT JOIN users u_p    ON pt.vendor_id  = u_p.user_id;
