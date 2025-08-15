-- Pest Control Management System Database Schema
-- This script creates all the necessary tables for the application

-- Users table for authentication and user management
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'technician',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Locations table for service locations
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    unit VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    last_inspection DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Location areas table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS location_areas (
    id SERIAL PRIMARY KEY,
    location_id INTEGER REFERENCES locations(id) ON DELETE CASCADE,
    area_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Materials table for pest control materials
CREATE TABLE IF NOT EXISTS materials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    material_group VARCHAR(255) NOT NULL,
    in_stock BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    last_used DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reports table for pest control reports
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location_id INTEGER REFERENCES locations(id),
    unit VARCHAR(255),
    author_id INTEGER REFERENCES users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pest findings table linked to reports
CREATE TABLE IF NOT EXISTS pest_findings (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
    finding_type VARCHAR(50) NOT NULL, -- 'captured', 'sighted', 'evidence'
    target_pest VARCHAR(255) NOT NULL,
    location_detail VARCHAR(255) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for report materials (many-to-many)
CREATE TABLE IF NOT EXISTS report_materials (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
    material_id INTEGER REFERENCES materials(id),
    quantity_used INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments table for general observations and notes
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    author_id INTEGER REFERENCES users(id),
    category VARCHAR(255) NOT NULL,
    priority VARCHAR(50) NOT NULL DEFAULT 'medium',
    location_detail VARCHAR(255),
    report_id INTEGER REFERENCES reports(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_location ON reports(location_id);
CREATE INDEX IF NOT EXISTS idx_reports_author ON reports(author_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_pest_findings_report ON pest_findings(report_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_category ON comments(category);
CREATE INDEX IF NOT EXISTS idx_location_areas_location ON location_areas(location_id);
CREATE INDEX IF NOT EXISTS idx_materials_group ON materials(material_group);
CREATE INDEX IF NOT EXISTS idx_materials_stock ON materials(in_stock);
