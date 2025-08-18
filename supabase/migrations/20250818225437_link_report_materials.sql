-- Link materials used in reports

INSERT INTO report_materials (report_id, material_id, quantity_used) VALUES
-- Report 1 materials
(1, 1, 2), -- Gel Bait - Cockroach
(1, 5, 4), -- Sticky Traps - Flying Insects

-- Report 2 materials
(2, 2, 3), -- Rodent Bait Stations
(2, 6, 1), -- Exclusion Foam

-- Report 3 materials
(3, 7, 1), -- Sanitizing Solution
(3, 8, 2), -- Monitoring Devices - Multi-Pest

-- Report 4 materials
(4, 3, 1), -- Residual Spray - Ant Control
(4, 7, 1), -- Sanitizing Solution

-- Report 5 materials
(5, 2, 4), -- Rodent Bait Stations
(5, 8, 3)  -- Monitoring Devices - Multi-Pest
ON CONFLICT DO NOTHING;

-- Update material usage counts based on report usage
-- Note: This manual update is needed since we're seeding historical data
-- Future material usage will be automatically tracked by the trigger
UPDATE materials SET usage_count = usage_count + (
    SELECT COALESCE(SUM(quantity_used), 0) 
    FROM report_materials 
    WHERE material_id = materials.id
);
