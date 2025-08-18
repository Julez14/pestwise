-- Seed initial materials for pest control operations

INSERT INTO materials (name, description, material_group, in_stock, usage_count, last_used) VALUES
('Gel Bait - Cockroach', 'Professional grade gel bait for cockroach control', 'Baits', true, 15, '2024-01-20'),
('Rodent Bait Stations', 'Tamper-resistant bait stations for rodent control', 'Bait Stations', true, 8, '2024-01-19'),
('Residual Spray - Ant Control', 'Long-lasting residual spray for ant treatment', 'Sprays', false, 12, '2024-01-15'),
('Dust Treatment - Crack & Crevice', 'Insecticidal dust for hard-to-reach areas', 'Dusts', true, 6, '2024-01-18'),
('Sticky Traps - Flying Insects', 'Non-toxic sticky traps for monitoring flying insects', 'Traps', true, 20, '2024-01-17'),
('Exclusion Foam', 'Expanding foam for sealing entry points', 'Exclusion Materials', true, 4, '2024-01-16'),
('Sanitizing Solution', 'EPA-approved sanitizer for treatment areas', 'Sanitizers', true, 25, '2024-01-20'),
('Monitoring Devices - Multi-Pest', 'Electronic monitoring devices for various pests', 'Monitoring', false, 3, '2024-01-14'),
('Liquid Bait - Ant Control', 'Sweet liquid bait for ant colonies', 'Baits', true, 10, '2024-01-19'),
('Rodent Snap Traps', 'Traditional snap traps for rodent control', 'Traps', true, 7, '2024-01-16'),
('Perimeter Spray', 'Outdoor perimeter treatment spray', 'Sprays', true, 9, '2024-01-18'),
('Boric Acid Powder', 'Natural insecticidal powder', 'Dusts', true, 5, '2024-01-15')
ON CONFLICT DO NOTHING;
