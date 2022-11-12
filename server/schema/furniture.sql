CREATE TABLE [IF NOT EXISTS] furniture (
   id INT PRIMARY KEY,
   donation_id INT NOT NULL,
   name VARCHAR(256) NOT NULL,
   description VARCHAR(256),
   notes VARCHAR(256)
);
