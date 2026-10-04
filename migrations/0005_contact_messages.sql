-- =====================================================================
--  Poruke sa /kontakt forme (admin ih kasnije čita i označava)
-- =====================================================================

CREATE TABLE contact_messages (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,  -- NULL = gost
    name            TEXT    NOT NULL,
    email           TEXT    NOT NULL COLLATE NOCASE,
    phone           TEXT,
    message         TEXT    NOT NULL CHECK (length(message) <= 1000),
    status          TEXT    NOT NULL DEFAULT 'new'
                            CHECK (status IN ('new', 'read', 'answered')),
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_contact_messages_status ON contact_messages(status, created_at DESC);
