-- =====================================================================
--  Pregledani proizvodi prijavljenih korisnika (za podsetnik o pregledanim proizvodima)
-- =====================================================================

-- Jedan red po korisniku i proizvodu: ponovni pregled samo pomera viewed_at (najviše jednom u 6 h),
-- pa tabela ne raste sa svakim otvaranjem stranice. Cron briše redove starije od 30 dana.
CREATE TABLE product_views (
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id      INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    viewed_at       TEXT    NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, product_id)
) WITHOUT ROWID;
CREATE INDEX idx_product_views_viewed ON product_views(viewed_at);
