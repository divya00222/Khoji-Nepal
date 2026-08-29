<?php
/**
 * KHOJI NEPAL — Update Official Government News API (Authorized Only)
 * POST /api/news/update.php
 * 
 * Supports:
 * - Full content editing
 * - Publish / Unpublish toggling
 * - Verification status modification
 * - Importance marking (is_important)
 * - Custom publishing date & automatic updated timestamp
 * - Full audit trail logging
 */

declare(strict_types=1);

namespace KhojiNepal\Api\News;

require_once __DIR__ . '/../auth/session.php';
require_once __DIR__ . '/../../config/database.php';

use KhojiNepal\Config\Database;
use KhojiNepal\Api\Config\ApiConfig;
use function KhojiNepal\Api\Auth\isPrivilegedUser;
use function KhojiNepal\Config\logAudit;
use PDO;

ApiConfig::setJsonHeaders();

if (!isPrivilegedUser()) {
    ApiConfig::respondError('Unauthorized access. Only official verifiers and admins may edit announcements.', 403);
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

$id = isset($input['id']) && is_numeric($input['id']) ? (int)$input['id'] : null;
if (!$id) {
    ApiConfig::respondError('Valid news record ID is required.', 422);
}

$updates = [];
$params = [':id' => $id];

// Title
if (isset($input['title']) && trim($input['title']) !== '') {
    $updates[] = 'title = :title';
    $params[':title'] = trim($input['title']);
}

// Summary
if (isset($input['summary']) && trim($input['summary']) !== '') {
    $updates[] = 'summary = :summary';
    $params[':summary'] = trim($input['summary']);
}

// Content
if (isset($input['content']) && trim($input['content']) !== '') {
    $updates[] = 'content = :content';
    $params[':content'] = trim($input['content']);
}

// Organization
if (isset($input['organization']) && trim($input['organization']) !== '') {
    $updates[] = 'organization = :organization';
    $params[':organization'] = trim($input['organization']);
}

// Category
if (isset($input['category']) && trim($input['category']) !== '') {
    $updates[] = 'category = :category';
    $params[':category'] = strtoupper(trim($input['category']));
}

// Priority
if (isset($input['priority']) && in_array(strtolower(trim($input['priority'])), ['critical', 'warning', 'info'], true)) {
    $updates[] = 'priority = :priority';
    $params[':priority'] = strtolower(trim($input['priority']));
}

// Source URL
if (isset($input['source_url'])) {
    $updates[] = 'source_url = :source_url';
    $params[':source_url'] = trim($input['source_url']) ?: null;
}

// Verification Status
if (isset($input['verification_status']) && trim($input['verification_status']) !== '') {
    $vStatus = strtolower(trim($input['verification_status']));
    if (in_array($vStatus, ['official', 'verified', 'verified_bulletin', 'advisory', 'press_release', 'unverified'], true)) {
        $updates[] = 'verification_status = :verification_status';
        $params[':verification_status'] = $vStatus;
    }
}

// Important flag
if (isset($input['is_important'])) {
    $updates[] = 'is_important = :is_important';
    $params[':is_important'] = !empty($input['is_important']) ? 1 : 0;
}

// Published flag (Publish / Unpublish)
if (isset($input['is_published'])) {
    $updates[] = 'is_published = :is_published';
    $params[':is_published'] = !empty($input['is_published']) ? 1 : 0;
}

// Published At
if (isset($input['published_at']) && trim($input['published_at']) !== '') {
    $ts = strtotime(trim($input['published_at']));
    if ($ts !== false) {
        $updates[] = 'published_at = :published_at';
        $params[':published_at'] = date('Y-m-d H:i:s', $ts);
    }
}

// Image upload if via form-data
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $finfo = new \finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($_FILES['image']['tmp_name']);
    $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    if (isset($allowed[$mime])) {
        $uploadDir = __DIR__ . '/../../uploads/news/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        $safeName = 'news_' . date('Ymd_His') . '_' . bin2hex(random_bytes(6)) . '.' . $allowed[$mime];
        if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadDir . $safeName)) {
            $updates[] = 'image = :image';
            $params[':image'] = 'uploads/news/' . $safeName;
        }
    }
}

if (empty($updates)) {
    ApiConfig::respondError('No modifiable fields provided.', 422);
}

try {
    $pdo = Database::getConnection();
    
    // Always touch updated_at
    $sql = 'UPDATE government_news SET ' . implode(', ', $updates) . ', updated_at = NOW() WHERE id = :id';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    $userId = $_SESSION['user_id'] ?? null;
    logAudit($pdo, $userId ? (int)$userId : null, 'UPDATE_OFFICIAL_NEWS', 'government_news', $id);

    ApiConfig::respondSuccess([
        'id'      => $id,
        'message' => 'Official bulletin record updated successfully.'
    ]);
} catch (\Throwable $e) {
    error_log('[Update News Error] ' . $e->getMessage());
    ApiConfig::respondError('Failed to update bulletin record.', 500);
}
