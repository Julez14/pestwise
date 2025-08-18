-- Seed reports and pest findings
-- Using actual user UUIDs from the created test users

-- Insert reports with real user UUIDs
INSERT INTO reports (title, description, location_id, unit, author_id, status, comments) VALUES
('Kitchen Inspection - Unit 4B', 'Routine pest inspection in kitchen area', 1, 'Unit 4B', 'd123f597-84dc-4494-a8eb-8d9516e57f27', 'completed', 'All areas checked, minor ant activity detected'),
('Basement Treatment - Building C', 'Follow-up treatment for rodent activity', 5, 'Basement', 'ffcb06fb-3927-4d27-a060-15ae2e5b5bbb', 'in-progress', 'Treatment applied, monitoring required'),
('Quarterly Inspection - Cafeteria', 'Scheduled quarterly pest control inspection', 4, 'Cafeteria', '107f4a5f-18d6-4480-b290-f0c1a5f3e2f7', 'draft', 'Initial inspection notes'),
('Emergency Response - Unit 2A', 'Emergency pest control response call', 1, 'Unit 2A', 'a8aa71d0-74b7-4546-8c0d-243ba29bf16d', 'completed', 'Wasp nest removed successfully'),
('Preventive Treatment - Storage', 'Preventive pest control treatment', 5, 'Storage Area', 'd123f597-84dc-4494-a8eb-8d9516e57f27', 'in-progress', 'Bait stations placed and monitored')
ON CONFLICT DO NOTHING;

-- Insert pest findings for the reports
INSERT INTO pest_findings (report_id, finding_type, target_pest, location_detail, notes) VALUES
-- Report 1 findings
(1, 'sighted', 'Ants', 'Under kitchen sink', 'Small trail observed near water source'),
(1, 'evidence', 'Cockroaches', 'Behind refrigerator', 'Droppings found during inspection'),

-- Report 2 findings
(2, 'captured', 'Rodents', 'Storage room corner', 'Mouse caught in trap, entry point identified'),

-- Report 4 findings
(4, 'sighted', 'Wasps', 'Exterior wall', 'Active nest under eaves'),
(4, 'captured', 'Wasps', 'Nest location', 'Nest removed, area treated'),

-- Report 5 findings
(5, 'evidence', 'Rodents', 'Loading dock', 'Gnaw marks on packaging materials')
ON CONFLICT DO NOTHING;
