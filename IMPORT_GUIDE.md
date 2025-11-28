# 📊 Import Dữ Liệu từ CSV vào Supabase

## ✅ Đã Hoàn Thành

### 1. Script Import
- ✅ Tạo file `scripts/import-dungmori.ts`
- ✅ Cài package `csv-parse`
- ✅ Sẵn sàng import 1291 bài học

---

## 🚀 Cách Chạy Import

### Cài tsx (nếu chưa có):
```bash
npm install -D tsx
```

### Chạy script:
```bash
npx tsx scripts/import-dungmori.ts
```

---

## 📊 Script Sẽ Import

- **1 Course:** N3 Dũng Mori 2024
- **1,291 Lessons:** Từ file dungmori.csv
- **Google Drive IDs:** Tất cả file IDs được lưu vào `drive_file_id`
- **Free Lessons:** 10 bài đầu + tài liệu chung

---

## 📝 Sau Khi Import

Kiểm tra trong Supabase Dashboard:
```sql
SELECT COUNT(*) FROM courses;  -- Expected: 1
SELECT COUNT(*) FROM lessons;  -- Expected: 1291
```

**Sẵn sàng để build course player! 🎉**
