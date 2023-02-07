DROP TABLE IF EXISTS routes;

CREATE TABLE routes (
  id SERIAL PRIMARY KEY,
  driver_id VARCHAR(256) NOT NULL REFERENCES users(id),
  name VARCHAR(256) NOT NULL,
  date date
);
