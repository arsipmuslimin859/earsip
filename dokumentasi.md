# Dokumentasi Sistem Manajemen Arsip

## Ringkasan

Sistem Manajemen Arsip adalah aplikasi berbasis web modular yang dibangun dengan:
- **Frontend**: React + Vite + TypeScript
- **UI Library**: Mantine UI
- **Backend**: Supabase (Database, Auth, Storage)
- **State Management**: Zustand

## Cara Penggunaan

### Akses Aplikasi

1. **Login ke Sistem**
   - Buka browser dan akses URL aplikasi
   - Masukkan email dan password yang telah terdaftar
   - Klik tombol "Masuk"

2. **Dashboard**
   - Setelah login, Anda akan diarahkan ke halaman Dashboard
   - Dashboard menampilkan statistik overview sistem arsip
   - Navigasi utama tersedia di sidebar kiri

### Fitur Utama

#### 1. Manajemen Arsip

**Melihat Daftar Arsip:**
- Klik menu "Arsip" di sidebar
- Tabel akan menampilkan semua arsip yang tersedia
- Gunakan kolom pencarian untuk mencari arsip berdasarkan judul atau deskripsi
- Filter berdasarkan kategori menggunakan dropdown filter

**Menambah Arsip Baru:**
- Klik tombol "Tambah Arsip" di halaman Arsip
- Langkah 1: Upload file dengan drag & drop atau klik untuk memilih file
- Langkah 2: Isi detail arsip (judul, deskripsi, kategori, metadata)
- Klik "Simpan" untuk menyimpan arsip

**Mengedit Arsip:**
- Pada tabel arsip, klik ikon edit (pensil) di kolom Aksi
- Ubah informasi yang diperlukan
- Klik "Simpan" untuk menyimpan perubahan

**Menghapus Arsip:**
- Klik ikon hapus (sampah) di kolom Aksi
- Konfirmasi penghapusan pada dialog yang muncul
- Arsip akan dihapus secara permanen

**Download Arsip:**
- Klik ikon download di kolom Aksi
- File akan diunduh ke perangkat Anda

#### 2. Manajemen Kategori

**Melihat Kategori:**
- Klik menu "Kategori" di sidebar
- Tabel menampilkan semua kategori dengan ikon dan warna

**Menambah Kategori:**
- Klik tombol "Tambah Kategori"
- Isi nama kategori
- Pilih ikon dan warna
- Pilih kategori induk jika diperlukan (untuk hierarki)
- Klik "Simpan"

**Mengedit/Menghapus Kategori:**
- Gunakan ikon edit/hapus di tabel kategori

#### 3. Manajemen Tag

**Melihat Tag:**
- Klik menu "Tag" di sidebar
- Tabel menampilkan semua tag dengan warna

**Menambah Tag:**
- Klik tombol "Tambah Tag"
- Isi nama tag
- Pilih warna
- Klik "Simpan"

**Mengedit/Menghapus Tag:**
- Gunakan ikon edit/hapus di tabel tag

#### 4. Log Aktivitas

**Melihat Log Aktivitas:**
- Klik menu "Log Aktivitas" di sidebar
- Filter berdasarkan:
  - Tipe aksi (CREATE, UPDATE, DELETE)
  - Pengguna
  - Tipe entitas (archives, categories, tags)
  - Rentang tanggal
- Klik "Cari" untuk menerapkan filter
- Klik "Refresh" untuk memperbarui data
- Klik "Export CSV" untuk mengunduh log

#### 5. Tabel Kustom

**Melihat Tabel Kustom:**
- Klik menu "Tabel Kustom" di sidebar
- Tabel menampilkan daftar semua tabel kustom yang telah dibuat

**Membuat Tabel Baru:**
- Klik tombol "Buat Tabel Baru"
- Isi nama tabel dan deskripsi (opsional)
- Tambah kolom dengan tipe data: Teks, Angka, Tanggal, Ya/Tidak, atau Pilihan
- Set kolom sebagai wajib diisi jika diperlukan
- Klik "Buat Tabel"

**Mengedit Struktur Tabel:**
- Pada tabel daftar, klik ikon edit di kolom Aksi
- Modifikasi kolom yang ada atau tambah kolom baru
- Klik "Perbarui"

**Menghapus Tabel:**
- Klik ikon hapus di kolom Aksi
- Konfirmasi penghapusan (semua data akan hilang)

**Mengelola Data Tabel:**
- Klik ikon database di kolom Aksi untuk melihat data
- Tambah data baru dengan tombol "Tambah Data"
- Edit atau hapus data dengan ikon di tabel
- Data akan divalidasi berdasarkan tipe kolom dan aturan wajib

#### 6. Arsip Publik

**Mengakses Arsip Publik:**
- Tidak memerlukan login
- Akses melalui URL: `/public-archive`
- Fitur pencarian dan filter sama seperti halaman Arsip utama
- Hanya dapat melihat dan mengunduh arsip (tidak dapat edit/hapus)

### Tips Penggunaan

1. **Upload File:**
   - Format file yang didukung: PDF, DOC, DOCX, gambar
   - Ukuran maksimal file sesuai konfigurasi sistem
   - Gunakan drag & drop untuk upload cepat

2. **Metadata Dinamis:**
   - Setiap arsip dapat memiliki metadata tambahan sesuai konfigurasi
   - Isi semua field yang wajib (ditandai bintang *)
   - Metadata membantu dalam pencarian dan pengorganisasian arsip

3. **Pencarian dan Filter:**
   - Gunakan pencarian teks untuk mencari di judul, deskripsi, dan metadata
   - Kombinasikan filter kategori dan tag untuk hasil lebih spesifik
   - Pada halaman log, gunakan filter tanggal untuk melihat aktivitas periode tertentu

4. **Keamanan:**
   - Selalu logout setelah selesai menggunakan aplikasi
   - Jangan bagikan kredensial login dengan orang lain
   - Sistem secara otomatis logout jika tidak aktif dalam waktu tertentu

### Troubleshooting

**Tidak dapat login:**
- Pastikan email dan password benar
- Periksa koneksi internet
- Hubungi administrator jika lupa password

**Upload file gagal:**
- Periksa ukuran file tidak melebihi batas
- Pastikan format file didukung
- Coba refresh halaman dan upload ulang

**Data tidak muncul:**
- Klik tombol "Refresh" di halaman terkait
- Periksa koneksi internet
- Logout dan login ulang jika diperlukan

**Error lainnya:**
- Catat pesan error yang muncul
- Laporkan ke administrator sistem dengan detail error

## Arsitektur Modular

Sistem ini dirancang dengan arsitektur modular agar dapat:
1. Di-deploy ulang untuk instansi berbeda tanpa perubahan kode inti
2. Dikonfigurasi melalui file JSON atau database
3. Menambah/mengurangi modul sesuai kebutuhan

## Struktur Folder

```
src/
├── components/           # Komponen reusable
│   ├── Archive/         # Komponen arsip (Card, Table, Form)
│   ├── Auth/            # Komponen autentikasi
│   └── Layout/          # Layout dan navigasi
├── config/              # File konfigurasi
│   └── institution.config.json  # Konfigurasi instansi
├── lib/                 # Library dan utilities
│   └── supabase.ts      # Supabase client
├── pages/               # Halaman aplikasi
│   ├── DashboardPage.tsx
│   ├── LoginPage.tsx
│   └── PublicArchivePage.tsx
├── services/            # Service layer untuk API
│   ├── archiveService.ts
│   ├── categoryService.ts
│   ├── tagService.ts
│   └── activityLogService.ts
├── stores/              # Zustand stores
│   ├── authStore.ts
│   └── configStore.ts
├── types/               # TypeScript types
│   ├── database.types.ts
│   └── index.ts
└── utils/               # Utility functions
    └── formatters.ts
```

## Database Schema

### Tabel Utama

1. **settings** - Konfigurasi sistem
2. **modules** - Modul yang aktif/non-aktif
3. **categories** - Kategori arsip
4. **tags** - Tags untuk arsip
5. **archives** - Data arsip utama
6. **archive_metadata** - Metadata dinamis per arsip
7. **archive_tags** - Relasi arsip dengan tags
8. **activity_logs** - Log aktivitas pengguna

## Konfigurasi Instansi

File: `src/config/institution.config.json`

```json
{
  "institutionName": "Nama Instansi Anda",
  "modules": {
    "retention": false,
    "publicArchive": true,
    "tagging": true,
    "versioning": true,
    "metadataDynamic": true
  },
  "metadataSchema": [
    {
      "field": "nomor_surat",
      "label": "Nomor Surat",
      "type": "text",
      "required": true
    }
  ],
  "theme": {
    "primaryColor": "blue",
    "defaultColorScheme": "light"
  },
  "storage": {
    "bucketName": "archives",
    "maxFileSize": 10485760,
    "allowedFileTypes": [".pdf", ".doc", ".docx"]
  }
}
```

## Setup Awal

### 1. Environment Variables

Buat file `.env` dengan konten:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Supabase Storage

Buat bucket bernama `archives` di Supabase Storage:

```sql
-- Via SQL Editor di Supabase
insert into storage.buckets (id, name, public)
values ('archives', 'archives', true);
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

## Fitur yang Sudah Diimplementasikan

### ✅ Core Features

1. **Autentikasi**
    - Login dengan email/password (Supabase Auth)
    - Session management
    - Protected routes

2. **Dashboard**
    - Statistik overview
    - UI dasar dengan Mantine

3. **Arsip Publik**
    - Halaman tanpa login: `/public-archive`
    - Filter dan pencarian
    - Download file

4. **Manajemen Arsip Lengkap (CRUD)**
    - Halaman `/archives` untuk manajemen arsip
    - List arsip dengan tabel view
    - Upload arsip baru dengan drag & drop
    - Edit arsip (judul, deskripsi, kategori, metadata)
    - Delete arsip dengan konfirmasi
    - Form metadata dinamis berdasarkan konfigurasi
    - Progress bar saat upload
    - Filter dan pencarian arsip

5. **Komponen Reusable**
    - `ArchiveCard` - Kartu arsip
    - `ArchiveTable` - Tabel arsip dengan aksi
    - `ArchiveFormModal` - Modal form untuk create/edit
    - `ArchiveUploadForm` - Form upload dengan drag & drop
    - `MetadataFormDynamic` - Form metadata dinamis
    - `AppLayout` - Layout aplikasi
    - `LoginForm` - Form login

6. **Service Layer**
    - Archive CRUD operations
    - Upload/download files
    - Metadata management
    - Activity logging
    - Category management

7. **Database & Migrations**
    - Schema lengkap dengan RLS
    - Default categories & modules
    - Indexes untuk performa

---

## Pengembangan Lanjutan

Berikut adalah fitur-fitur yang perlu dikembangkan lebih lanjut:

### ✅ Halaman Manajemen Arsip (CRUD Lengkap) - SELESAI

**File yang dibuat:**
- `src/pages/ArchivesPage.tsx` ✅
- `src/components/Archive/ArchiveFormModal.tsx` ✅
- `src/components/Archive/ArchiveUploadForm.tsx` ✅

**Fitur yang diimplementasikan:**
- ✅ List semua arsip dengan tabel view
- ✅ Form upload arsip baru dengan drag & drop (2-step: upload file lalu isi detail)
- ✅ Metadata dinamis berdasarkan konfigurasi
- ✅ Edit arsip (judul, deskripsi, kategori, metadata)
- ✅ Delete arsip dengan konfirmasi modal (mengganti window.confirm)
- ✅ Progress bar saat upload
- ✅ Filter dan pencarian arsip (by kategori dan teks)
- ✅ Error handling dan notifications
- ✅ Activity logging untuk semua operasi CRUD
- ✅ Routing terintegrasi dengan react-router-dom

**Perbaikan Terbaru:**
- ✅ Fixed metadataService import dan usage (sekarang menggunakan import terpisah)
- ✅ Improved create modal flow dengan auto-switch ke tab details setelah file dipilih
- ✅ Added activity logging untuk semua operasi CRUD (create, update, delete)
- ✅ Replaced window.confirm dengan Mantine Modal untuk konfirmasi delete
- ✅ Fixed filter kategori dengan value handling yang lebih baik
- ✅ Fixed TypeScript errors dan type assertions

**Contoh implementasi upload:**

```typescript
import { Dropzone } from '@mantine/dropzone';

// Di dalam component
<Dropzone
  onDrop={(files) => handleUpload(files)}
  accept={['application/pdf', 'image/*']}
  maxSize={config.storage.maxFileSize}
>
  {/* UI dropzone */}
</Dropzone>

// Handle upload
const handleUpload = async (files: File[]) => {
  const file = files[0];
  const path = `${Date.now()}-${file.name}`;

  await archiveService.uploadFile(file, path);

  const archive = await archiveService.create({
    title: form.values.title,
    file_path: path,
    file_name: file.name,
    file_size: file.size,
    file_type: file.type,
    // ... other fields
  });

  // Create metadata
  await metadataService.create(/* ... */);
};
```

### ✅ Halaman Manajemen Kategori - SELESAI

**File:** `src/pages/CategoriesPage.tsx`

**Fitur:**
- CRUD kategori dengan tabel dan pencarian
- Color picker untuk memilih warna kategori
- Icon picker dengan pilihan Tabler Icons
- Dukungan hierarki kategori (parent-child)
- Notifikasi sukses/error & refresh data instan

### ✅ Halaman Manajemen Tags - SELESAI

**File:** `src/pages/TagsPage.tsx`

**Fitur:**
- CRUD tag dengan pencarian & refresh cepat
- Color picker untuk kontrol warna label
- Tabel overview dengan aksi edit/hapus
- Notifikasi feedback untuk setiap operasi

### ✅ Halaman Activity Log - SELESAI

**File:** `src/pages/ActivityLogPage.tsx`

**Fitur:**
- Daftar log dengan waktu, pengguna, action, entity, dan detail JSON
- Filter action, user, entity type, rentang tanggal, serta limit hasil
- Tombol refresh cepat + export CSV instan

### ✅ Fitur Tabel Kustom - SELESAI

**File yang dibuat:**
- `src/services/customTableService.ts` ✅
- `src/pages/CustomTablesPage.tsx` ✅
- `src/components/CustomTables/TableDefinitionModal.tsx` ✅
- `src/components/CustomTables/TableDataTable.tsx` ✅
- `src/components/CustomTables/TableDataModal.tsx` ✅

**Fitur yang diimplementasikan:**
- ✅ Membuat tabel kustom tanpa mengubah struktur database
- ✅ Mendefinisikan kolom dengan berbagai tipe data (text, number, date, boolean, select)
- ✅ CRUD data tabel dengan validasi tipe data
- ✅ Interface web lengkap untuk manajemen tabel dan data
- ✅ Data disimpan di tabel `settings` sebagai JSON
- ✅ Navigasi terintegrasi dengan menu "Tabel Kustom"
- ✅ Error handling dan notifications

**Cara kerja:**
- Struktur tabel disimpan di `settings.key = 'custom_tables'`
- Data tabel disimpan di `settings.key = 'custom_table_data_{tableId}'`
- Semua operasi menggunakan existing RLS policies
- Tidak memerlukan perubahan schema database

### 🔨 Search & Filtering Advanced

**Enhancement untuk:**
- `src/pages/ArchivesPage.tsx`
- `src/pages/PublicArchivePage.tsx`

**Fitur:**
- Full-text search dengan metadata
- Filter kombinasi (kategori + tags + date range)
- Sort (by date, size, title)
- Saved searches

**Contoh advanced search:**

```typescript
const handleSearch = async () => {
  const results = await archiveService.search(searchQuery, {
    category_id: selectedCategory,
    tags: selectedTags,
    dateFrom: dateRange[0],
    dateTo: dateRange[1],
  });
};
```

### 🔨 Versioning System

**File:** `src/components/Archive/VersionHistory.tsx`

**Fitur:**
- List semua versi dari satu arsip
- Upload versi baru (membuat parent_version_id reference)
- Compare versions
- Restore versi lama

**Contoh implementasi:**

```typescript
// Create new version
const createNewVersion = async (archiveId: string, file: File) => {
  const currentArchive = await archiveService.getById(archiveId);

  const newVersion = await archiveService.create({
    ...currentArchive,
    parent_version_id: archiveId,
    version: currentArchive.version + 1,
    file_path: newPath,
    // ...
  });
};
```

### 🔨 Retention Policy Module

**File:** `src/modules/retention/RetentionModule.tsx`

**Fitur:**
- Set retention period per kategori atau per arsip
- Auto-delete atau auto-archive setelah retention period
- Warning sebelum deletion
- Cron job untuk check retention (bisa pakai Supabase Edge Functions)

**Edge Function example:**

```typescript
// supabase/functions/retention-check/index.ts
Deno.serve(async (req) => {
  const { data: archives } = await supabase
    .from('archives')
    .select('*')
    .lt('retention_date', new Date().toISOString());

  // Process expired archives
  for (const archive of archives) {
    await supabase.from('archives').delete().eq('id', archive.id);
  }

  return new Response(JSON.stringify({ processed: archives.length }));
});
```

### 🔨 Export & Reporting

**File:** `src/pages/ReportsPage.tsx`

**Fitur:**
- Export arsip list ke CSV/Excel
- Generate laporan statistik (per kategori, per bulan, dll)
- Dashboard analytics dengan charts (gunakan Recharts atau Chart.js)

**Library tambahan:**
```bash
npm install recharts xlsx
```

### 🔨 Bulk Operations

**File:** `src/components/Archive/BulkActions.tsx`

**Fitur:**
- Select multiple arsip (checkbox)
- Bulk delete
- Bulk change category
- Bulk add/remove tags
- Bulk export

### 🔨 Notification System

**Enhancement:**
- Real-time notifications dengan Supabase Realtime
- Email notifications (via Edge Functions + external service)
- In-app notifications dengan Mantine Notifications

### 🔨 User Management (Optional)

Jika butuh multiple users dengan roles:

**Tables tambahan:**
```sql
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name text,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE,
  permissions jsonb
);
```

### 🔨 Advanced Modules System

**Dynamic module loading:**

```typescript
// src/modules/index.ts
const modules = {
  retention: () => import('./retention/RetentionModule'),
  workflow: () => import('./workflow/WorkflowModule'),
  approval: () => import('./approval/ApprovalModule'),
};

// Load modules based on config
const loadModules = async (enabledModules: string[]) => {
  const loaded = await Promise.all(
    enabledModules.map(name => modules[name]())
  );
  return loaded;
};
```

### 🔨 Mobile Responsive Optimization

**Enhancement:**
- Optimize semua komponen untuk mobile
- Add touch gestures
- PWA support (service workers)

### 🔨 Internationalization (i18n)

**Library:**
```bash
npm install react-i18next i18next
```

**Implementasi:**
- Support multiple languages (ID, EN, dll)
- Language switcher di navbar

---

## Tips Pengembangan

### 1. Menambah Field Metadata Baru

Edit `src/config/institution.config.json`:

```json
{
  "metadataSchema": [
    {
      "field": "field_baru",
      "label": "Label Field",
      "type": "text|textarea|date|number|select",
      "required": true|false,
      "options": ["option1", "option2"] // untuk type=select
    }
  ]
}
```

### 2. Menambah Modul Baru

1. Buat folder `src/modules/nama-modul/`
2. Buat component utama modul
3. Register di `institution.config.json`
4. Update `modules` table di database
5. Load conditional di aplikasi

### 3. Customizing Theme

Edit di `src/App.tsx`:

```typescript
const theme = createTheme({
  primaryColor: 'blue', // bisa: blue, red, green, dll
  fontFamily: 'Inter, sans-serif',
  headings: {
    fontFamily: 'Inter, sans-serif',
  },
});
```

### 4. Menambah Service Baru

Contoh struktur service:

```typescript
// src/services/newService.ts
import { supabase } from '../lib/supabase';

export const newService = {
  async getAll() {
    const { data, error } = await supabase
      .from('table_name')
      .select('*');
    if (error) throw error;
    return data;
  },

  async create(item: any) {
    const { data, error } = await supabase
      .from('table_name')
      .insert(item)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // ... other CRUD methods
};
```

### 5. Error Handling Best Practices

```typescript
try {
  const result = await someService.method();

  notifications.show({
    title: 'Berhasil',
    message: 'Operasi berhasil',
    color: 'green',
  });
} catch (error) {
  console.error('Error:', error);

  notifications.show({
    title: 'Error',
    message: error instanceof Error ? error.message : 'Terjadi kesalahan',
    color: 'red',
  });
}
```

---

## Testing

### Unit Testing (Belum diimplementasikan)

**Setup:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**Contoh test:**
```typescript
// src/services/__tests__/archiveService.test.ts
import { describe, it, expect } from 'vitest';
import { archiveService } from '../archiveService';

describe('archiveService', () => {
  it('should fetch all archives', async () => {
    const archives = await archiveService.getAll();
    expect(Array.isArray(archives)).toBe(true);
  });
});
```

---

## Deployment

### Supabase Setup

1. Buat project di [supabase.com](https://supabase.com)
2. Copy URL dan Anon Key ke `.env`
3. Run migrations via Supabase SQL Editor
4. Create storage bucket `archives`

### Build Production

```bash
npm run build
```

### Deploy Options

1. **Vercel** (Recommended)
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Netlify**
   - Connect repo
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Self-hosted**
   - Upload `dist/` folder ke server
   - Setup nginx/apache

---

## Troubleshooting

### Error: "Missing Supabase environment variables"

**Solusi:** Buat file `.env` dengan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY

### Error: "Failed to fetch archives"

**Solusi:**
1. Cek RLS policies di Supabase
2. Pastikan user sudah login
3. Cek connection string

### File upload gagal

**Solusi:**
1. Cek bucket `archives` sudah dibuat
2. Cek storage policies di Supabase
3. Cek file size tidak melebihi limit

---

## Kontribusi & Customization

Sistem ini dirancang untuk di-customize. Silakan:

1. Fork/clone repository
2. Sesuaikan `institution.config.json`
3. Tambah modul sesuai kebutuhan
4. Update database schema jika perlu
5. Deploy ke environment Anda sendiri

**Best Practice:**
- Jangan modifikasi core files
- Gunakan modules untuk fitur baru
- Update config via JSON/database
- Document semua custom changes

---

## Referensi

- [Mantine UI Documentation](https://mantine.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Zustand Documentation](https://zustand-demo.pmnd.rs)

---

## Lisensi

Open Source - silakan digunakan dan dikembangkan sesuai kebutuhan instansi Anda.

---

**Dibuat dengan ❤️ untuk sistem manajemen arsip yang modular dan fleksibel**
