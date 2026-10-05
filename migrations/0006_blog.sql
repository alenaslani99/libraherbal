-- =====================================================================
--  Blog: objave pišu admini u /admin, telo je Markdown (prikaz: /blog/<slug>)
-- =====================================================================

CREATE TABLE blog_posts (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    slug            TEXT    NOT NULL UNIQUE,        -- /blog/kopriva-u-svakodnevnoj-ishrani
    title           TEXT    NOT NULL,
    description     TEXT    NOT NULL,               -- kratak opis: hero, kartica, Google
    body            TEXT    NOT NULL DEFAULT '',    -- Markdown (::note blokovi dozvoljeni)
    image           TEXT    NOT NULL,               -- naslovna slika (URL ili /assets/...)
    image_alt       TEXT    NOT NULL DEFAULT '',
    tags            TEXT    NOT NULL DEFAULT '[]',  -- JSON niz: ["Ishrana","Med"]
    author          TEXT    NOT NULL DEFAULT 'Libra Herbal tim',
    featured        INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
    status          TEXT    NOT NULL DEFAULT 'draft'
                            CHECK (status IN ('draft', 'published')),
    published_at    TEXT,                           -- 'YYYY-MM-DD', postavlja se pri objavi
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    CHECK (status = 'draft' OR published_at IS NOT NULL)
);
CREATE INDEX idx_blog_posts_published ON blog_posts(status, published_at DESC);

-- "Preporučeni proizvodi" u bočnoj koloni objave
CREATE TABLE blog_post_products (
    post_id         INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    product_id      INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (post_id, product_id)
);
CREATE INDEX idx_blog_post_products_product ON blog_post_products(product_id);
