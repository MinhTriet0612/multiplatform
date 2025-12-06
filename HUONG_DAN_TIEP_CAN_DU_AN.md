
## 🚀 Hướng Dẫn Setup và Chạy Dự Án

### Yêu Cầu Hệ Thống

Trước khi bắt đầu, đảm bảo bạn đã cài đặt:

- **Node.js** (v18 trở lên) - [Download](https://nodejs.org/)
- **Docker & Docker Compose** - [Download](https://www.docker.com/get-started)
- **Package Manager**: npm, yarn, hoặc pnpm

**Kiểm tra cài đặt:**
```bash
node --version    # Phải >= v18
docker --version
docker-compose --version
```

---

## 📦 Phần 1: Docker (Database)

Docker được sử dụng **chỉ để chạy database** (PostgreSQL), không chạy Backend hay Frontend.

### Bước 1.1: Hiểu Về Docker Setup

Docker trong dự án này chỉ chứa:
- **PostgreSQL** - Database server (port 5432)
- **PgAdmin** - Công cụ quản lý database qua web (port 5050)

### Bước 1.2: Khởi Động Database Container

```bash
# Di chuyển vào thư mục docker
cd social_posting_schedule_backend/docker

# Khởi động containers (chạy ở background với -d)
docker-compose up -d

# Kiểm tra containers đang chạy
docker ps
```

**Kết quả mong đợi:**
```
CONTAINER ID   IMAGE              STATUS         PORTS
xxx            postgres:16        Up 2 minutes   0.0.0.0:5432->5432/tcp
xxx            dpage/pgadmin4     Up 2 minutes   0.0.0.0:5050->80/tcp
```

### Bước 1.3: Kiểm Tra Database Đã Chạy

**Cách 1: Kiểm tra bằng Docker**
```bash
# Xem logs của PostgreSQL
docker logs social_posting-postgres

# Kiểm tra container đang chạy
docker ps | grep postgres
```

**Cách 2: Truy cập PgAdmin (Web UI)**
1. Mở trình duyệt: `http://localhost:5050`
2. Đăng nhập:
   - Email: `admin@admin.com`
   - Password: `admin`
3. Kết nối đến PostgreSQL:
   - Host: `postgres` (tên container)
   - Port: `5432`
   - Username: `social_posting_admin`
   - Password: `admin`
   - Database: `social_posting-db`

### Bước 1.4: Các Lệnh Docker Hữu Ích

```bash
# Dừng containers (giữ lại dữ liệu)
docker-compose stop

# Khởi động lại containers
docker-compose start

# Dừng và xóa containers (giữ lại dữ liệu)
docker-compose down

# Dừng và xóa containers + volumes (XÓA TẤT CẢ DỮ LIỆU)
docker-compose down -v

# Xem logs
docker-compose logs -f postgres
```

### Thông Tin Kết Nối Database

Sau khi Docker chạy, thông tin kết nối:
```
Host: localhost
Port: 5432
Database: social_posting-db
Username: social_posting_admin
Password: admin
```

**Connection String:**
```
postgresql://social_posting_admin:admin@localhost:5432/social_posting-db?schema=public
```

---

## 🗄️ Phần 2: Prisma (Database ORM)

Prisma là công cụ quản lý database, giúp:
- Định nghĩa cấu trúc database (schema)
- Tạo/migrate database tables
- Generate TypeScript types
- Truy vấn database an toàn

### Bước 2.1: Hiểu Về Prisma

**File quan trọng:**
- `prisma/schema.prisma` - Định nghĩa cấu trúc database (models, tables)
- `prisma/migrations/` - Lịch sử thay đổi database

### Bước 2.2: Cài Đặt Prisma (Nếu Chưa Có)

Prisma thường đã được cài trong `package.json`, nhưng nếu cần:

```bash
cd social_posting_schedule_backend

# Cài đặt Prisma CLI (nếu chưa có)
npm install -D prisma
npm install @prisma/client
```

### Bước 2.3: Generate Prisma Client

Prisma Client là thư viện TypeScript để truy vấn database.

```bash
cd social_posting_schedule_backend

# Generate Prisma Client từ schema
npx prisma generate
```

**Kết quả:**
- Tạo ra `node_modules/.prisma/client/` với TypeScript types
- Có thể import và sử dụng trong code: `import { PrismaClient } from '@prisma/client'`

### Bước 2.4: Tạo Database Schema (Migration)

Sau khi Docker đã chạy, tạo các bảng trong database:

```bash
cd social_posting_schedule_backend

# Tạo migration và apply vào database
npx prisma migrate dev --name init
```

**Lệnh này sẽ:**
1. Đọc `prisma/schema.prisma`
2. So sánh với database hiện tại
3. Tạo file migration mới
4. Apply migration vào database
5. Tự động chạy `prisma generate`

**Kết quả mong đợi:**
```
✅ Database đã được tạo với các bảng:
   - users
   - groups
   - facebook_posts
   - instagram_posts
   - tiktok_posts
```

### Bước 2.5: Xem Database Bằng Prisma Studio

Prisma Studio là công cụ GUI để xem và chỉnh sửa database:

```bash
cd social_posting_schedule_backend

# Mở Prisma Studio
npx prisma studio
```

**Kết quả:**
- Mở trình duyệt tại `http://localhost:5555`
- Xem và chỉnh sửa dữ liệu trực tiếp

### Bước 2.6: Các Lệnh Prisma Hữu Ích

```bash
# Xem trạng thái migrations
npx prisma migrate status

# Reset database (XÓA TẤT CẢ DỮ LIỆU và tạo lại)
npx prisma migrate reset

# Tạo migration mới (khi thay đổi schema)
npx prisma migrate dev --name ten-migration

# Format file schema.prisma
npx prisma format

# Validate schema
npx prisma validate
```

### Bước 2.7: Cấu Hình Prisma

File `prisma/schema.prisma` chứa:
- **Datasource**: Thông tin kết nối database
- **Generator**: Cấu hình generate Prisma Client
- **Models**: Định nghĩa các bảng (User, Group, Post, ...)

**Lưu ý:** `DATABASE_URL` trong `.env` phải khớp với thông tin Docker.

---

## ⚙️ Phần 3: Backend (NestJS)

Backend là server xử lý logic, API, và kết nối với database.

### Bước 3.1: Cài Đặt Dependencies

```bash
cd social_posting_schedule_backend

# Cài đặt tất cả packages
yarn install
# hoặc
npm install
# hoặc
pnpm install
```

**Kết quả:**
- Tạo thư mục `node_modules/` với tất cả dependencies
- Cài đặt các packages: NestJS, Prisma, JWT, Passport, ...

### Bước 3.2: Tạo File Cấu Hình (.env)

Tạo file `.env` trong thư mục `social_posting_schedule_backend/`:

```bash
cd social_posting_schedule_backend

# Tạo file .env (nếu chưa có)
touch .env
```

**Nội dung file `.env`:**

```env
# Database Connection (phải khớp với Docker)
DATABASE_URL="postgresql://social_posting_admin:admin@localhost:5432/social_posting-db?schema=public"

# JWT Secret (dùng để mã hóa token, nên đổi thành giá trị ngẫu nhiên)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server Port
PORT=3000

# Frontend URL (cho CORS)
FRONTEND_URL="http://localhost:5173"

# Facebook API (Optional - chỉ cần khi đăng bài Facebook)
FACEBOOK_ACCESS_TOKEN="your-facebook-page-access-token"
FACEBOOK_PAGE_ID="your-facebook-page-id"
FACEBOOK_API_VERSION="v24.0"

# Instagram API (Optional - chỉ cần khi đăng bài Instagram)
INSTAGRAM_USER_ID="your-instagram-business-account-id"
INSTAGRAM_API_VERSION="v24.0"

# TikTok API (Optional - chỉ cần khi đăng bài TikTok)
TIKTOK_ACCESS_TOKEN="your-tiktok-access-token"
```

**Lưu ý:**
- `DATABASE_URL` phải khớp với thông tin Docker
- `JWT_SECRET` nên là chuỗi ngẫu nhiên dài (ít nhất 32 ký tự)
- Các API tokens chỉ cần khi bạn muốn đăng bài thực tế

### Bước 3.3: Setup Prisma (Nếu Chưa Làm)

```bash
cd social_posting_schedule_backend

# Generate Prisma Client
npx prisma generate

# Tạo database schema (nếu chưa làm ở Bước 2.4)
npx prisma migrate dev --name init
```

### Bước 3.4: Build Project (Optional)

```bash
# Build TypeScript sang JavaScript
yarn build
# hoặc
npm run build
```

**Kết quả:** Tạo thư mục `dist/` chứa code đã compile

### Bước 3.5: Chạy Backend

**Development Mode (Recommended):**
```bash
# Chạy với hot-reload (tự động restart khi code thay đổi)
yarn start:dev
# hoặc
npm run start:dev
```

**Production Mode:**
```bash
# Build trước
yarn build

# Chạy production
yarn start:prod
# hoặc
npm run start:prod
```

**Kết quả mong đợi:**
```
Application is running on: http://localhost:3000
Swagger documentation: http://localhost:3000/api
```

### Bước 3.6: Kiểm Tra Backend Đã Chạy

1. **Kiểm tra Server:**
   - Mở trình duyệt: `http://localhost:3000`
   - Nếu thấy response hoặc không lỗi → Backend đang chạy

2. **Kiểm tra Swagger API Docs:**
   - Mở: `http://localhost:3000/api`
   - Xem tất cả API endpoints và test trực tiếp

3. **Kiểm tra Database Connection:**
   - Xem logs trong terminal
   - Không có lỗi "Cannot connect to database" → Kết nối thành công

### Bước 3.7: Các Scripts Hữu Ích

```bash
# Development (hot-reload)
yarn start:dev

# Production
yarn start:prod

# Build
yarn build

# Lint code
yarn lint

# Format code
yarn format

# Test
yarn test
```

### Troubleshooting Backend

**Lỗi: "Cannot connect to database"**
- ✅ Kiểm tra Docker containers đang chạy: `docker ps`
- ✅ Kiểm tra `DATABASE_URL` trong `.env` đúng chưa
- ✅ Đảm bảo PostgreSQL container đã start: `docker-compose up -d`

**Lỗi: "Prisma Client not generated"**
- ✅ Chạy: `npx prisma generate`

**Lỗi: "Port 3000 already in use"**
- ✅ Đổi PORT trong `.env` thành số khác (ví dụ: 3001)
- ✅ Hoặc kill process đang dùng port 3000

---

## 🎨 Phần 4: Frontend (React + Vite)

Frontend là giao diện người dùng, chạy trên trình duyệt.

### Bước 4.1: Cài Đặt Dependencies

```bash
cd social_posting_schedule_frontend

# Cài đặt tất cả packages
yarn install
# hoặc
npm install
# hoặc
pnpm install
```

**Kết quả:**
- Tạo thư mục `node_modules/` với dependencies
- Cài đặt: React, Vite, TypeScript, Axios, Tailwind CSS, ...

### Bước 4.2: Tạo File Cấu Hình (.env)

Tạo file `.env` trong thư mục `social_posting_schedule_frontend/`:

```bash
cd social_posting_schedule_frontend

# Tạo file .env (nếu chưa có)
touch .env
```

**Nội dung file `.env`:**

```env
# Backend API URL
VITE_API_URL=http://localhost:3000
```

**Lưu ý:**
- Vite yêu cầu prefix `VITE_` cho biến môi trường
- URL phải khớp với PORT của Backend

### Bước 4.3: Kiểm Tra Cấu Hình API

File `src/services/api.ts` sử dụng biến môi trường:

```typescript
baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000'
```

Nếu không có `.env`, mặc định sẽ dùng `http://localhost:3000`.

### Bước 4.4: Chạy Frontend

**Development Mode:**
```bash
cd social_posting_schedule_frontend

# Chạy dev server
yarn dev
# hoặc
npm run dev
```

**Kết quả mong đợi:**
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Bước 4.5: Kiểm Tra Frontend Đã Chạy

1. **Mở trình duyệt:**
   - Tự động mở: `http://localhost:5173`
   - Hoặc mở thủ công

2. **Kiểm tra kết nối Backend:**
   - Mở Developer Tools (F12)
   - Tab Network → Thử đăng nhập/đăng ký
   - Xem requests có gửi đến `http://localhost:3000` không

3. **Kiểm tra Console:**
   - Không có lỗi CORS → Cấu hình đúng
   - Không có lỗi 404 → API endpoints đúng

### Bước 4.6: Build Production (Optional)

```bash
# Build cho production
yarn build
# hoặc
npm run build

# Preview production build
yarn preview
# hoặc
npm run preview
```

**Kết quả:**
- Tạo thư mục `dist/` chứa files đã build
- Có thể deploy lên hosting (Vercel, Netlify, ...)

### Bước 4.7: Các Scripts Hữu Ích

```bash
# Development
yarn dev

# Build production
yarn build

# Preview production build
yarn preview

# Lint code
yarn lint
```

### Troubleshooting Frontend

**Lỗi: "Cannot connect to API"**
- ✅ Kiểm tra Backend đang chạy: `http://localhost:3000`
- ✅ Kiểm tra `VITE_API_URL` trong `.env` đúng chưa
- ✅ Kiểm tra CORS trong Backend cho phép `http://localhost:5173`

**Lỗi: "Port 5173 already in use"**
- ✅ Vite sẽ tự động dùng port khác (5174, 5175, ...)
- ✅ Hoặc kill process đang dùng port 5173

**Lỗi: "Module not found"**
- ✅ Chạy lại: `yarn install`

---

## ✅ Kiểm Tra Toàn Bộ Hệ Thống

Sau khi setup xong cả 4 phần, kiểm tra:

### 1. Docker (Database)
```bash
docker ps
# Phải thấy: postgres và pgadmin đang chạy
```

### 2. Prisma (Database Schema)
```bash
cd social_posting_schedule_backend
npx prisma studio
# Mở http://localhost:5555 → Xem các bảng đã được tạo
```

### 3. Backend
- ✅ Server chạy: `http://localhost:3000`
- ✅ Swagger: `http://localhost:3000/api`
- ✅ Không có lỗi trong terminal

### 4. Frontend
- ✅ App chạy: `http://localhost:5173`
- ✅ Có thể đăng ký/đăng nhập
- ✅ Không có lỗi trong browser console

### Thứ Tự Khởi Động Đúng

```
1. Docker (Database)     → docker-compose up -d
2. Prisma (Schema)       → npx prisma migrate dev
3. Backend               → yarn start:dev
4. Frontend              → yarn dev
```

---

## 🔄 Quy Trình Setup Lần Đầu (Tóm Tắt)

```bash
# 1. Docker - Khởi động database
cd social_posting_schedule_backend/docker
docker-compose up -d

# 2. Prisma - Tạo database schema
cd ../..
cd social_posting_schedule_backend
npx prisma generate
npx prisma migrate dev --name init

# 3. Backend - Setup và chạy
# Tạo file .env với DATABASE_URL, JWT_SECRET, ...
yarn install
yarn start:dev

# 4. Frontend - Setup và chạy (terminal mới)
cd ../social_posting_schedule_frontend
# Tạo file .env với VITE_API_URL=http://localhost:3000
yarn install
yarn dev
```

---

## 🛑 Dừng Hệ Thống

```bash
# Dừng Frontend: Ctrl + C trong terminal frontend

# Dừng Backend: Ctrl + C trong terminal backend

# Dừng Docker
cd social_posting_schedule_backend/docker
docker-compose down
```ndencies
- Cài đặt các packages: NestJS, Prisma, JWT, Passport, ...

### Bước 3.2: Tạo File Cấu Hình (.env)

Tạo file `.env` trong thư mục `social_posting_schedule_backend/`:

```bash
cd social_posting_schedule_backend

# Tạo file .env (nếu chưa có)
touch .env
```

**Nội dung file `.env`:**

```env
# Database Connection (phải khớp với Docker)
DATABASE_URL="postgresql://social_posting_admin:admin@localhost:5432/social_posting-db?schema=public"

# JWT Secret (dùng để mã hóa token, nên đổi thành giá trị ngẫu nhiên)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server Port
PORT=3000

# Frontend URL (cho CORS)
FRONTEND_URL="http://localhost:5173"

# Facebook API (Optional - chỉ cần khi đăng bài Facebook)
FACEBOOK_ACCESS_TOKEN="your-facebook-page-access-token"
FACEBOOK_PAGE_ID="your-facebook-page-id"
FACEBOOK_API_VERSION="v24.0"

# Instagram API (Optional - chỉ cần khi đăng bài Instagram)
INSTAGRAM_USER_ID="your-instagram-business-account-id"
INSTAGRAM_API_VERSION="v24.0"

# TikTok API (Optional - chỉ cần khi đăng bài TikTok)
TIKTOK_ACCESS_TOKEN="your-tiktok-access-token"
```

**Lưu ý:**
- `DATABASE_URL` phải khớp với thông tin Docker
- `JWT_SECRET` nên là chuỗi ngẫu nhiên dài (ít nhất 32 ký tự)
- Các API tokens chỉ cần khi bạn muốn đăng bài thực tế

### Bước 3.3: Setup Prisma (Nếu Chưa Làm)

```bash
cd social_posting_schedule_backend

# Generate Prisma Client
npx prisma generate

# Tạo database schema (nếu chưa làm ở Bước 2.4)
npx prisma migrate dev --name init
```

### Bước 3.4: Build Project (Optional)

```bash
# Build TypeScript sang JavaScript
yarn build
# hoặc
npm run build
```

**Kết quả:** Tạo thư mục `dist/` chứa code đã compile

### Bước 3.5: Chạy Backend

**Development Mode (Recommended):**
```bash
# Chạy với hot-reload (tự động restart khi code thay đổi)
yarn start:dev
# hoặc
npm run start:dev
```

**Production Mode:**
```bash
# Build trước
yarn build

# Chạy production
yarn start:prod
# hoặc
npm run start:prod
```

**Kết quả mong đợi:**
```
Application is running on: http://localhost:3000
Swagger documentation: http://localhost:3000/api
```

### Bước 3.6: Kiểm Tra Backend Đã Chạy

1. **Kiểm tra Server:**
   - Mở trình duyệt: `http://localhost:3000`
   - Nếu thấy response hoặc không lỗi → Backend đang chạy

2. **Kiểm tra Swagger API Docs:**
   - Mở: `http://localhost:3000/api`
   - Xem tất cả API endpoints và test trực tiếp

3. **Kiểm tra Database Connection:**
   - Xem logs trong terminal
   - Không có lỗi "Cannot connect to database" → Kết nối thành công

### Bước 3.7: Các Scripts Hữu Ích

```bash
# Development (hot-reload)
yarn start:dev

# Production
yarn start:prod

# Build
yarn build

# Lint code
yarn lint

# Format code
yarn format

# Test
yarn test
```

### Troubleshooting Backend

**Lỗi: "Cannot connect to database"**
- ✅ Kiểm tra Docker containers đang chạy: `docker ps`
- ✅ Kiểm tra `DATABASE_URL` trong `.env` đúng chưa
- ✅ Đảm bảo PostgreSQL container đã start: `docker-compose up -d`

**Lỗi: "Prisma Client not generated"**
- ✅ Chạy: `npx prisma generate`

**Lỗi: "Port 3000 already in use"**
- ✅ Đổi PORT trong `.env` thành số khác (ví dụ: 3001)
- ✅ Hoặc kill process đang dùng port 3000

---

## 🎨 Phần 4: Frontend (React + Vite)

Frontend là giao diện người dùng, chạy trên trình duyệt.

### Bước 4.1: Cài Đặt Dependencies

```bash
cd social_posting_schedule_frontend

# Cài đặt tất cả packages
yarn install
# hoặc
npm install
# hoặc
pnpm install
```

**Kết quả:**
- Tạo thư mục `node_modules/` với dependencies
- Cài đặt: React, Vite, TypeScript, Axios, Tailwind CSS, ...

### Bước 4.2: Tạo File Cấu Hình (.env)

Tạo file `.env` trong thư mục `social_posting_schedule_frontend/`:

```bash
cd social_posting_schedule_frontend

# Tạo file .env (nếu chưa có)
touch .env
```

**Nội dung file `.env`:**

```env
# Backend API URL
VITE_API_URL=http://localhost:3000
```

**Lưu ý:**
- Vite yêu cầu prefix `VITE_` cho biến môi trường
- URL phải khớp với PORT của Backend

### Bước 4.3: Kiểm Tra Cấu Hình API

File `src/services/api.ts` sử dụng biến môi trường:

```typescript
baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000'
```

Nếu không có `.env`, mặc định sẽ dùng `http://localhost:3000`.

### Bước 4.4: Chạy Frontend

**Development Mode:**
```bash
cd social_posting_schedule_frontend

# Chạy dev server
yarn dev
# hoặc
npm run dev
```

**Kết quả mong đợi:**
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Bước 4.5: Kiểm Tra Frontend Đã Chạy

1. **Mở trình duyệt:**
   - Tự động mở: `http://localhost:5173`
   - Hoặc mở thủ công

2. **Kiểm tra kết nối Backend:**
   - Mở Developer Tools (F12)
   - Tab Network → Thử đăng nhập/đăng ký
   - Xem requests có gửi đến `http://localhost:3000` không

3. **Kiểm tra Console:**
   - Không có lỗi CORS → Cấu hình đúng
   - Không có lỗi 404 → API endpoints đúng

### Bước 4.6: Build Production (Optional)

```bash
# Build cho production
yarn build
# hoặc
npm run build

# Preview production build
yarn preview
# hoặc
npm run preview
```

**Kết quả:**
- Tạo thư mục `dist/` chứa files đã build
- Có thể deploy lên hosting (Vercel, Netlify, ...)

### Bước 4.7: Các Scripts Hữu Ích

```bash
# Development
yarn dev

# Build production
yarn build

# Preview production build
yarn preview

# Lint code
yarn lint
```

### Troubleshooting Frontend

**Lỗi: "Cannot connect to API"**
- ✅ Kiểm tra Backend đang chạy: `http://localhost:3000`
- ✅ Kiểm tra `VITE_API_URL` trong `.env` đúng chưa
- ✅ Kiểm tra CORS trong Backend cho phép `http://localhost:5173`

**Lỗi: "Port 5173 already in use"**
- ✅ Vite sẽ tự động dùng port khác (5174, 5175, ...)
- ✅ Hoặc kill process đang dùng port 5173

**Lỗi: "Module not found"**
- ✅ Chạy lại: `yarn install`

---

## ✅ Kiểm Tra Toàn Bộ Hệ Thống

Sau khi setup xong cả 4 phần, kiểm tra:

### 1. Docker (Database)
```bash
docker ps
# Phải thấy: postgres và pgadmin đang chạy
```

### 2. Prisma (Database Schema)
```bash
cd social_posting_schedule_backend
npx prisma studio
# Mở http://localhost:5555 → Xem các bảng đã được tạo
```

### 3. Backend
- ✅ Server chạy: `http://localhost:3000`
- ✅ Swagger: `http://localhost:3000/api`
- ✅ Không có lỗi trong terminal

### 4. Frontend
- ✅ App chạy: `http://localhost:5173`
- ✅ Có thể đăng ký/đăng nhập
- ✅ Không có lỗi trong browser console

### Thứ Tự Khởi Động Đúng

```
1. Docker (Database)     → docker-compose up -d
2. Prisma (Schema)       → npx prisma migrate dev
3. Backend               → yarn start:dev
4. Frontend              → yarn dev
```

---

## 🔄 Quy Trình Setup Lần Đầu (Tóm Tắt)

```bash
# 1. Docker - Khởi động database
cd social_posting_schedule_backend/docker
docker-compose up -d

# 2. Prisma - Tạo database schema
cd ../..
cd social_posting_schedule_backend
npx prisma generate
npx prisma migrate dev --name init

# 3. Backend - Setup và chạy
# Tạo file .env với DATABASE_URL, JWT_SECRET, ...
yarn install
yarn start:dev

# 4. Frontend - Setup và chạy (terminal mới)
cd ../social_posting_schedule_frontend
# Tạo file .env với VITE_API_URL=http://localhost:3000
yarn install
yarn dev
```

---

## 🛑 Dừng Hệ Thống

```bash
# Dừng Frontend: Ctrl + C trong terminal frontend

# Dừng Backend: Ctrl + C trong terminal backend

# Dừng Docker
cd social_posting_schedule_backend/docker
docker-compose down
```

---

## 📁 Cấu Trúc Thư Mục

```
SocialPostingSchedule/
├── social_posting_schedule_backend/    # Backend (NestJS)
│   ├── src/
│   │   ├── auth/                       # Module xác thực
│   │   ├── posts/                      # Module bài đăng
│   │   ├── prisma/                     # Database service
│   │   └── main.ts                     # Entry point
│   ├── prisma/
│   │   └── schema.prisma               # Database schema
│   ├── docker/
│   │   └── docker-compose.yml          # Docker config
│   └── package.json
│
├── social_posting_schedule_frontend/    # Frontend (React)
│   ├── src/
│   │   ├── components/                 # UI components
│   │   ├── contexts/                   # React Context
│   │   ├── services/                   # API services
│   │   └── App.tsx                     # Main component
│   └── package.json
│
└── README.md
```

---

## 🔄 Luồng Hoạt Động

### Ví Dụ: Người Dùng Đăng Bài Lên Facebook

```
1. Người dùng mở Frontend (http://localhost:5173)
   ↓
2. Đăng nhập (nếu chưa đăng nhập)
   ↓
3. Chọn "Đăng bài Facebook"
   ↓
4. Điền form: nội dung, upload ảnh, chọn thời gian
   ↓
5. Frontend gửi POST request → Backend (http://localhost:3000/posts/facebook)
   ↓
6. Backend nhận request:
   - Xác thực JWT token
   - Validate dữ liệu
   - Lưu vào Database (Prisma)
   - Gọi Facebook API (nếu đăng ngay)
   ↓
7. Backend trả response về Frontend
   ↓
8. Frontend hiển thị kết quả (thành công/thất bại)
```

### Luồng Dữ Liệu

```
Frontend (React)
    ↓ HTTP Request (JSON)
Backend (NestJS)
    ↓ Prisma Client
Database (PostgreSQL)
    ↓ SQL Query
    ↑ Response Data
Backend xử lý
    ↓ HTTP Response (JSON)
Frontend cập nhật UI
```

---

## 🛠️ Công Nghệ Sử Dụng

### Backend
- **NestJS** - Framework Node.js
- **TypeScript** - Ngôn ngữ lập trình
- **Prisma** - ORM (Object-Relational Mapping)
- **PostgreSQL** - Database
- **JWT** - Xác thực
- **Swagger** - API Documentation
- **Passport** - Authentication middleware

### Frontend
- **React** - UI Framework
- **TypeScript** - Ngôn ngữ lập trình
- **Vite** - Build tool
- **React Router** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling

### Database & DevOps
- **PostgreSQL** - Relational database
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **PgAdmin** - Database management tool

---

## 📚 Tài Liệu Tham Khảo

- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Vite Documentation](https://vitejs.dev/)

---

## ❓ Câu Hỏi Thường Gặp

### Q: Tại sao cần 3 phần riêng biệt?
**A:** Tách biệt giúp:
- Dễ bảo trì và mở rộng
- Có thể phát triển độc lập
- Dễ dàng scale từng phần

### Q: Làm sao để xem dữ liệu trong database?
**A:** 
- Truy cập PgAdmin: `http://localhost:5050`
- Hoặc dùng Prisma Studio: `npx prisma studio`

### Q: Làm sao để test API?
**A:** 
- Dùng Swagger UI: `http://localhost:3000/api`
- Hoặc dùng Postman/Insomnia

### Q: Lỗi "Cannot connect to database"?
**A:** 
- Kiểm tra Docker containers: `docker ps`
- Kiểm tra DATABASE_URL trong `.env`
- Đảm bảo PostgreSQL container đang chạy

---

## 🎓 Bước Tiếp Theo

Sau khi hiểu cấu trúc dự án, bạn có thể:

1. **Khám phá code**: Đọc các file trong `src/` để hiểu logic
2. **Thử nghiệm**: Tạo user mới, đăng bài thử nghiệm
3. **Đọc API docs**: Xem Swagger tại `http://localhost:3000/api`
4. **Xem database**: Dùng Prisma Studio hoặc PgAdmin
5. **Thêm tính năng**: Bắt đầu với các tính năng nhỏ

---

**Chúc bạn học tập vui vẻ! 🚀**

