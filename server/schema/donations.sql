DROP TYPE status;
DROP TABLE donations;

CREATE TYPE status AS ENUM ('pending', 'approved', 'denied', 'flagged', 'scheduling', 'scheduled', 'picked up', 'failed');

CREATE TABLE donations (
   id SERIAL PRIMARY KEY,
   route_id INT REFERENCES routes(id) ON DELETE CASCADE,
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
   submitted_date date,
   last_edited_date date
);
