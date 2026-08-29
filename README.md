# Khoji Nepal (खोजि नेपाल) — National Disaster Missing Persons & Emergency Response System

Khoji Nepal is an official national disaster missing persons registry, AI facial-recognition matching desk, rescue coordinator, and relief supply network built for rapid crisis response.

---

## 1. Requirements

- **Web Server**: Apache 2.4+ or Nginx with PHP 8.0+ configured.
- **PHP Extensions**: `pdo_mysql`, `gd` (for photo resizing and verification), `mbstring`, `json`, `curl`.
- **Database**: MySQL 8.0+ or MariaDB 10.5+.

---

## 2. MySQL Setup

Create a dedicated database and user for Khoji Nepal:

```sql
CREATE DATABASE khoji_nepal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'khoji_user'@'localhost' IDENTIFIED BY 'YOUR_SECURE_PASSWORD';
GRANT ALL PRIVILEGES ON khoji_nepal.* TO 'khoji_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 3. PHP Configuration (`php.ini`)

Ensure your `php.ini` is tuned for production safety and performance:

```ini
file_uploads = On
upload_max_filesize = 10M
post_max_size = 12M
memory_limit = 256M
display_errors = Off
log_errors = On
error_log = /var/log/php_errors.log
session.cookie_httponly = 1
session.cookie_secure = 1
session.use_strict_mode = 1
```

---

## 4. Database Import

Import the schema and initial seed data:

```bash
mysql -u root -p khoji_nepal < database/schema.sql
mysql -u root -p khoji_nepal < database/seed_demo.sql
```

---

## 5. Environment & Config Setup

Copy `.env.example` to `config/database.php` environment variables or configure your web server environment variables (`.env` or Apache `SetEnv` / Nginx `fastcgi_param`):

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=khoji_nepal
DB_USERNAME=khoji_user
DB_PASSWORD=YOUR_SECURE_PASSWORD
DB_CHARSET=utf8mb4
```

---

## 6. Local Development

1. Place project files in your web server document root (e.g., `/var/www/html`).
2. Point your local host (e.g., `http://localhost/khoji-nepal`) to the root directory.
3. Ensure write permissions on `uploads/` for photo uploads and AI verification caches.

---

## 7. Production Deployment

1. Point your domain (e.g., `https://khoji.gov.np`) to the project root.
2. Enable HTTPS via Let's Encrypt / TLS certificate.
3. Configure URL rewriting (Apache `.htaccess` or Nginx `try_files`) to route requests correctly.
4. Ensure `display_errors` is set to `Off` in production.

---

## 8. Admin Creation

A default Super Administrator account is created via `database/seed_demo.sql`:
- **Email**: `admin@khoji.gov.np`
- **Password**: `admin123` *(Change immediately upon first login)*

You can also register additional administrative or relief coordinator accounts via the secure `/api/admin/users.php` endpoint with proper `super_admin` privileges.

---

## 9. AI Provider Configuration

Khoji Nepal integrates with Google Gemini AI (`@google/genai`) for automated facial matching and duplicate case deduplication.
- Set your `GEMINI_API_KEY` in environment variables or server config.
- The AI API proxies requests securely via server-side endpoint `/api/ai/photo-match.php` without exposing keys to the browser.

---

## 10. Map Provider Configuration

- The platform embeds interactive mapping displaying live rescue nodes, relief distribution centers, and missing person last-seen waypoints using Leaflet and OpenStreetMap tiles.
- Custom marker clusters and offline fallback coordinates are built-in for zero-dependency resilience during network outages.
