DROP TYPE IF EXISTS role;
DROP TABLE IF EXISTS users;

CREATE TYPE role as ENUM('superadmin', 'admin', 'driver');

CREATE TABLE users (
    id VARCHAR(256) PRIMARY KEY,
    role role NOT NULL,
    first_name VARCHAR(256) NOT NULL,
    last_name VARCHAR(256) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    email VARCHAR (255) NOT NULL
);
