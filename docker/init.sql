-- Initialize the indoor booking database
-- This script runs once when the PostgreSQL container first starts

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Optional: Create a read-only user for reporting
-- CREATE USER reporting_user WITH PASSWORD 'reporting_pass';
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO reporting_user;
