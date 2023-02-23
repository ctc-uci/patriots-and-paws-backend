DROP TABLE IF EXISTS furniture;

CREATE TABLE furniture (
   id SERIAL PRIMARY KEY,
   donation_id INT NOT NULL REFERENCES donations(id),
   name VARCHAR(256) NOT NULL,
   count INT NOT NULL
);
