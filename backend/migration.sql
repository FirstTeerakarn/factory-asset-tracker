-- Migration: Phase 3 - Add current_user_id to assets table
-- รันก่อนเริ่ม backend ครั้งแรก

USE factory_assets;

-- เพิ่ม column current_user_id ใน assets (ถ้ายังไม่มี)
ALTER TABLE assets 
  ADD COLUMN IF NOT EXISTS current_user_id INT NULL,
  ADD CONSTRAINT fk_asset_current_user 
    FOREIGN KEY (current_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- ตรวจสอบผลลัพธ์
DESCRIBE assets;
