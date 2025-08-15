-- Seed initial users for the pest control management system

INSERT INTO users (email, password_hash, name, role) VALUES
('john.doe@pestcontrol.com', '$2b$10$example_hash_1', 'John Doe', 'technician'),
('sarah.johnson@pestcontrol.com', '$2b$10$example_hash_2', 'Sarah Johnson', 'supervisor'),
('mike.chen@pestcontrol.com', '$2b$10$example_hash_3', 'Mike Chen', 'technician'),
('emily.davis@pestcontrol.com', '$2b$10$example_hash_4', 'Emily Davis', 'manager'),
('admin@pestcontrol.com', '$2b$10$example_hash_5', 'System Admin', 'admin')
ON CONFLICT (email) DO NOTHING;
