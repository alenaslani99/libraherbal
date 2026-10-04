-- =====================================================================
--  Popularnost = prodate jedinice (bez otkazanih porudžbina)
--  v_product_card dobija units_sold i category_slug (za filter ?vrsta=)
-- =====================================================================

CREATE VIEW v_product_sales AS
SELECT oi.product_id,
       SUM(oi.quantity) AS units_sold
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
WHERE o.status <> 'cancelled'
  AND oi.product_id IS NOT NULL
GROUP BY oi.product_id;

DROP VIEW v_product_card;

CREATE VIEW v_product_card AS
SELECT
    p.id, p.name, p.slug, p.weight_label, p.category_id, p.stock,
    c.name AS category_name,
    c.slug AS category_slug,
    cp.regular_price,
    cp.sale_price,
    COALESCE(cp.sale_price, cp.regular_price) AS final_price,
    img.src     AS primary_image,
    img.alt_text AS primary_image_alt,
    COALESCE(r.rating_avg, 0)   AS rating_avg,
    COALESCE(r.rating_count, 0) AS rating_count,
    COALESCE(s.units_sold, 0)   AS units_sold
FROM products p
JOIN categories c                    ON c.id = p.category_id
LEFT JOIN v_product_current_price cp ON cp.product_id = p.id
LEFT JOIN images img                 ON img.product_id = p.id AND img.is_primary = 1
LEFT JOIN v_product_rating r         ON r.product_id = p.id
LEFT JOIN v_product_sales s          ON s.product_id = p.id
WHERE p.is_active = 1;
