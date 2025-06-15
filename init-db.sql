-- Create restricted user for application runtime
CREATE ROLE "portal" WITH LOGIN PASSWORD 'portal' NOSUPERUSER NOCREATEDB NOCREATEROLE;

-- Connect to the portal database
\c "dotproj"

-- Grant schema usage to portal_user
GRANT USAGE ON SCHEMA public TO "portal";

-- Grant minimal privileges to portal_user for application tables
-- These will be applied to tables created by migrations
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "portal";
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO "portal";
