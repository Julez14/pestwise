-- Seed initial comments and observations

INSERT INTO comments (content, author_id, category, priority, location_detail, report_id) VALUES
('Found evidence of rodent activity in the basement storage area. Recommend immediate treatment and sealing of entry points near the foundation.', 1, 'Observation', 'high', 'Building A - Basement', 1),
('Customer reported seeing ants in kitchen area. Applied gel bait treatment around sink and baseboards. Follow-up scheduled in 2 weeks.', 2, 'Treatment', 'medium', 'Unit 4B - Kitchen', 2),
('Quarterly inspection completed. No pest activity detected. All bait stations checked and refilled as needed.', 3, 'Inspection', 'low', 'Main Building - Cafeteria', 3),
('Emergency response for wasp nest removal. Nest located under eaves on north side of building. Treatment successful, area secured.', 4, 'Emergency', 'high', 'Building C - Exterior', 4),
('Preventive treatment applied to storage areas. Checked all monitoring devices - no activity detected. Recommend continued monitoring.', 1, 'Prevention', 'low', 'Storage Building', 5),
('Customer education provided regarding proper food storage and sanitation practices to prevent future pest issues.', 2, 'Education', 'medium', 'Unit 2A', NULL),
('Identified potential entry points around HVAC system. Recommended sealing with exclusion materials. Work order submitted to maintenance.', 3, 'Recommendation', 'medium', 'Building B - Roof Access', NULL),
('Follow-up inspection after treatment. Significant reduction in pest activity observed. Customer satisfied with results.', 4, 'Follow-up', 'low', 'Unit 3C', NULL)
ON CONFLICT DO NOTHING;
