<?php
/**
 * KHOJI NEPAL — Delete / Archive Official Government News API (Authorized Only)
 * POST /api/news/delete.php
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
    ApiConfig::respondError('Unauthorized access. Only official verifiers and administrators may archive advisories.', 403);
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

$id = isset($input['id']) && is_numeric($input['id']) ? (int)$input['id'] : null;
if (!$id) {
    ApiConfig::respondError('Valid record ID is required.', 422);
}

$permanent = isset($input['permanent']) && ($input['permanent'] === true || $input['permanent'] === '1');

try {
    $pdo = Database::getConnection();
    $userId = $_SESSION['user_id'] ?? null;

    if ($permanent) {
        $stmt = $pdo->prepare('DELETE FROM government_news WHERE id = :id');
        $stmt->execute([':id' => $id]);
        logAudit($pdo, $userId ? (int)$userId : null, 'DELETE_OFFICIAL_NEWS_PERMANENT', 'government_news', $id);
        $msg = 'Official announcement permanently deleted.';
    } else {
        $stmt = $pdo->prepare('UPDATE government_news SET is_archived = 1, is_published = 0, updated_at = NOW() WHERE id = :id');
        $stmt->execute([':id' => $id]);
        logAudit($pdo, $userId ? (int)$userId : null, 'ARCHIVE_OFFICIAL_NEWS', 'government_news', $id);
        $msg = 'Official announcement successfully archived.';
    }

    ApiConfig::respondSuccess([
        'id'      => $id,
        'message' => $msg
    ]);
} catch (\Throwable $e) {
    error_log('[Delete News Error] ' . $e->getMessage());
    ApiConfig::respondError('Failed to delete/archive bulletin record.', 500);
}
