-- Add the missing delivery_slot column to the orders table for MySQL.
-- Note: MySQL versions older than 8.0 do not support IF NOT EXISTS on ALTER TABLE.
ALTER TABLE orders ADD COLUMN delivery_slot VARCHAR(100);
