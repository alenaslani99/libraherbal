-- =====================================================================
--  Zaključavanje prijave posle previše neuspešnih pokušaja
--  10 promašaja u 15 minuta = email zaključan do isteka tog prozora.
--  Važi i za email adrese bez naloga, da se ne otkrije koje postoje.
-- =====================================================================

CREATE TABLE login_failures (
    email             TEXT    PRIMARY KEY COLLATE NOCASE,
    failures          INTEGER NOT NULL DEFAULT 1 CHECK (failures > 0),
    window_started_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
