-- =====================================================================
--  Newsletter prijave, utisci kupaca ("Uspešne priče") i red čekanja recenzija
-- =====================================================================

-- Prijave sa forme u footeru, sekcije "Newsletter" i registracije.
-- status: 'unsubscribed' čuva adresu da se ne bi ponovo slala pošta (odjava preko linka iz mejla, kasnije).
CREATE TABLE newsletter_subscribers (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    email           TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    source          TEXT    NOT NULL CHECK (source IN ('footer', 'section', 'register')),
    user_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status          TEXT    NOT NULL DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed')),
    unsubscribed_at TEXT,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_newsletter_status_created ON newsletter_subscribers(status, created_at DESC);

-- dosadašnje prijave iz registracije (users.newsletter)
INSERT INTO newsletter_subscribers (email, source, user_id, created_at)
SELECT email, 'register', id, created_at FROM users WHERE newsletter = 1;

-- "Uspešne priče" na početnoj: admin ih piše i ređa, prikazuju se prva 3 aktivna
CREATE TABLE testimonials (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    author          TEXT    NOT NULL CHECK (length(author) <= 60),
    text            TEXT    NOT NULL CHECK (length(text) <= 400),
    rating          INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
    is_active       INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_testimonials_active ON testimonials(is_active, sort_order);

INSERT INTO testimonials (author, text, rating, sort_order) VALUES
  ('Milica', 'Osetila sam znatnu razliku u energiji posle nekoliko nedelja pijenja čaja s kašikom meda.', 4, 1),
  ('Petar',  'Nakon nekoliko nedelja korišćenja, primetio sam porast energije. Ukus je prijatan, čaj neizostavan deo života.', 3, 2),
  ('Jelena', 'Med mi je rešio sve probleme koje sam imala sa urinarnom inkontinencijom!', 5, 3);

-- recenzije: red čekanja u adminu (najnovije neodobrene)
CREATE INDEX idx_reviews_approval ON reviews(is_approved, created_at DESC);
