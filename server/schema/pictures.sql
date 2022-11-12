CREATE TABLE [IF NOT EXISTS] pictures (
   id INT PRIMARY KEY,
   furniture_id INT NOT NULL,
   image_url varchar(256) NOT NULL,
);
