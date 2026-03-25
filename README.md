# Hệ Thống Quản Lý Sinh Viên

Dự án Hệ thống Quản lý Sinh viên - Bài tập thiết kế và xây dựng ứng dụng với React, Spring Boot và MongoDB.

## 🛠️ Công Nghệ Sử Dụng
- **Frontend:** React (Vite), Ant Design, Axios, React Router.
- **Backend:** Java Spring Boot, Spring Data MongoDB, Apache POI (Export Excel), OpenCSV.
- **Database:** MongoDB.

## 🚀 Cài Đặt Và Chạy Ứng Dụng

### 1. Database (MongoDB)
- Cài đặt MongoDB (hoặc dùng MongoDB Compass) và khởi tạo server ở cổng mặc định `27017`.
- Không cần tạo sẵn database, ứng dụng Spring Boot sẽ tự động tạo database tên là `quanlysinhvien`.

### 2. Chạy Backend (Spring Boot)
1. Mở Terminal (Command Prompt / PowerShell).
2. Di chuyển vào thư mục `backend`:
   ```bash
   cd backend
   ```
3. Chạy lệnh:
   - Trên **Windows**: `.\gradlew bootRun`
   - Trên **Mac/Linux**: `./gradlew bootRun`
4. Backend sẽ chạy tại: `http://localhost:8080`.

### 3. Chạy Frontend (React)
1. Mở một Terminal khác (giữ Backend vẫn đang chạy).
2. Di chuyển vào thư mục `frontend`:
   ```bash
   cd frontend
   ```
3. Cài đặt các thư viện (nếu chưa cài):
   ```bash
   npm install
   ```
4. Chạy ứng dụng:
   ```bash
   npm run dev
   ```
5. Mở trình duyệt và truy cập `http://localhost:5173`.

## ✨ Các Chức Năng Chính
- **Quản lý Sinh viên:** Thêm, Sửa, Xóa sinh viên.
- **Quản lý Lớp học:** Thêm, Sửa, Xóa lớp học.
- **Tìm kiếm:** Tìm theo tên hoặc mã sinh viên.
- **Lọc:** Lọc danh sách sinh viên theo Lớp học hoặc Giới tính.
- **Xuất Báo Cáo:** Xuất danh sách sinh viên dưới dạng file `CSV` và `Excel`.
