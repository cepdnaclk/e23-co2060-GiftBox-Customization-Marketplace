-- V19__fix_vendor_foreign_key_and_trigger.sql
-- 1. Drops the wrong foreign key constraint on vendors that references customers
SET @wrong_fk_name = (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'vendors'
      AND COLUMN_NAME = 'vendor_id'
      AND REFERENCED_TABLE_NAME = 'customers'
    LIMIT 1
);

SET @drop_sql = IF(@wrong_fk_name IS NOT NULL, CONCAT('ALTER TABLE vendors DROP FOREIGN KEY ', @wrong_fk_name), 'SELECT 1');
PREPARE stmt FROM @drop_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Ensure the correct FK is added if missing
SET @correct_fk_name = (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'vendors'
      AND COLUMN_NAME = 'vendor_id'
      AND REFERENCED_TABLE_NAME = 'users'
    LIMIT 1
);

SET @add_sql = IF(@correct_fk_name IS NULL, 'ALTER TABLE vendors ADD CONSTRAINT vendors_ibfk_users FOREIGN KEY (vendor_id) REFERENCES users(user_id) ON DELETE CASCADE', 'SELECT 1');
PREPARE stmt2 FROM @add_sql;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;


-- 3. Fix the trigger to NOT insert into vendors automatically.
-- Hibernate's VendorRepository.save(vendor) already handles both `users` and `vendors` inserts.
-- If the trigger tries to insert into vendors, it causes a Duplicate Key constraint violation on vendor_id!
DROP TRIGGER IF EXISTS after_user_register;

CREATE TRIGGER after_user_register
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.role = 'CUSTOMER' THEN
        INSERT INTO customers (customer_id) VALUES (NEW.user_id);
    ELSEIF NEW.role = 'ADMIN' THEN
        INSERT INTO admins (admin_id) VALUES (NEW.user_id);
    ELSEIF NEW.role = 'ASSEMBLER' THEN
        INSERT INTO assemblers (assembler_id, full_name, phone_number)
        VALUES (NEW.user_id, NEW.name, '000');
    END IF;
END;
