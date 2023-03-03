DROP TYPE IF EXISTS status;
DROP TABLE IF EXISTS donations;

CREATE TYPE status AS ENUM ('pending', 'approval requested', 'changes requested', 'scheduling', 'scheduled', 'picked up', 'reschedule');

CREATE TABLE donations (
   id VARCHAR(6) PRIMARY KEY,
   route_id INT REFERENCES routes(id) ON DELETE SET NULL,
   order_num INT,
   status status NOT NULL,
   address_street VARCHAR(256) NOT NULL,
   address_unit VARCHAR(256),
   address_city VARCHAR(256) NOT NULL,
   address_zip int NOT NULL,
   first_name VARCHAR(256) NOT NULL,
   last_name VARCHAR(256) NOT NULL,
   email VARCHAR(256) NOT NULL,
   phone_num VARCHAR(15) NOT NULL,
   notes VARCHAR(256),
   submitted_date date NOT NULL,
   last_edited_date date NOT NULL
);
