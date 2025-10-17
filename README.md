# GenZ Web E-commerce Platform

## Mô tả
GenZ Web là dự án e-commerce fullstack gồm frontend React + Vite + Tailwind và backend Node.js + Express + TypeScript, sử dụng MongoDB Atlas, Redis, Docker, CI/CD với GitHub Actions. Hỗ trợ quản trị admin, đăng nhập, đặt hàng, quản lý sản phẩm, đơn hàng.

## Cấu trúc thư mục
```
GenZ-Web/
├── backend/         # Backend Node.js/Express/TypeScript
├── frontend/        # Frontend React/Vite/Tailwind
├── docker-compose.yml
├── .env.backend     # Biến môi trường backend (KHÔNG commit)
```

## Hướng dẫn chạy local
### 1. Chuẩn bị
- Node.js >= 18, npm >= 9
- Docker, Docker Compose
- MongoDB Atlas URI (hoặc MongoDB local)

### 2. Cấu hình biến môi trường
Tạo file `.env.backend` ở thư mục gốc, ví dụ:
```
MONGO_URI="<your-mongodb-atlas-uri>"
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=your_jwt_secret
API_PREFIX=/api
PORT=4000
DEBUG_KEY=make-me-admin
```

### 3. Chạy bằng Docker Compose
```sh
docker compose --env-file .env.backend up --build -d
```
- Truy cập backend: http://localhost:4000/api
- Truy cập frontend: http://localhost:3000

### 4. Chạy frontend dev (nếu muốn hot reload)
```sh
cd frontend
npm install
npm run dev
```

### 5. Seed dữ liệu demo
- Đăng ký tài khoản, dùng endpoint debug để promote admin:
  - POST /api/debug/promote với header `x-debug-key: make-me-admin` và body `{ "email": "<email>" }`
- Đăng nhập, lấy token, tạo sản phẩm, đơn hàng qua API hoặc UI.

## Tính năng nổi bật
- Đăng ký/đăng nhập, JWT auth
- Quản trị admin: sản phẩm, đơn hàng
- Caching Redis cho products
- CI/CD: Docker multi-stage, GitHub Actions
- Kết nối MongoDB Atlas

## Lưu ý bảo mật
- KHÔNG commit `.env.backend` lên git
- Đổi DEBUG_KEY/JWT_SECRET khi deploy production
- Xóa/khóa endpoint debug sau khi đã có admin

