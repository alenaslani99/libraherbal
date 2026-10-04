-- =====================================================================
--  Nalozi: saglasnosti pri registraciji + trajanje sesije
-- =====================================================================

-- Newsletter (opciono) i dokaz da je korisnik prihvatio uslove (ZZPL / GDPR)
ALTER TABLE users ADD COLUMN newsletter INTEGER NOT NULL DEFAULT 0 CHECK (newsletter IN (0, 1));
ALTER TABLE users ADD COLUMN terms_accepted_at TEXT;

-- "Zapamti me": 1 = 30 dana, 0 = 1 dan (sesija se produžava dok je korisnik aktivan)
ALTER TABLE sessions ADD COLUMN remember INTEGER NOT NULL DEFAULT 0 CHECK (remember IN (0, 1));
