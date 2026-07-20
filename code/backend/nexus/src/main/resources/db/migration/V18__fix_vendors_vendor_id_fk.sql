-- The vendors.vendor_id FK constraint was still pointing at the old
-- customers table from an earlier rename migration. Vendor now extends
-- User (JOINED inheritance) via the `users` table, so this FK must
-- point to users.user_id instead.
-- This uses information_schema to find the actual constraint name,
-- so it works regardless of what Aiven/MySQL auto-named it.

SET @fk_name = (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'vendors'
      AND COLUMN_NAME = 'vendor_id'
      AND REFERENCED_TABLE_NAME IS NOT NULL
    LIMIT 1
);

SET @drop_sql = CONCAT('ALTER TABLE vendors DROP FOREIGN KEY ', @fk_name);
PREPARE stmt FROM @drop_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE vendors
ADD CONSTRAINT vendors_ibfk_1
FOREIGN KEY (vendor_id) REFERENCES users(user_id)
ON DELETE CASCADE;