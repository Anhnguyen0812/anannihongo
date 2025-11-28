# 🎓 Hệ Thống Học Tập (Learning System)

## ✅ Đã Hoàn Thành

### 1. Dữ Liệu (Data)
- ✅ Import thành công **1,290 bài học** từ CSV.
- ✅ Course: "N3 Dũng Mori 2024".
- ✅ Database Schema: `courses`, `lessons`, `progress`.

### 2. Giao Diện (UI/UX)
- ✅ **Dashboard (`/learn`)**: Hiển thị danh sách khóa học và tiến độ tổng quan.
- ✅ **Course Redirect (`/learn/[courseId]`)**: Tự động chuyển tới bài học đang học dở hoặc bài đầu tiên.
- ✅ **Lesson Player (`/learn/[courseId]/[lessonId]`)**:
  - 📺 Google Drive Video Player.
  - 📜 Danh sách bài học (Sidebar) phân chia theo Chặng/Chương (tạm thời theo số thứ tự).
  - ✅ Nút "Hoàn thành" để lưu tiến độ.
  - ⏭️ Nút điều hướng "Bài trước", "Bài tiếp theo".

### 3. Logic & Backend
- ✅ **Server Actions**: `completeLesson`, `uncompleteLesson` để lưu tiến độ vào bảng `progress`.
- ✅ **Data Fetching**: Lấy dữ liệu bài học và merge với tiến độ của user (real-time).
- ✅ **Authentication**: Chỉ user đã đăng nhập mới được vào học.

---

## 🚀 Hướng Dẫn Sử Dụng

### 1. Truy cập
- Đăng nhập vào hệ thống.
- Click **"Vào học"** trên Navbar hoặc truy cập `/learn`.

### 2. Bắt đầu học
- Chọn khóa học (VD: N3 Dũng Mori).
- Hệ thống tự động đưa bạn vào bài học đầu tiên.

### 3. Trong bài học
- Xem video hoặc đọc tài liệu PDF.
- Click **"Hoàn thành"** khi học xong -> Icon check xanh hiện lên ✅.
- Click **"Bài tiếp theo"** để sang bài mới.
- Sidebar bên phải hiển thị danh sách bài, bài đang học được highlight.

---

## 🛠️ Cấu Trúc Code

### Pages
- `app/learn/page.tsx`: Dashboard.
- `app/learn/[courseId]/page.tsx`: Redirect logic.
- `app/learn/[courseId]/[lessonId]/page.tsx`: Lesson player page.

### Components
- `components/LessonPlayer.tsx`: Client component xử lý giao diện bài học.

### Actions
- `app/learn/actions.ts`: Server actions xử lý logic lưu tiến độ.

---

## 📝 Lưu Ý
- Video được load từ Google Drive thông qua `iframe`.
- Tiến độ được lưu theo từng User ID.
- Nếu muốn reset tiến độ, có thể xóa dữ liệu trong bảng `progress`.

**Hệ thống đã sẵn sàng để sử dụng! 🎉**
