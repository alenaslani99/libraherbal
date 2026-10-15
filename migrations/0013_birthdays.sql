-- =====================================================================
--  Rođendan korisnika (rođendanski email sa kodom za popust, cron svaki dan u 12h)
-- =====================================================================

-- YYYY-MM-DD. Unosi se pri registraciji i posle se ne menja.
-- Postojeći nalozi dobijaju 2000-01-01.
ALTER TABLE users ADD COLUMN birth_date TEXT NOT NULL DEFAULT '2000-01-01'
    CHECK (birth_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]');

-- dnevni cron traži korisnike po mesecu i danu rođenja
CREATE INDEX idx_users_birthday ON users(substr(birth_date, 6, 5));
