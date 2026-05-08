-- 1. สร้างตารางเก็บข้อมูลอุปกรณ์ (Assets)
CREATE TABLE IF NOT EXISTS assets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    category ENUM('Machine', 'IT Equipment', 'Tools') DEFAULT 'IT Equipment',
    status ENUM('Available', 'In Use', 'Maintenance') DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. สร้างตารางเก็บรายชื่อผู้ใช้งาน (Users)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Staff') DEFAULT 'Staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. ตารางบันทึกประวัติ (Activity Logs)
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT,
    user_id INT,
    action ENUM('Check-out', 'Check-in', 'Repair'),
    log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 4. การทำ Seeding (ใส่ข้อมูลตัวอย่าง)
INSERT INTO assets (asset_code, name, category, status) VALUES 
('MC-001', 'CNC Milling Machine', 'Machine', 'Available'),
('IT-002', 'Monitor Dell 27 240Hz', 'IT Equipment', 'Available'),
('TL-003', 'Digital Multimeter', 'Tools', 'Maintenance');

INSERT INTO users (username, password_hash, role) VALUES 
('admin', '123456', 'Admin'),
('staff01', '123456', 'Staff');