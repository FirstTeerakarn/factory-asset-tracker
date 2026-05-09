# 🏭 Mini Factory Asset Tracker — Backend API

## Tech Stack
- **Runtime:** Node.js + Express.js
- **Database:** MySQL 8.0 (Docker port 3307)
- **Auth:** JWT (8h expiry)
- **DB Driver:** mysql2/promise

## Quick Start

```bash
# 1. ติดตั้ง dependencies
npm install

# 2. สร้าง .env จาก example
cp .env.example .env

# 3. รัน migration (เพิ่ม current_user_id ใน assets)
docker exec -i asset_tracker_db mysql -u developer -p123456 factory_assets < migration.sql

# 4. Start server
npm run dev     # development (nodemon)
npm start       # production
```

## API Endpoints

### 🔐 Auth
| Method | Endpoint       | Access | Description     |
|--------|---------------|--------|-----------------|
| POST   | /api/auth/login | Public | เข้าสู่ระบบ รับ JWT |
| GET    | /api/auth/me    | All    | ดูข้อมูลตัวเอง  |

### 👥 Users (Admin only)
| Method | Endpoint        | Description         |
|--------|----------------|---------------------|
| GET    | /api/users      | ดูพนักงานทั้งหมด     |
| GET    | /api/users/:id  | ดูพนักงานรายคน      |
| POST   | /api/users      | เพิ่มพนักงานใหม่     |
| PUT    | /api/users/:id  | แก้ไขข้อมูลพนักงาน   |
| DELETE | /api/users/:id  | ลบพนักงาน           |

### 📦 Assets
| Method | Endpoint                  | Access      | Description        |
|--------|--------------------------|-------------|--------------------|
| GET    | /api/assets               | All         | ดูอุปกรณ์ทั้งหมด   |
| GET    | /api/assets/:id           | All         | ดูอุปกรณ์รายชิ้น   |
| POST   | /api/assets               | Admin only  | เพิ่มอุปกรณ์ใหม่   |
| PUT    | /api/assets/:id           | Admin only  | แก้ไขอุปกรณ์       |
| DELETE | /api/assets/:id           | Admin only  | ลบอุปกรณ์          |
| POST   | /api/assets/:id/checkout  | All         | เบิกอุปกรณ์        |
| POST   | /api/assets/:id/checkin   | All         | คืนอุปกรณ์         |
| GET    | /api/assets/:id/logs      | All         | ดูประวัติอุปกรณ์   |

### 📋 Logs (Admin only)
| Method | Endpoint   | Description              |
|--------|-----------|--------------------------|
| GET    | /api/logs  | ดูประวัติทั้งหมด (filter ได้) |

Query params สำหรับ /api/logs: `asset_id`, `user_id`, `action`, `limit`
Query params สำหรับ /api/assets: `status`, `category`, `search`

## Request Examples

### Login
```json
POST /api/auth/login
{ "username": "admin", "password": "yourpassword" }
```

### Create Asset
```json
POST /api/assets
Authorization: Bearer <token>
{ "asset_code": "TL-001", "name": "Drill Machine", "category": "Tools" }
```

### Checkout Asset
```json
POST /api/assets/1/checkout
Authorization: Bearer <token>
```
