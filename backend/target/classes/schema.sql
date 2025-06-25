-- Create customers table if it doesn't exist
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    address TEXT
);

-- Add index for faster searches
CREATE INDEX IF NOT EXISTS idx_customer_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customer_name ON customers(name);

-- Create database (run this as postgres superuser)
-- CREATE DATABASE customer_management;

-- Connect to customer_management database and run the following:

-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(10) NOT NULL,
    address TEXT NOT NULL,
    gst_number VARCHAR(15) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vendors_email ON vendors(email);
CREATE INDEX IF NOT EXISTS idx_vendors_phone ON vendors(phone);
CREATE INDEX IF NOT EXISTS idx_vendors_gst_number ON vendors(gst_number);
CREATE INDEX IF NOT EXISTS idx_vendors_name ON vendors(name);

-- Create a trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vendors_updated_at
    BEFORE UPDATE ON vendors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
INSERT INTO vendors (name, email, phone, address, gst_number, description) VALUES
('ABC Electronics', 'abc@electronics.com', '9876543210', '123 Main Street, Mumbai, Maharashtra', '27ABCDE1234F1Z5', 'Electronics and appliances supplier'),
('XYZ Textiles', 'contact@xyztextiles.com', '9876543211', '456 Market Road, Delhi, NCR', '07XYZAB5678G2W6', 'Textile and fabric manufacturer'),
('PQR Services', 'info@pqrservices.com', '9876543212', '789 Business Park, Bangalore, Karnataka', '29PQRST9012H3X7', 'IT and consulting services')
ON CONFLICT (email) DO NOTHING;