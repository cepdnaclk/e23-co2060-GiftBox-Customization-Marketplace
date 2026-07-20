-- V16__add_admin_and_assembler.sql

-- $2a$12$ceuZK/UQsrN/oo4LowPtnefpo1142WlokeMu9z/KOELUPeCvd7d8G is the hash for 'pass123'
INSERT INTO users (name, username, email, password, role, is_verified)
VALUES ('Admin', 'admin', 'admin@giftora.com', '$2a$12$ceuZK/UQsrN/oo4LowPtnefpo1142WlokeMu9z/KOELUPeCvd7d8G', 'ADMIN', 1)
ON DUPLICATE KEY UPDATE password = '$2a$12$ceuZK/UQsrN/oo4LowPtnefpo1142WlokeMu9z/KOELUPeCvd7d8G';

INSERT INTO users (name, username, email, password, role, is_verified)
VALUES ('Assembler', 'assembler', 'assembler@giftora.com', '$2a$12$ceuZK/UQsrN/oo4LowPtnefpo1142WlokeMu9z/KOELUPeCvd7d8G', 'ASSEMBLER', 1)
ON DUPLICATE KEY UPDATE password = '$2a$12$ceuZK/UQsrN/oo4LowPtnefpo1142WlokeMu9z/KOELUPeCvd7d8G';
