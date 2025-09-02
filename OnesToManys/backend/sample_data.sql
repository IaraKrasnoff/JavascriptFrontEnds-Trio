-- Sample data for OnesToManys project
INSERT INTO master (id, name) VALUES (1, 'Master 1'), (2, 'Master 2');
INSERT INTO detail (id, master_id, description) VALUES (1, 1, 'Detail 1 for Master 1'), (2, 1, 'Detail 2 for Master 1'), (3, 2, 'Detail 1 for Master 2');
