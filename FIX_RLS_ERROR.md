# 🔒 Fix RLS Policy Error - Quick Guide

## ❌ Error
```
new row violates row-level security policy for table "courses"
```

## ✅ Solution

### Bước 1: Mở Supabase Dashboard
1. Vào [https://app.supabase.com](https://app.supabase.com)
2. Chọn project của bạn
3. Vào **SQL Editor**

### Bước 2: Chạy SQL Script
Copy và paste SQL này vào SQL Editor, sau đó click **Run**:

```sql
-- Add INSERT policies
CREATE POLICY "Allow insert courses" 
ON public.courses 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow insert lessons" 
ON public.lessons 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);
```

### Bước 3: Chạy lại import script
```bash
npx tsx scripts/import-dungmori.ts
```

---

## 🎯 Sau khi import xong

Nếu bạn muốn xóa policies (để bảo mật hơn):
```sql
DROP POLICY "Allow insert courses" ON public.courses;
DROP POLICY "Allow insert lessons" ON public.lessons;
```

**Hoặc giữ nguyên** để có thể import thêm data sau này.

---

**File SQL đã tạo:** `scripts/add-insert-policies.sql`
