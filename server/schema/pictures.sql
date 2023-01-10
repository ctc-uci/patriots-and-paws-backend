DROP TABLE IF EXISTS pictures;
CREATE TABLE pictures (
   id SERIAL PRIMARY KEY,
   donation_id INT NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
   image_url varchar(256) NOT NULL
);
