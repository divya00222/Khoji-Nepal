<?php
/**
 * KHOJI NEPAL — Rescue Record Detail API
 * GET /api/rescue/detail.php?id=...
 */

declare(strict_types=1);

namespace KhojiNepal\Api\Rescue;

require_once __DIR__ . '/../auth/session.php';
require_once __DIR__ . '/../../config/database.php';

use KhojiNepal\Config\Database;
use KhojiNepal\Api\Config\ApiConfig;
use PDO;

ApiConfig::setJsonHeaders();

$id = $_GET['id'] ?? null;
if (!$id || !is_numeric($id)) {
    ApiConfig::respondError('Valid rescue record ID is required.', 422);
}

try {
    $pdo = Database::getConnection();
    $sql = '
        SELECT 
            rr.*,
            mp.full_name AS person_name,
            mp.report_id AS person_report_id,
            mp.age AS person_age,
            mp.gender AS person_gender,
            mp.photo AS person_photo,
            loc_h.name AS hospital_name,
            loc_h.address AS hospital_address,
            loc_s.name AS shelter_name,
            loc_s.address AS shelter_address,
            u.name AS verifier_name
        FROM rescue_records rr
        LEFT JOIN missing_persons mp ON mp.id = rr.person_id
        LEFT JOIN locations loc_h ON loc_h.id = rr.hospital_id
        LEFT JOIN locations loc_s ON loc_s.id = rr.shelter_id
        LEFT JOIN users u ON u.id = rr.verified_by
        WHERE rr.id = :id
        LIMIT 1
    ';

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id' => (int)$id]);
    $record = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$record) {
        ApiConfig::respondError('Rescue record not found.', 404);
    }

    ApiConfig::respondSuccess($record);
} catch (\Throwable $e) {
    error_log('[Rescue Detail Error] ' . $e->getMessage());
    ApiConfig::respondError('Failed to fetch rescue details.', 500);
}
