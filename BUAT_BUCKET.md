# ⚠️ PENTING: Buat Storage Bucket

Migration sudah ter-push, tapi **Storage Bucket harus dibuat secara manual** karena Supabase tidak membuat bucket secara otomatis melalui migration.

## 🚀 Cara Membuat Bucket (Pilih salah satu):

### Cara 1: Melalui Supabase Dashboard (TERMUDAH - 2 menit)

1. Buka **Supabase Dashboard**: https://supabase.com/dashboard
2. Pilih **project Anda**
3. Klik menu **Storage** di sidebar kiri
4. Klik tombol **"New bucket"** atau **"Create bucket"**
5. Isi form:
   - **Name**: `archives` (harus tepat, case-sensitive)
   - **Public bucket**: ✅ **Centang ini** (wajib!)
   - **File size limit**: 50 MB (atau sesuai kebutuhan)
   - **Allowed MIME types**: (bisa dikosongkan untuk allow semua)
6. Klik **"Create bucket"**

✅ **Selesai!** Refresh aplikasi dan coba upload file lagi.

---

### Cara 2: Melalui SQL Editor

1. Buka **Supabase Dashboard** → Project Anda
2. Klik menu **SQL Editor** di sidebar
3. Copy paste script berikut ke SQL Editor:

```sql
-- Buat bucket 'archives'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'archives',
  'archives',
  true,
  52428800, -- 50MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ]
)
ON CONFLICT (id) DO NOTHING;
```

4. Klik **"Run"** atau tekan `Ctrl+Enter`
5. Verifikasi dengan menjalankan query:

```sql
SELECT id, name, public FROM storage.buckets WHERE id = 'archives';
```

✅ **Selesai!**

---

## ✅ Verifikasi Bucket Berhasil Dibuat

Setelah membuat bucket:

1. Pergi ke **Storage** → Anda akan melihat bucket `archives` di daftar
2. Atau refresh aplikasi dan coba upload file lagi
3. Error "Bucket not found" seharusnya sudah hilang

---

## 🔍 Troubleshooting

**Masih error "Bucket not found"?**

1. ✅ Pastikan nama bucket **exact**: `archives` (huruf kecil semua)
2. ✅ Pastikan bucket **Public** (centang saat membuat)
3. ✅ Refresh halaman aplikasi setelah membuat bucket
4. ✅ Cek console browser untuk error detail

**Error "Permission denied"?**

Jalankan SQL ini untuk membuat policies:

```sql
-- Copy paste ke SQL Editor dan jalankan
-- File: setup_bucket.sql sudah ada di project ini
```

---

## 📝 Catatan

- Migration database sudah ter-push ✅
- Tapi Storage Bucket **harus dibuat manual** (ini normal untuk Supabase)
- Nama bucket harus sesuai dengan `src/config/institution.config.json` → `storage.bucketName` (default: `archives`)

