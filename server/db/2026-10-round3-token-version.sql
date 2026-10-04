-- Run once on an existing database (new setups get it from unilearn_db.sql)
-- Lets logout / password change / deactivation cancel old login tokens.
ALTER TABLE users ADD COLUMN token_version INT NOT NULL DEFAULT 0;
