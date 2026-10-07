-- =====================================================================
--  Sadržaj sajta koji admin menja (za sada: hero na početnoj)
-- =====================================================================

-- Jedan red po bloku; value je JSON koji proverava zod šema u shared/schemas/site.ts.
-- Dok red ne postoji, sajt prikazuje podrazumevani tekst (server/utils/site.ts).
CREATE TABLE site_settings (
    key             TEXT    PRIMARY KEY,
    value           TEXT    NOT NULL CHECK (json_valid(value)),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);
