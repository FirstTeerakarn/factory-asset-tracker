# 🏭 Mini Factory Asset Tracker — Frontend

## Tech Stack
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS (dark industrial theme)
- **Routing:** React Router v6
- **HTTP:** Axios (with JWT interceptor)
- **Font:** IBM Plex Sans Thai

## Quick Start

```bash
# 1. ติดตั้ง dependencies
npm install

# 2. Start dev server (proxy ไปที่ backend port 5000 อัตโนมัติ)
npm run dev

# เปิด http://localhost:3000
```

## Structure

```
src/
├── App.jsx               ← Router + PrivateRoute/AdminRoute
├── context/
│   └── AuthContext.jsx   ← Global auth state (JWT, user)
├── services/
│   └── api.js            ← Axios instance + all API calls
├── components/
│   ├── layout/
│   │   └── Layout.jsx    ← Sidebar + navigation
│   └── ui/
│       └── index.jsx     ← Modal, Badge, Spinner, Toast, etc.
└── pages/
    ├── LoginPage.jsx      ← หน้า Login
    ├── DashboardPage.jsx  ← หน้าหลัก + สรุปยอด
    ├── AssetsPage.jsx     ← จัดการอุปกรณ์ + เบิก/คืน
    ├── UsersPage.jsx      ← จัดการพนักงาน (Admin only)
    └── LogsPage.jsx       ← ประวัติกิจกรรม (Admin only)
```

## Access Control
| หน้า      | Staff | Admin |
|-----------|-------|-------|
| Dashboard | ✅    | ✅    |
| Assets    | ✅    | ✅    |
| Users     | ❌    | ✅    |
| Logs      | ❌    | ✅    |

## Build for Production

```bash
npm run build
# output: /dist
```
