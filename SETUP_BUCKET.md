# Setup Storage Bucket

Untuk menggunakan fitur upload arsip, Anda perlu membuat bucket storage di Supabase.

## Cara 1: Melalui Supabase Dashboard (Paling Mudah)

1. Buka **Supabase Dashboard** → Pilih project Anda
2. Pergi ke menu **Storage** di sidebar kiri
3. Klik tombol **"New bucket"** atau **"Create Bucket"**
4. Isi form:
   - **Name**: `archives`
   - **Public bucket**: ✅ Centang (agar file bisa diakses publik)
   - **File size limit**: 50 MB (atau sesuai kebutuhan)
   - **Allowed MIME types**: (opsional, bisa dikosongkan untuk allow semua)
5. Klik **"Create bucket"**

## Cara 2: Melalui SQL Editor

1. Buka **Supabase Dashboard** → Pilih project Anda
2. Pergi ke menu **SQL Editor**
3. Buka atau copy isi file `setup_bucket.sql` dari project ini
4. Paste ke SQL Editor
5. Klik **"Run"** atau tekan `Ctrl+Enter`

Atau jalankan SQL berikut:

```sql
-- Buat bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('archives', 'archives', true)
ON CONFLICT (id) DO NOTHING;
```

## Cara 3: Menggunakan Supabase CLI (Untuk Local Development)

Jika menggunakan Supabase local development:

```bash
# Pastikan Supabase sudah running
supabase status

# Jalankan migration yang sudah ada
supabase db reset

# Atau jalankan migration khusus bucket
supabase db push
```

## Verifikasi Bucket

Setelah membuat bucket, verifikasi dengan cara:

1. Buka **Storage** → Anda akan melihat bucket `archives` di daftar
2. Atau jalankan query di SQL Editor:

```sql
SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE id = 'archives';
```

## Troubleshooting

### Error: "Bucket not found"

1. Pastikan bucket sudah dibuat dengan nama `archives` (exact match, case-sensitive)
2. Pastikan bucket bersifat **public** (untuk akses file)
3. Refresh halaman aplikasi setelah membuat bucket
4. Periksa console browser untuk error detail

### Error: "Permission denied"

1. Pastikan storage policies sudah dibuat
2. Jalankan file `setup_bucket.sql` untuk membuat policies
3. Pastikan user sudah login (authenticated)

### Error: "File upload failed"

1. Periksa ukuran file (maksimal sesuai limit bucket)
2. Periksa tipe file (harus sesuai allowed types jika dikonfigurasi)
3. Pastikan koneksi internet stabil

## Catatan

- Nama bucket harus sesuai dengan yang ada di `src/config/institution.config.json` → `storage.bucketName`
- Default nama bucket: `archives`
- Bucket harus public jika ingin file bisa diakses tanpa login
- Storage policies sudah termasuk dalam migration file

