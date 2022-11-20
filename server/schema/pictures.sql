DROP TABLE IF EXISTS pictures;
CREATE TABLE pictures (
   id SERIAL PRIMARY KEY,
   furniture_id INT NOT NULL,
   image_url varchar(256) NOT NULL,
);
