# 🔒 Panduan Keamanan - Sistem Manajemen Arsip

## Ringkasan Keamanan

Sistem Manajemen Arsip ini mengimplementasikan berbagai lapisan keamanan untuk melindungi data pengguna dan mencegah serangan umum seperti XSS, CSRF, dan injeksi kode.

## 🛡️ Fitur Keamanan yang Diimplementasikan

### 1. **Content Security Policy (CSP)**
- **File**: `index.html`
- **Fungsi**: Membatasi sumber daya yang dapat dimuat oleh browser
- **Konfigurasi**:
  ```html
  <meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https: blob:;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co;
    frame-src 'none';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
  ">
  ```

### 2. **Security Headers**
- **X-Content-Type-Options**: `nosniff` - Mencegah MIME type sniffing
- **X-Frame-Options**: `DENY` - Mencegah clickjacking
- **X-XSS-Protection**: `1; mode=block` - Aktivasi XSS filtering
- **Referrer-Policy**: `strict-origin-when-cross-origin` - Kontrol referrer information
- **Permissions-Policy**: Membatasi akses ke geolocation, microphone, camera

### 3. **Input Validation & Sanitization**
- **File**: `src/utils/security.ts`
- **Fitur**:
  - Sanitasi HTML entities untuk XSS prevention
  - Validasi URL dengan whitelist protokol
  - Validasi tipe file dan nama file
  - Deteksi upaya XSS
  - Rate limiting untuk mencegah brute force

### 4. **File Upload Security**
- **Validasi Tipe File**: Hanya tipe file yang diizinkan
- **Validasi Nama File**: Mencegah path traversal
- **Ukuran File**: Batas maksimal file size
- **XSS Detection**: Deteksi konten berbahaya

### 5. **Error Handling Aman**
- **File**: `src/utils/errorHandler.ts`
- **Fitur**:
  - Error messages yang tidak mengungkap informasi internal
  - Logging keamanan untuk upaya serangan
  - Rate limiting untuk error notifications

### 6. **Build Security**
- **File**: `vite.config.ts`
- **Fitur**:
  - Source maps dinonaktifkan di production
  - Code minification dengan Terser
  - Console logs dihapus di production
  - File names obfuscation

## 🔧 Konfigurasi Keamanan

### Environment Variables
```env
# Security Configuration
VITE_APP_ENV=production
VITE_ENABLE_HTTPS=true
VITE_CSP_ENABLED=true

# Security Features
VITE_ENABLE_RATE_LIMITING=true
VITE_ENABLE_XSS_PROTECTION=true
VITE_ENABLE_SECURE_STORAGE=true

# File Upload
VITE_MAX_FILE_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=.pdf,.doc,.docx,.jpg,.jpeg,.png

# Session
VITE_SESSION_TIMEOUT=3600000
VITE_MAX_LOGIN_ATTEMPTS=5
```

### File Upload Configuration
```json
{
  "storage": {
    "maxFileSize": 10485760,
    "allowedFileTypes": [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"]
  }
}
```

## 🛠️ Security Audit

Jalankan audit keamanan secara berkala:

```bash
# Jalankan security audit
npm run security-audit

# Jalankan audit lengkap (security + dependencies)
npm run security-check
```

### Hasil Audit
Script audit akan memeriksa:
- ✅ Environment variables security
- ✅ HTML security headers
- ✅ Build configuration
- ✅ Security utilities presence
- ✅ Code security patterns
- ✅ Dependencies vulnerabilities

## 🚨 Ancaman Keamanan yang Ditangani

### 1. **Cross-Site Scripting (XSS)**
- **Mitigasi**: Input sanitization, CSP, XSS protection headers
- **Deteksi**: XSS pattern detection dalam input

### 2. **Cross-Site Request Forgery (CSRF)**
- **Mitigasi**: SameSite cookies, Origin validation
- **Headers**: `Cross-Origin-Resource-Policy: same-origin`

### 3. **Clickjacking**
- **Mitigasi**: `X-Frame-Options: DENY`
- **CSP**: `frame-src 'none'`

### 4. **MIME Type Confusion**
- **Mitigasi**: `X-Content-Type-Options: nosniff`
- **Validasi**: File type validation

### 5. **Path Traversal**
- **Mitigasi**: File name sanitization
- **Validasi**: Path traversal pattern detection

### 6. **Injection Attacks**
- **Mitigasi**: Input sanitization, prepared statements (via Supabase)
- **Validasi**: SQL injection pattern detection

## 📋 Checklist Keamanan Deployment

### Pre-Deployment
- [ ] Jalankan `npm run security-audit`
- [ ] Periksa semua environment variables
- [ ] Pastikan HTTPS diaktifkan
- [ ] Update CSP untuk domain production
- [ ] Verifikasi file permissions

### Production Configuration
- [ ] Enable HTTPS dengan valid certificate
- [ ] Configure proper CORS policies
- [ ] Set up monitoring dan logging
- [ ] Enable rate limiting di server level
- [ ] Regular security updates

### Monitoring
- [ ] Log analysis untuk suspicious activities
- [ ] Regular dependency updates
- [ ] Security headers validation
- [ ] Performance monitoring

## 🔄 Maintenance Keamanan

### Mingguan
- Jalankan security audit
- Periksa logs untuk suspicious activities
- Update dependencies jika ada security patches

### Bulanan
- Review dan update security policies
- Audit user access dan permissions
- Test backup dan recovery procedures

### Tahunan
- Comprehensive security assessment
- Penetration testing
- Architecture review

## 📞 Incident Response

Jika terjadi security incident:

1. **Immediate Actions**:
   - Isolate affected systems
   - Preserve evidence (logs, etc.)
   - Notify security team

2. **Investigation**:
   - Analyze attack vectors
   - Identify compromised data
   - Determine breach scope

3. **Recovery**:
   - Patch vulnerabilities
   - Restore from clean backups
   - Update security measures

4. **Prevention**:
   - Implement additional controls
   - Update incident response plan
   - Conduct security training

## 📚 Referensi

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Supabase Security](https://supabase.com/docs/guides/security)

## ⚠️ Disclaimer

Tidak ada sistem yang 100% aman. Keamanan adalah proses berkelanjutan yang memerlukan monitoring, updates, dan respons cepat terhadap ancaman baru.

---

**Terakhir diperbarui**: Desember 2024
**Versi Sistem**: 1.0.0