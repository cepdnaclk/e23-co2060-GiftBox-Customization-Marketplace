-- V15__restore_users_superclass.sql
-- Restore 'users' as superclass table and 'customers' as subclass role table

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Drop temporary foreign keys referencing customers table
ALTER TABLE orders DROP FOREIGN KEY orders_ibfk_1;
ALTER TABLE admins DROP FOREIGN KEY admins_ibfk_1;
ALTER TABLE assemblers DROP FOREIGN KEY assemblers_ibfk_1;
ALTER TABLE vendors DROP FOREIGN KEY vendors_ibfk_1;

-- 2. Rename customers back to users
RENAME TABLE customers TO users;

-- 3. Rename customer_id back to user_id (and retain AUTO_INCREMENT)
ALTER TABLE users CHANGE COLUMN customer_id user_id INT AUTO_INCREMENT;

-- 4. Recreate customers table as subclass table
CREATE TABLE IF NOT EXISTS customers (
    customer_id INT PRIMARY KEY,
    address TEXT NULL,
    FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 5. Seed customers with existing user_ids where role = 'CUSTOMER'
INSERT INTO customers (customer_id)
SELECT user_id FROM users WHERE role = 'CUSTOMER';

-- 6. Re-add FKs pointing to the correct tables
ALTER TABLE orders ADD CONSTRAINT orders_ibfk_1 FOREIGN KEY (customer_id) REFERENCES customers(customer_id);
ALTER TABLE admins ADD CONSTRAINT admins_ibfk_1 FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE assemblers ADD CONSTRAINT assemblers_ibfk_1 FOREIGN KEY (assembler_id) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE vendors ADD CONSTRAINT vendors_ibfk_1 FOREIGN KEY (vendor_id) REFERENCES users(user_id) ON DELETE CASCADE;

-- 7. Recreate the view admin_order_overview using users and customers correctly
DROP VIEW IF EXISTS admin_order_overview;
CREATE VIEW admin_order_overview AS
SELECT
    o.order_id,
    u_c.name    AS customer_name,
    u_p.name    AS vendor_name,
    pt.shop_name,
    o.status,
    o.total_amount,
    o.created_at
FROM orders o
JOIN customers c  ON o.customer_id = c.customer_id
JOIN users u_c    ON c.customer_id = u_c.user_id
JOIN vendors pt  ON o.vendor_id  = pt.vendor_id
JOIN users u_p    ON pt.vendor_id = u_p.user_id;

-- 8. Recreate the trigger after_user_register to automatically insert role entries
DROP TRIGGER IF EXISTS after_user_register;
CREATE TRIGGER after_user_register
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.role = 'CUSTOMER' THEN
        INSERT INTO customers (customer_id) VALUES (NEW.user_id);
    ELSEIF NEW.role = 'ADMIN' THEN
        INSERT INTO admins (admin_id) VALUES (NEW.user_id);
    ELSEIF NEW.role = 'PARTNER' OR NEW.role = 'VENDOR' THEN
        INSERT INTO vendors (vendor_id, shop_name, full_name, phone_number, shop_address, verification_id) 
        VALUES (NEW.user_id, 'New Shop', NEW.name, '000', 'Address', '000');
    ELSEIF NEW.role = 'ASSEMBLER' THEN
        INSERT INTO assemblers (assembler_id, full_name, phone_number)
        VALUES (NEW.user_id, NEW.name, '000');
    END IF;
END;

-- 9. Add one admin data and one assembler data
INSERT INTO users (name, username, email, password, role, is_verified)
VALUES ('Admin', 'admin', 'admin@giftora.com', '$2a$12$T7GRMHHTzkYTYgGmAoE2ReyfM.3Cb2U7Y3UC.UuVEe7TS7gbES9HC', 'ADMIN', 1);

INSERT INTO users (name, username, email, password, role, is_verified)
VALUES ('Assembler', 'assembler', 'assembler@giftora.com', '$2a$12$T7GRMHHTzkYTYgGmAoE2ReyfM.3Cb2U7Y3UC.UuVEe7TS7gbES9HC', 'ASSEMBLER', 1);

SET FOREIGN_KEY_CHECKS = 1;
