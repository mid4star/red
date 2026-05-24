-- Database Schema for Environmental Impact Assessment (EIA) Module
-- Compatible with MySQL and PostgreSQL

-- 1. Costs Department Table
CREATE TABLE IF NOT EXISTS eia_costs (
    id VARCHAR(36) PRIMARY KEY,
    subject VARCHAR(255) NOT NULL,
    details TEXT NOT NULL,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'UNANSWERED', -- 'UNANSWERED', 'ANSWERED'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Index for costs status and date for sorting and filtering
CREATE INDEX idx_eia_costs_status_date ON eia_costs(status, date);

-- 2. Cost Attachments Table (supports multiple files per cost)
CREATE TABLE IF NOT EXISTS eia_cost_files (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(512) NOT NULL,
    cost_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (cost_id) REFERENCES eia_costs(id) ON DELETE CASCADE
);

CREATE INDEX idx_eia_cost_files_cost ON eia_cost_files(cost_id);

-- 3. Inspections Department Table
CREATE TABLE IF NOT EXISTS eia_inspections (
    id VARCHAR(36) PRIMARY KEY,
    location_name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    date TIMESTAMP NOT NULL,
    inspector_name VARCHAR(255) NOT NULL,
    study_file_url VARCHAR(512),
    report_file_url VARCHAR(512),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Index for geographical queries, dates, and filtering by inspector
CREATE INDEX idx_eia_inspections_coords ON eia_inspections(latitude, longitude);
CREATE INDEX idx_eia_inspections_date ON eia_inspections(date);
CREATE INDEX idx_eia_inspections_inspector ON eia_inspections(inspector_name);

-- 4. Violations Department Table
CREATE TABLE IF NOT EXISTS eia_violations (
    id VARCHAR(36) PRIMARY KEY,
    type VARCHAR(255) NOT NULL, -- e.g., 'ردم وتغير في حرم الشاطئ', 'سقالات ومباني', 'إنشاءات'
    date TIMESTAMP NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- 'PROJECT' or 'PERSON'
    entity_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indexes for searching and GIS integration
CREATE INDEX idx_eia_violations_type ON eia_violations(type);
CREATE INDEX idx_eia_violations_date ON eia_violations(date);
CREATE INDEX idx_eia_violations_coords ON eia_violations(latitude, longitude);

-- 5. Accidents Department Table
CREATE TABLE IF NOT EXISTS eia_accidents (
    id VARCHAR(36) PRIMARY KEY,
    type VARCHAR(255) NOT NULL, -- e.g., 'حوادث شحط أو ربط على الشعاب', 'تلوث بترولي', 'حرائق'
    location_name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    date TIMESTAMP NOT NULL,
    description TEXT NOT NULL,
    report_file_url VARCHAR(512),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indexes for accidents dashboard
CREATE INDEX idx_eia_accidents_type ON eia_accidents(type);
CREATE INDEX idx_eia_accidents_date ON eia_accidents(date);
CREATE INDEX idx_eia_accidents_coords ON eia_accidents(latitude, longitude);
