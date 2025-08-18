-- Seed initial comments and observations
-- Using actual user UUIDs from the created test users

INSERT INTO comments (content, author_id, category, priority, location_detail, report_id) VALUES
('Found evidence of rodent activity in the basement storage area. Recommend immediate treatment and sealing of entry points near the foundation.', 'd123f597-84dc-4494-a8eb-8d9516e57f27', 'Observation', 'high', 'Building A - Basement', 1),
('Customer reported seeing ants in kitchen area. Applied gel bait treatment around sink and baseboards. Follow-up scheduled in 2 weeks.', 'ffcb06fb-3927-4d27-a060-15ae2e5b5bbb', 'Treatment', 'medium', 'Unit 4B - Kitchen', 2),
('Quarterly inspection completed. No pest activity detected. All bait stations checked and refilled as needed.', '107f4a5f-18d6-4480-b290-f0c1a5f3e2f7', 'Inspection', 'low', 'Main Building - Cafeteria', 3),
('Emergency response for wasp nest removal. Nest located under eaves on north side of building. Treatment successful, area secured.', 'a8aa71d0-74b7-4546-8c0d-243ba29bf16d', 'Emergency', 'high', 'Building C - Exterior', 4),
('Preventive treatment applied to storage areas. Checked all monitoring devices - no activity detected. Recommend continued monitoring.', 'd123f597-84dc-4494-a8eb-8d9516e57f27', 'Prevention', 'low', 'Storage Building', 5),
('Customer education provided regarding proper food storage and sanitation practices to prevent future pest issues.', 'ffcb06fb-3927-4d27-a060-15ae2e5b5bbb', 'Education', 'medium', 'Unit 2A', NULL),
('Identified potential entry points around HVAC system. Recommended sealing with exclusion materials. Work order submitted to maintenance.', '107f4a5f-18d6-4480-b290-f0c1a5f3e2f7', 'Recommendation', 'medium', 'Building B - Roof Access', NULL),
('Follow-up inspection after treatment. Significant reduction in pest activity observed. Customer satisfied with results.', 'a8aa71d0-74b7-4546-8c0d-243ba29bf16d', 'Follow-up', 'low', 'Unit 3C', NULL)
ON CONFLICT DO NOTHING;
