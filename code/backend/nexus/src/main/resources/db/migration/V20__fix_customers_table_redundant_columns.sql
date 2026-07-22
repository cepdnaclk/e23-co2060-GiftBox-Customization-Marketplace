-- V20__fix_customers_table_redundant_columns.sql
SET @index_exists_username = (
    SELECT COUNT(1)
    FROM information_schema.STATISTICS
    WHERE table_schema = DATABASE()
      AND table_name = 'customers'
      AND index_name = 'username'
);
SET @sql_drop_idx_username = IF(@index_exists_username > 0, 'ALTER TABLE customers DROP INDEX username', 'SELECT 1');
PREPARE stmt1 FROM @sql_drop_idx_username;
EXECUTE stmt1;
DEALLOCATE PREPARE stmt1;

SET @index_exists_email = (
    SELECT COUNT(1)
    FROM information_schema.STATISTICS
    WHERE table_schema = DATABASE()
      AND table_name = 'customers'
      AND index_name = 'email'
);
SET @sql_drop_idx_email = IF(@index_exists_email > 0, 'ALTER TABLE customers DROP INDEX email', 'SELECT 1');
PREPARE stmt2 FROM @sql_drop_idx_email;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

DELIMITER //
DROP PROCEDURE IF EXISTS DropCustomerColumns//
CREATE PROCEDURE DropCustomerColumns()
BEGIN
    DECLARE col_exists INT;
    
    SELECT COUNT(1) INTO col_exists FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'customers' AND COLUMN_NAME = 'password';
    IF col_exists > 0 THEN
        ALTER TABLE customers 
            DROP COLUMN name,
            DROP COLUMN username,
            DROP COLUMN email,
            DROP COLUMN password,
            DROP COLUMN role,
            DROP COLUMN is_verified,
            DROP COLUMN verification_code,
            DROP COLUMN code_expires_at,
            DROP COLUMN created_at,
            DROP COLUMN address_line1,
            DROP COLUMN address_line2,
            DROP COLUMN city,
            DROP COLUMN district,
            DROP COLUMN province,
            DROP COLUMN postal_code,
            DROP COLUMN phone_number;
    END IF;
END//
DELIMITER ;

CALL DropCustomerColumns();
DROP PROCEDURE IF EXISTS DropCustomerColumns;
