-- Seed initial locations and their areas

-- Insert locations
INSERT INTO locations (name, address, unit, status, last_inspection) VALUES
('Riverside Apartments', '123 River Street, Downtown', 'Building A', 'active', '2024-01-20'),
('Metro Office Complex', '456 Business Ave, Financial District', 'Floor 12', 'active', '2024-01-18'),
('Sunset Restaurant', '789 Food Court, Mall Plaza', NULL, 'scheduled', '2024-01-15'),
('Green Valley School', '321 Education Blvd, Suburbs', 'Main Building', 'active', '2024-01-10'),
('Harbor Warehouse', '654 Industrial Way, Port District', NULL, 'inactive', '2024-01-05'),
('City Hospital', '987 Medical Center Dr, Healthcare District', 'East Wing', 'active', '2024-01-22')
ON CONFLICT DO NOTHING;

-- Insert location areas
INSERT INTO location_areas (location_id, area_name) VALUES
-- Riverside Apartments areas
(1, 'Kitchen'),
(1, 'Bathroom'),
(1, 'Living Room'),
(1, 'Bedroom'),
(1, 'Balcony'),
(1, 'Storage'),

-- Metro Office Complex areas
(2, 'Reception'),
(2, 'Conference Room'),
(2, 'Kitchen'),
(2, 'Restrooms'),
(2, 'Storage Room'),
(2, 'Server Room'),

-- Sunset Restaurant areas
(3, 'Dining Area'),
(3, 'Kitchen'),
(3, 'Prep Area'),
(3, 'Storage'),
(3, 'Restrooms'),
(3, 'Outdoor Seating'),

-- Green Valley School areas
(4, 'Cafeteria'),
(4, 'Kitchen'),
(4, 'Classrooms'),
(4, 'Gymnasium'),
(4, 'Library'),
(4, 'Restrooms'),
(4, 'Storage'),

-- Harbor Warehouse areas
(5, 'Loading Dock'),
(5, 'Storage Area'),
(5, 'Office'),
(5, 'Break Room'),
(5, 'Restrooms'),

-- City Hospital areas
(6, 'Patient Rooms'),
(6, 'Cafeteria'),
(6, 'Kitchen'),
(6, 'Storage'),
(6, 'Pharmacy'),
(6, 'Restrooms')
ON CONFLICT DO NOTHING;
