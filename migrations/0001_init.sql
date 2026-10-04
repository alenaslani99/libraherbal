-- =====================================================================
--  Herbalife shop – D1 (SQLite) šema  v2
--  Konvencije:
--    * Novac je INTEGER u parama (1 RSD = 100).
--    * Datumi su TEXT u UTC formatu 'YYYY-MM-DD HH:MM:SS'.
--    * Boolean = INTEGER 0/1.
--    * Sve tabele imaju created_at i updated_at (updated_at postavlja aplikacija).
-- =====================================================================

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------
--  AUTH
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    email           TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    password_hash   TEXT    NOT NULL,
    first_name      TEXT,
    last_name       TEXT,
    phone           TEXT,
    role            TEXT    NOT NULL DEFAULT 'customer'
                            CHECK (role IN ('customer', 'admin')),
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE sessions (
    id              TEXT    PRIMARY KEY,            -- SHA-256 hash tokena
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at      TEXT    NOT NULL,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- ---------------------------------------------------------------------
--  KATALOG
-- ---------------------------------------------------------------------
CREATE TABLE categories (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_id       INTEGER REFERENCES categories(id) ON DELETE RESTRICT,
    name            TEXT    NOT NULL,
    slug            TEXT    NOT NULL UNIQUE,        -- /proizvodi/med
    is_active       INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    CHECK (parent_id IS NULL OR parent_id <> id)
);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- Lookup: Svrha (Imunitet, Krvna slika, Varenje, Energija, Smirenje)
CREATE TABLE purposes (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    slug            TEXT    NOT NULL UNIQUE,        -- ?svrha=imunitet
    sort_order      INTEGER NOT NULL DEFAULT 0,     -- redosled u filteru
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE products (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id         INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name                TEXT    NOT NULL,
    slug                TEXT    NOT NULL UNIQUE,
    description         TEXT,
    usage_instructions  TEXT,                       -- Način upotrebe
    nutrition_info      TEXT,                       -- Nutritivna vrednost
    weight_label        TEXT,                       -- '500g', '100g'
    stock               INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    is_active           INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at          TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at          TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);

-- Proizvod <-> svrha (proizvod može imati više svrha)
CREATE TABLE product_purposes (
    product_id      INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    purpose_id      INTEGER NOT NULL REFERENCES purposes(id) ON DELETE RESTRICT,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (product_id, purpose_id)
);
CREATE INDEX idx_product_purposes_purpose ON product_purposes(purpose_id);

-- Lookup: Sastojci
CREATE TABLE ingredients (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    description     TEXT,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE product_ingredients (
    product_id      INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    ingredient_id   INTEGER NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
    sort_order      INTEGER NOT NULL DEFAULT 0,     -- 01 / 02 / 03
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (product_id, ingredient_id)
);
CREATE INDEX idx_product_ingredients_ingredient ON product_ingredients(ingredient_id);

-- Istorija cena. Trenutna = najnoviji red po created_at.
CREATE TABLE prices (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id      INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    price           INTEGER NOT NULL CHECK (price >= 0),
    sale_price      INTEGER CHECK (sale_price IS NULL OR (sale_price >= 0 AND sale_price < price)),
    sale_starts_at  TEXT,
    sale_ends_at    TEXT,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    CHECK (sale_ends_at IS NULL OR sale_starts_at IS NULL OR sale_ends_at > sale_starts_at)
);
CREATE INDEX idx_prices_current ON prices(product_id, created_at DESC, id DESC);

CREATE TABLE images (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id      INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    src             TEXT    NOT NULL,
    alt_text        TEXT,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    is_primary      INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0, 1)),
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_images_product ON images(product_id, sort_order);
CREATE UNIQUE INDEX uq_images_primary ON images(product_id) WHERE is_primary = 1;

CREATE TABLE reviews (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id      INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating          INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment         TEXT,
    is_approved     INTEGER NOT NULL DEFAULT 0 CHECK (is_approved IN (0, 1)),
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE (product_id, user_id)
);
CREATE INDEX idx_reviews_product ON reviews(product_id, is_approved);

-- ---------------------------------------------------------------------
--  KURIRANJE (owner bira šta se prikazuje)
-- ---------------------------------------------------------------------
-- "Popularni artikli" na početnoj
CREATE TABLE popular_products (
    product_id      INTEGER PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- "Preporučeni proizvodi" ispod konkretnog proizvoda
CREATE TABLE product_recommendations (
    product_id              INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    recommended_product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sort_order              INTEGER NOT NULL DEFAULT 0,
    created_at              TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at              TEXT    NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (product_id, recommended_product_id),
    CHECK (product_id <> recommended_product_id)
);
CREATE INDEX idx_product_recommendations_rec ON product_recommendations(recommended_product_id);

-- ---------------------------------------------------------------------
--  PORUDŽBINE
-- ---------------------------------------------------------------------
CREATE TABLE orders (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number    TEXT    NOT NULL UNIQUE,
    user_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,  -- NULL = guest

    status          TEXT    NOT NULL DEFAULT 'received'
                            CHECK (status IN ('received','preparing','in_transit','delivered','cancelled')),
    received_at     TEXT    NOT NULL DEFAULT (datetime('now')),
    preparing_at    TEXT,
    in_transit_at   TEXT,
    delivered_at    TEXT,
    cancelled_at    TEXT,

    first_name      TEXT    NOT NULL,
    last_name       TEXT    NOT NULL,
    email           TEXT    NOT NULL COLLATE NOCASE,
    phone           TEXT    NOT NULL,
    city            TEXT    NOT NULL,
    address         TEXT    NOT NULL,
    postal_code     TEXT    NOT NULL,
    note            TEXT    CHECK (note IS NULL OR length(note) <= 500),

    payment_method  TEXT    NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod')),

    subtotal        INTEGER NOT NULL CHECK (subtotal >= 0),
    shipping_cost   INTEGER NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
    total           INTEGER NOT NULL CHECK (total >= 0),
    currency        TEXT    NOT NULL DEFAULT 'RSD',

    admin_note      TEXT,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status_created ON orders(status, created_at DESC);
CREATE INDEX idx_orders_email ON orders(email);

CREATE TABLE order_items (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id        INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id      INTEGER REFERENCES products(id) ON DELETE SET NULL,
    product_name    TEXT    NOT NULL,
    unit_price      INTEGER NOT NULL CHECK (unit_price >= 0),
    regular_price   INTEGER NOT NULL CHECK (regular_price >= 0),
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    line_total      INTEGER NOT NULL CHECK (line_total >= 0),
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ---------------------------------------------------------------------
--  VIEW-ovi
-- ---------------------------------------------------------------------
CREATE VIEW v_product_current_price AS
SELECT
    product_id,
    price AS regular_price,
    CASE
        WHEN sale_price IS NOT NULL
         AND (sale_starts_at IS NULL OR sale_starts_at <= datetime('now'))
         AND (sale_ends_at   IS NULL OR sale_ends_at   >  datetime('now'))
        THEN sale_price
    END AS sale_price,
    sale_ends_at
FROM (
    SELECT p.*,
           ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY created_at DESC, id DESC) AS rn
    FROM prices p
)
WHERE rn = 1;

CREATE VIEW v_product_rating AS
SELECT product_id,
       ROUND(AVG(rating), 1) AS rating_avg,
       COUNT(*)              AS rating_count
FROM reviews
WHERE is_approved = 1
GROUP BY product_id;

-- Kartica proizvoda: "MED • 500g", naziv, cena, slika
CREATE VIEW v_product_card AS
SELECT
    p.id, p.name, p.slug, p.weight_label, p.category_id, p.stock,
    c.name AS category_name,
    cp.regular_price,
    cp.sale_price,
    COALESCE(cp.sale_price, cp.regular_price) AS final_price,
    img.src     AS primary_image,
    img.alt_text AS primary_image_alt,
    COALESCE(r.rating_avg, 0)   AS rating_avg,
    COALESCE(r.rating_count, 0) AS rating_count
FROM products p
JOIN categories c                    ON c.id = p.category_id
LEFT JOIN v_product_current_price cp ON cp.product_id = p.id
LEFT JOIN images img                 ON img.product_id = p.id AND img.is_primary = 1
LEFT JOIN v_product_rating r         ON r.product_id = p.id
WHERE p.is_active = 1;

-- =====================================================================
--  Primeri upita
-- =====================================================================
-- Popularni artikli (početna):
--   SELECT v.* FROM popular_products pp
--   JOIN v_product_card v ON v.id = pp.product_id
--   ORDER BY pp.sort_order LIMIT 4;
--
-- Preporučeni ispod proizvoda ?1:
--   SELECT v.* FROM product_recommendations pr
--   JOIN v_product_card v ON v.id = pr.recommended_product_id
--   WHERE pr.product_id = ?1
--   ORDER BY pr.sort_order LIMIT 4;
--
-- Filter po kategoriji (sa podkategorijama) i svrsi:
--   WITH RECURSIVE tree(id) AS (
--     SELECT id FROM categories WHERE slug = ?1
--     UNION ALL
--     SELECT c.id FROM categories c JOIN tree t ON c.parent_id = t.id
--   )
--   SELECT v.* FROM v_product_card v
--   WHERE v.category_id IN (SELECT id FROM tree)
--     AND (?2 IS NULL OR v.id IN (
--           SELECT pp.product_id FROM product_purposes pp
--           JOIN purposes pu ON pu.id = pp.purpose_id
--           WHERE pu.slug = ?2));
--
-- Promena statusa (status + odgovarajući timestamp zajedno):
--   UPDATE orders SET status = 'in_transit', in_transit_at = datetime('now'),
--                     updated_at = datetime('now')
--   WHERE id = ?1;
