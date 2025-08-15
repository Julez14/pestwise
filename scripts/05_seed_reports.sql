-- Seed initial reports with pest findings

-- Insert reports
INSERT INTO reports (title, description, location_id, unit, author_id, status, comments) VALUES
('Kitchen Inspection - Unit 4B', 'Routine pest inspection in kitchen area', 1, 'Unit 4B', 1, 'completed', 'All areas checked, minor ant activity detected'),
('Basement Treatment - Building C', 'Follow-up treatment for rodent activity', 5, 'Basement', 2, 'in-progress', 'Treatment applied, monitoring required'),
('Quarterly Inspection - Cafeteria', 'Scheduled quarterly pest control inspection', 4, 'Cafeteria', 3, 'draft', 'Initial inspection notes'),
('Emergency Response - Unit 2A', 'Emergency pest control response call', 1, 'Unit 2A', 4, 'completed', 'Wasp nest removed successfully'),
('Preventive Treatment - Storage', 'Preventive pest control treatment', 5, 'Storage Area', 1, 'in-progress', 'Bait stations placed and monitored')
ON CONFLICT DO NOTHING;

-- Insert pest findings for the reports
INSERT INTO pest_findings (report_id, finding_type, target_pest, location_detail, notes) VALUES
-- Report 1 findings
(1, 'sighted', 'Ants', 'Under kitchen sink', 'Small trail observed near water source'),
(1, 'evidence', 'Cockroaches', 'Behind refrigerator', 'Droppings found during inspection'),

-- Report 2 findings
(2, 'captured', 'Rodents', 'Storage room corner', 'Mouse caught in trap, entry point identified'),

-- Report 4 findings
(3, 'sighted', 'Wasps', 'Exterior wall', 'Active nest under eaves'),
(3, 'captured', 'Wasps', 'Nest location', 'Nest removed, area treated'),

-- Report 5 findings
(4, 'evidence', 'Rodents', 'Loading dock', 'Gnaw marks on packaging materials')
ON CONFLICT DO NOTHING;
