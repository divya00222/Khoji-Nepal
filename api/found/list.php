<?php
/**
 * KHOJI NEPAL — Found Persons List API
 * GET /api/found/list.php
 */

declare(strict_types=1);

namespace KhojiNepal\Api\Found;

require_once __DIR__ . '/../auth/session.php';
require_once __DIR__ . '/../../config/database.php';

use KhojiNepal\Config\Database;
use KhojiNepal\Api\Config\ApiConfig;
use PDO;

ApiConfig::setJsonHeaders();
ApiConfig::enforceRateLimit('found_list', 120, 60);

try {
    $pdo = Database::getConnection();

    $gender = trim($_GET['gender'] ?? 'all');
    $status = trim($_GET['verification_status'] ?? 'all');
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = min(50, max(1, (int)($_GET['limit'] ?? 12)));
    $offset = ($page - 1) * $limit;

    $where = ['1=1'];
    $params = [];

    if ($gender !== '' && strtolower($gender) !== 'all') {
        $where[] = 'LOWER(gender) = :gender';
        $params[':gender'] = strtolower($gender);
    }

    if ($status !== '' && strtolower($status) !== 'all') {
        $where[] = 'LOWER(verification_status) = :status';
        $params[':status'] = strtolower($status);
    }

    $whereSql = implode(' AND ', $where);

    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM found_persons WHERE {$whereSql}");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    $dataStmt = $pdo->prepare("
        SELECT id, report_id, approx_name, approx_age, gender, photo,
               found_date, found_location, current_location, description,
               source_type, source_name, verification_status, created_at, updated_at
        FROM found_persons
        WHERE {$whereSql}
        ORDER BY created_at DESC
        LIMIT :limit OFFSET :offset
    ");

    foreach ($params as $k => $v) {
        $dataStmt->bindValue($k, $v);
    }
    $dataStmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $dataStmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $dataStmt->execute();

    $records = $dataStmt->fetchAll(PDO::FETCH_ASSOC);

    ApiConfig::respondSuccess([
        'records'    => $records,
        'pagination' => [
            'total'       => $total,
            'page'        => $page,
            'limit'       => $limit,
            'total_pages' => (int)ceil($total / $limit)
        ]
    ]);
} catch (\Throwable $e) {
    error_log('[Found List Error] ' . $e->getMessage());
    ApiConfig::respondError('Failed to fetch found persons list.', 500);
}
