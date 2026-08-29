<?php
/**
 * KHOJI NEPAL — Rescue Records List API
 * GET /api/rescue/list.php
 */

declare(strict_types=1);

namespace KhojiNepal\Api\Rescue;

require_once __DIR__ . '/../auth/session.php';
require_once __DIR__ . '/../../config/database.php';

use KhojiNepal\Config\Database;
use KhojiNepal\Api\Config\ApiConfig;
use PDO;

ApiConfig::setJsonHeaders();

try {
    $pdo = Database::getConnection();

    $status = trim($_GET['status'] ?? 'all');
    $where = ['1=1'];
    $params = [];

    if ($status !== '' && strtolower($status) !== 'all') {
        $where[] = 'LOWER(rr.rescue_status) = :status';
        $params[':status'] = strtolower($status);
    }

    $sql = '
        SELECT 
            rr.id,
            rr.person_id,
            rr.rescue_status,
            rr.rescued_date,
            rr.rescued_location,
            rr.current_location,
            rr.rescue_team,
            rr.organization,
            rr.description,
            mp.full_name AS person_name,
            mp.report_id AS person_report_id,
            mp.photo AS person_photo,
            loc_h.name AS hospital_name,
            loc_s.name AS shelter_name
        FROM rescue_records rr
        LEFT JOIN missing_persons mp ON mp.id = rr.person_id
        LEFT JOIN locations loc_h ON loc_h.id = rr.hospital_id
        LEFT JOIN locations loc_s ON loc_s.id = rr.shelter_id
        WHERE ' . implode(' AND ', $where) . '
        ORDER BY rr.rescued_date DESC
    ';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);

    ApiConfig::respondSuccess([
        'records' => $records,
        'count'   => count($records)
    ]);
} catch (\Throwable $e) {
    error_log('[Rescue List Error] ' . $e->getMessage());
    ApiConfig::respondError('Failed to fetch rescue operations records.', 500);
}
