<?php
/**
 * KHOJI NEPAL — Relief Requests List API
 * GET /api/relief/requests.php
 */

declare(strict_types=1);

namespace KhojiNepal\Api\Relief;

require_once __DIR__ . '/../auth/session.php';
require_once __DIR__ . '/../../config/database.php';

use KhojiNepal\Config\Database;
use KhojiNepal\Api\Config\ApiConfig;
use function KhojiNepal\Api\Auth\isPrivilegedUser;
use function KhojiNepal\Config\sanitizeReliefRequestPublic;
use PDO;

ApiConfig::setJsonHeaders();

try {
    $pdo = Database::getConnection();
    $isPrivileged = isPrivilegedUser();

    $priority = trim($_GET['priority'] ?? 'all');
    $status = trim($_GET['status'] ?? 'all');

    $where = ['1=1'];
    $params = [];

    if ($priority !== '' && strtolower($priority) !== 'all') {
        $where[] = 'LOWER(priority) = :priority';
        $params[':priority'] = strtolower($priority);
    }
    if ($status !== '' && strtolower($status) !== 'all') {
        $where[] = 'LOWER(status) = :status';
        $params[':status'] = strtolower($status);
    }

    $sql = '
        SELECT 
            rr.id,
            rr.request_id,
            rr.requester_name,
            rr.phone,
            rr.location_id,
            rr.latitude,
            rr.longitude,
            rr.people_count,
            rr.request_type,
            rr.description,
            rr.priority,
            rr.status,
            rr.assigned_team,
            rr.created_at,
            rr.updated_at,
            loc.name AS location_name
        FROM relief_requests rr
        LEFT JOIN locations loc ON loc.id = rr.location_id
        WHERE ' . implode(' AND ', $where) . '
        ORDER BY FIELD(rr.priority, "critical", "high", "medium", "low"), rr.created_at DESC
    ';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $sanitized = array_map(function ($r) use ($isPrivileged) {
        return sanitizeReliefRequestPublic($r, $isPrivileged);
    }, $rows);

    ApiConfig::respondSuccess([
        'requests' => $sanitized,
        'count'    => count($sanitized)
    ]);
} catch (\Throwable $e) {
    error_log('[Relief Requests Error] ' . $e->getMessage());
    ApiConfig::respondError('Failed to fetch relief requests.', 500);
}
