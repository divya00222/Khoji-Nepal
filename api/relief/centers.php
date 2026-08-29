<?php
/**
 * KHOJI NEPAL — Relief Centers Resource List API
 * GET /api/relief/centers.php
 */

declare(strict_types=1);

namespace KhojiNepal\Api\Relief;

require_once __DIR__ . '/../auth/session.php';
require_once __DIR__ . '/../../config/database.php';

use KhojiNepal\Config\Database;
use KhojiNepal\Api\Config\ApiConfig;
use PDO;

ApiConfig::setJsonHeaders();

try {
    $pdo = Database::getConnection();

    $sql = '
        SELECT 
            rc.id,
            rc.name,
            rc.location_id,
            rc.organization,
            rc.food_status,
            rc.water_status,
            rc.medicine_status,
            rc.blanket_status,
            rc.other_resources,
            rc.contact_phone,
            rc.opening_hours,
            rc.status,
            rc.last_updated,
            loc.name AS location_name,
            loc.district,
            loc.municipality,
            loc.ward,
            loc.latitude,
            loc.longitude,
            loc.address
        FROM relief_centers rc
        INNER JOIN locations loc ON loc.id = rc.location_id
        ORDER BY rc.id ASC
    ';

    $stmt = $pdo->query($sql);
    $centers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    ApiConfig::respondSuccess([
        'centers' => $centers,
        'count'   => count($centers)
    ]);
} catch (\Throwable $e) {
    error_log('[Relief Centers Error] ' . $e->getMessage());
    ApiConfig::respondError('Failed to fetch relief centers status.', 500);
}
