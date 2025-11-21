-- Organ Donation System Database Schema
-- MySQL/MariaDB Database

CREATE DATABASE IF NOT EXISTS organ_donation_db;
USE organ_donation_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'donor', 'receiver') NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Organs Table
CREATE TABLE IF NOT EXISTS organs (
    id VARCHAR(255) PRIMARY KEY,
    donor_id VARCHAR(255) NOT NULL,
    donor_name VARCHAR(255) NOT NULL,
    organ_type VARCHAR(100) NOT NULL,
    blood_type VARCHAR(10) NOT NULL,
    status ENUM('available', 'requested', 'matched') DEFAULT 'available',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_donor_id (donor_id),
    INDEX idx_status (status),
    INDEX idx_organ_type (organ_type),
    INDEX idx_blood_type (blood_type)
);

-- Organ Requests Table
CREATE TABLE IF NOT EXISTS organ_requests (
    id VARCHAR(255) PRIMARY KEY,
    receiver_id VARCHAR(255) NOT NULL,
    receiver_name VARCHAR(255) NOT NULL,
    organ_id VARCHAR(255) NOT NULL,
    organ_type VARCHAR(100) NOT NULL,
    blood_type VARCHAR(10) NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'contacted') DEFAULT 'pending',
    message TEXT,
    donor_contact VARCHAR(255),
    receiver_contact VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (organ_id) REFERENCES organs(id) ON DELETE CASCADE,
    INDEX idx_receiver_id (receiver_id),
    INDEX idx_organ_id (organ_id),
    INDEX idx_status (status)
);

-- Insert Default Admin User
-- Password: admin123 (should be hashed in production)
INSERT INTO users (id, email, password, name, role) VALUES
('1', 'admin@organs.com', 'admin123', 'Admin User', 'admin')
ON DUPLICATE KEY UPDATE email=email;

-- Insert Default Donor User
-- Password: donor123 (should be hashed in production)
INSERT INTO users (id, email, password, name, role, phone, address) VALUES
('2', 'donor@organs.com', 'donor123', 'John Donor', 'donor', '123-456-7890', '123 Main St')
ON DUPLICATE KEY UPDATE email=email;

-- Insert Default Receiver User
-- Password: receiver123 (should be hashed in production)
INSERT INTO users (id, email, password, name, role, phone, address) VALUES
('3', 'receiver@organs.com', 'receiver123', 'Jane Receiver', 'receiver', '987-654-3210', '456 Oak Ave')
ON DUPLICATE KEY UPDATE email=email;

