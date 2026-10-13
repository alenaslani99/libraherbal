-- =====================================================================
--  Podsetnici: napuštena korpa i pregledani proizvodi (cron svakog sata)
-- =====================================================================

-- Podsetnike dobijaju svi registrovani korisnici; 0 = odjavio se linkom iz emaila.
ALTER TABLE users ADD COLUMN reminder_emails INTEGER NOT NULL DEFAULT 1 CHECK (reminder_emails IN (0, 1));
-- Nasumičan token za link "odjavi se" (bez prijave); pravi se pri prvom podsetniku.
ALTER TABLE users ADD COLUMN unsubscribe_token TEXT;
CREATE UNIQUE INDEX idx_users_unsubscribe_token ON users(unsubscribe_token);

-- Svaki poslat podsetnik: na osnovu ovoga cron ne šalje isti podsetnik dvaput i poštuje razmake
-- (korpa najviše 1 u 7 dana, pregledani 1 u 14 dana, bilo koji podsetnik 1 u 3 dana).
-- kind: 'cart' | 'browse' (kasnije i drugi, zato bez CHECK)
CREATE TABLE email_sends (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind            TEXT    NOT NULL,
    resend_id       TEXT,
    sent_at         TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_email_sends_user ON email_sends(user_id, kind, sent_at);
CREATE INDEX idx_email_sends_sent ON email_sends(sent_at);
