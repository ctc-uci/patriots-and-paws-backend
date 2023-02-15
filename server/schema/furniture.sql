DROP TABLE IF EXISTS furniture;
CREATE TABLE furniture (
   id SERIAL PRIMARY KEY,
   donation_id INT NOT NULL,
   name VARCHAR(256) NOT NULL,
   count INT NOT NULL,
   description VARCHAR(256),
   notes VARCHAR(256)
);
