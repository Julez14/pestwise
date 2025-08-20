-- Update report_details view to include author_id for permission checks
DROP VIEW IF EXISTS report_details;
CREATE VIEW report_details AS
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
    r.author_id,
    p.name as author_name,
    au.email as author_email,
    COUNT(pf.id) as pest_findings_count
FROM reports r
LEFT JOIN locations l ON r.location_id = l.id
LEFT JOIN profiles p ON r.author_id = p.id
LEFT JOIN auth.users au ON r.author_id = au.id
LEFT JOIN pest_findings pf ON r.id = pf.report_id
GROUP BY r.id, l.name, l.address, r.author_id, p.name, au.email;
