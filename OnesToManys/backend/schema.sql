-- SQL schema for OnesToManys project
-- Master table example
CREATE TABLE master (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
);

-- Detail table example
CREATE TABLE detail (
    id INTEGER PRIMARY KEY,
    master_id INTEGER,
    description TEXT,
    FOREIGN KEY(master_id) REFERENCES master(id)
);
