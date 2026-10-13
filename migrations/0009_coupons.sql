-- =====================================================================
--  Kodovi za popust (dobrodošlica, kasnije rođendan) + popust na porudžbini
-- =====================================================================

-- Svaki kod je jedinstven, važi jednom i do expires_at. Kod je sam po sebi tajna:
-- može se iskoristiti i bez prijave (kupovina kao gost).
CREATE TABLE coupons (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    code            TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    kind            TEXT    NOT NULL CHECK (kind IN ('welcome', 'birthday')),
    percent         INTEGER NOT NULL CHECK (percent BETWEEN 1 AND 100),
    user_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
    expires_at      TEXT    NOT NULL,
    used_at         TEXT,
    order_id        INTEGER REFERENCES orders(id) ON DELETE SET NULL,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_coupons_user ON coupons(user_id, kind);

-- popust u parama (umanjuje međuzbir); total = subtotal - discount + shipping_cost
ALTER TABLE orders ADD COLUMN discount INTEGER NOT NULL DEFAULT 0 CHECK (discount >= 0);
ALTER TABLE orders ADD COLUMN coupon_code TEXT;
