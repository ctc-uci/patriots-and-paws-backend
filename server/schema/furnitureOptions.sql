DROP TABLE IF EXISTS furnitureOptions;
CREATE TABLE furniture_options (
   id SERIAL PRIMARY KEY,
   name VARCHAR(256) NOT NULL,
   accepted BOOLEAN NOT NULL
);
