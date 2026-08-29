<?php
/**
 * KHOJI NEPAL — Found Person Detail API
 * GET /api/found/detail.php?id=...
 */

declare(strict_types=1);

namespace KhojiNepal\Api\Found;

require_once __DIR__ . '/../auth/session.php';
require_once __DIR__ . '/../../config/database.php';

use KhojiNepal\Config\Database;
use KhojiNepal\Api\Config\ApiConfig;
use PDO;

ApiConfig::setJsonHeaders();

$id = $_GET['id'] ?? null;
$reportId = $_GET['report_id'] ?? null;

if (!$id && !$reportId) {
    ApiConfig::respondError('Found Person ID or Report ID is required.', 422);
}

try {
    $pdo = Database::getConnection();
    $stmt = $pdo->prepare('
        SELECT * FROM found_persons 
        WHERE (id = :id OR report_id = :report_id) 
        LIMIT 1
    ');
    $stmt->execute([
        ':id'        => is_numeric($id) ? (int)$id : 0,
        ':report_id' => $reportId ?? ''
    ]);
    $record = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$record) {
        ApiConfig::respondError('Found person record not found.', 404);
    }

    ApiConfig::respondSuccess($record);
} catch (\Throwable $e) {
    error_log('[Found Detail Error] ' . $e->getMessage());
    ApiConfig::respondError('Failed to fetch found person record.', 500);
}
