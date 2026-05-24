# ─── Stage 1: Build React/Vite App ───
FROM node:18-alpine as build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
# สั่ง Build โค้ด Vite ให้กลายเป็นไฟล์ HTML/CSS/JS นิ่งๆ (Static files)
RUN npm run build

# ─── Stage 2: Serve with Nginx ───
FROM nginx:alpine
# ก๊อปปี้ไฟล์ที่ Build เสร็จจาก Stage 1 มาไว้ในโฟลเดอร์ของ Nginx
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
# ก๊อปปี้ไฟล์ตั้งค่า Nginx เข้าไปทับค่าเดิม
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]