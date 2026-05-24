# ใช้ Node.js เวอร์ชั่น 18 แบบน้ำหนักเบา (alpine)
FROM node:18-alpine

# กำหนดโฟลเดอร์ทำงานใน Container
WORKDIR /usr/src/app

# ก๊อปปี้ไฟล์ package.json มาติดตั้ง dependencies ก่อน (ช่วยเรื่อง Caching)
COPY package*.json ./
RUN npm install

# ก๊อปปี้โค้ดทั้งหมดในโฟลเดอร์ backend เข้าไป
COPY . .

# เปิดพอร์ต 5000 ให้ภายนอกเชื่อมต่อได้
EXPOSE 5000

# คำสั่งสตาร์ทเซิร์ฟเวอร์
CMD ["node", "app.js"]