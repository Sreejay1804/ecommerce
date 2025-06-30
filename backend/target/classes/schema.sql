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

-- Create Database
CREATE DATABASE IF NOT EXISTS customer_management;
USE customer_management;

-- Create vendor_invoices table
CREATE TABLE vendor_invoices (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    invoice_no VARCHAR(255) NOT NULL UNIQUE,
    vendor_id BIGINT NOT NULL,
    vendor_name VARCHAR(255) NOT NULL,
    vendor_address TEXT,
    vendor_phone VARCHAR(20),
    date_time VARCHAR(255) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    total_tax DECIMAL(10,2) NOT NULL,
    grand_total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create vendor_invoice_items table
CREATE TABLE vendor_invoice_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    vendor_invoice_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    cgst_percent DECIMAL(5,2) NOT NULL,
    sgst_percent DECIMAL(5,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (vendor_invoice_id) REFERENCES vendor_invoices(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_vendor_invoices_vendor_id ON vendor_invoices(vendor_id);
CREATE INDEX idx_vendor_invoices_invoice_no ON vendor_invoices(invoice_no);
CREATE INDEX idx_vendor_invoices_date_time ON vendor_invoices(date_time);
CREATE INDEX idx_vendor_invoice_items_product_id ON vendor_invoice_items(product_id);
CREATE INDEX idx_vendor_invoice_items_category ON vendor_invoice_items(category);