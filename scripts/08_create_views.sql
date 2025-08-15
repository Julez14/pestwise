-- Create useful views for the pest control management system

-- View for reports with location and author details
CREATE OR REPLACE VIEW report_details AS
SELECT 
    r.id,
    r.title,
    r.description,
    r.status,
    r.comments,
    r.created_at,
    r.updated_at,
    l.name as location_name,
    l.address as location_address,
    r.unit,
    u.name as author_name,
    u.email as author_email,
    COUNT(pf.id) as pest_findings_count
FROM reports r
LEFT JOIN locations l ON r.location_id = l.id
LEFT JOIN users u ON r.author_id = u.id
LEFT JOIN pest_findings pf ON r.id = pf.report_id
GROUP BY r.id, l.name, l.address, u.name, u.email;

-- View for locations with area counts and report statistics
CREATE OR REPLACE VIEW location_summary AS
SELECT 
    l.id,
    l.name,
    l.address,
    l.unit,
    l.status,
    l.last_inspection,
    COUNT(DISTINCT la.id) as area_count,
    COUNT(DISTINCT r.id) as total_reports,
    COUNT(DISTINCT CASE WHEN pf.id IS NOT NULL THEN r.id END) as reports_with_findings
FROM locations l
LEFT JOIN location_areas la ON l.id = la.location_id
LEFT JOIN reports r ON l.id = r.location_id
LEFT JOIN pest_findings pf ON r.id = pf.report_id
GROUP BY l.id, l.name, l.address, l.unit, l.status, l.last_inspection;

-- View for material usage statistics
CREATE OR REPLACE VIEW material_usage_stats AS
SELECT 
    m.id,
    m.name,
    m.material_group,
    m.in_stock,
    m.usage_count,
    m.last_used,
    COUNT(DISTINCT rm.report_id) as reports_used_in,
    COALESCE(SUM(rm.quantity_used), 0) as total_quantity_used
FROM materials m
LEFT JOIN report_materials rm ON m.id = rm.material_id
GROUP BY m.id, m.name, m.material_group, m.in_stock, m.usage_count, m.last_used;

-- View for pest findings summary
CREATE OR REPLACE VIEW pest_findings_summary AS
SELECT 
    pf.target_pest,
    pf.finding_type,
    COUNT(*) as occurrence_count,
    COUNT(DISTINCT pf.report_id) as reports_affected,
    COUNT(DISTINCT r.location_id) as locations_affected,
    MAX(pf.created_at) as last_occurrence
FROM pest_findings pf
JOIN reports r ON pf.report_id = r.id
GROUP BY pf.target_pest, pf.finding_type
ORDER BY occurrence_count DESC;
