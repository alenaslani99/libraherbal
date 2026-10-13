-- =====================================================================
--  Korpa prijavljenog korisnika (za podsetnik o napuštenoj korpi)
-- =====================================================================

-- Jedna korpa po korisniku. updated_at se menja samo kad se stavke zaista promene
-- (cron za napuštenu korpu računa od njega). Prazna korpa se briše zajedno sa stavkama.
CREATE TABLE carts (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_carts_updated ON carts(updated_at);

-- Samo proizvod i količina: cene se uvek čitaju iz products, nikad iz korpe.
CREATE TABLE cart_items (
    cart_id         INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id      INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity        INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 99),
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (cart_id, product_id)
) WITHOUT ROWID;
