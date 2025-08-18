-- Update location statistics based on reports
UPDATE locations SET 
    last_inspection = (
        SELECT MAX(r.created_at::date)
        FROM reports r 
        WHERE r.location_id = locations.id 
        AND r.status = 'completed'
    )
WHERE EXISTS (
    SELECT 1 FROM reports r 
    WHERE r.location_id = locations.id 
    AND r.status = 'completed'
);

-- Update material last_used dates based on report usage
UPDATE materials SET 
    last_used = (
        SELECT MAX(r.created_at::date)
        FROM report_materials rm
        JOIN reports r ON rm.report_id = r.id
        WHERE rm.material_id = materials.id
    )
WHERE EXISTS (
    SELECT 1 FROM report_materials rm 
    WHERE rm.material_id = materials.id
);

-- Create a function to automatically update material usage when reports are created
CREATE OR REPLACE FUNCTION update_material_usage()
RETURNS TRIGGER AS $$
BEGIN
    -- Update usage count for materials used in the report
    UPDATE materials 
    SET usage_count = usage_count + NEW.quantity_used,
        last_used = CURRENT_DATE
    WHERE id = NEW.material_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update material usage
DROP TRIGGER IF EXISTS trigger_update_material_usage ON report_materials;
CREATE TRIGGER trigger_update_material_usage
    AFTER INSERT ON report_materials
    FOR EACH ROW
    EXECUTE FUNCTION update_material_usage();
