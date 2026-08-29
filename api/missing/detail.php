<?php
/**
 * KHOJI NEPAL — Missing Person Detail API
 * GET /api/missing/detail.php?id=... OR ?report_id=...
 */

declare(strict_types=1);

namespace KhojiNepal\Api\Missing;

require_once __DIR__ . '/../auth/session.php';
require_once __DIR__ . '/../../config/database.php';

use KhojiNepal\Config\Database;
use KhojiNepal\Api\Config\ApiConfig;
use function KhojiNepal\Api\Auth\isPrivilegedUser;
use function KhojiNepal\Config\sanitizeMissingPersonPublic;
use function KhojiNepal\Config\logAudit;
use PDO;

ApiConfig::setJsonHeaders();

$id = $_GET['id'] ?? null;
$reportId = $_GET['report_id'] ?? null;

if (!$id && !$reportId) {
    ApiConfig::respondError('Person ID or Report ID is required.', 422);
}

try {
    $pdo = Database::getConnection();
    $isPrivileged = isPrivilegedUser();

    $sql = '
        SELECT 
            mp.*,
            rr.id AS rescue_record_id,
            rr.rescue_status,
            rr.rescued_date,
            rr.rescued_location,
            rr.rescue_team,
            rr.organization AS rescue_org
        FROM missing_persons mp
        LEFT JOIN rescue_records rr ON rr.person_id = mp.id
        WHERE (mp.id = :id OR mp.report_id = :report_id)
        LIMIT 1
    ';

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':id'        => is_numeric($id) ? (int)$id : 0,
        ':report_id' => $reportId ?? ''
    ]);

    $record = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$record) {
        ApiConfig::respondError('Missing person record not found.', 404);
    }

    // Log detail access
    $userId = $_SESSION['user_id'] ?? null;
    logAudit($pdo, $userId ? (int)$userId : null, 'VIEW_MISSING_DETAIL', 'missing_persons', (int)$record['id']);

    // Standardized public response attributes according to Phase 3 specification
    $sanitized = sanitizeMissingPersonPublic($record, $isPrivileged);

    $response = [
        'id'                     => (int)$sanitized['id'],
        'report_id'              => $sanitized['report_id'],
        'full_name'              => $sanitized['full_name'],
        'age'                    => $sanitized['age'] !== null ? (int)$sanitized['age'] : null,
        'gender'                 => $sanitized['gender'],
        'photo'                  => $sanitized['photo'] ?? 'assets/placeholder_avatar.png',
        'missing_date'           => $sanitized['missing_date'],
        'missing_time'           => $sanitized['missing_time'],
        'last_seen_location'     => $sanitized['last_seen_location'],
        'district'               => $sanitized['district'],
        'municipality'           => $sanitized['municipality'],
        'ward'                   => $sanitized['ward'],
        'description'            => $sanitized['description'],
        'clothing_description'   => $sanitized['clothing_description'],
        'identifying_marks'      => $sanitized['identifying_marks'],
        'status'                 => $sanitized['status'],
        'verification_status'    => $sanitized['verification_status'],
        'source_type'            => $sanitized['source_type'],
        'source_name'            => $sanitized['source_name'],
        'source_reference'       => $isPrivileged ? ($sanitized['source_reference'] ?? null) : null,
        'guardian_name'          => $sanitized['guardian_name'],
        'guardian_phone'         => $sanitized['guardian_phone'],
        'is_contact_masked'      => $sanitized['is_contact_masked'] ?? false,
        'contact_channel'        => $sanitized['contact_channel'] ?? null,
        'created_at'             => $sanitized['created_at'],
        'updated_at'             => $sanitized['updated_at'],
        'rescue_info'            => $record['rescue_record_id'] ? [
            'status'             => $record['rescue_status'],
            'rescued_date'       => $record['rescued_date'],
            'rescued_location'   => $record['rescued_location'],
            'rescue_team'        => $record['rescue_team'],
            'organization'       => $record['rescue_org']
        ] : null
    ];

    ApiConfig::respondSuccess($response);
} catch (\Throwable $e) {
    error_log('[Missing Detail Error] ' . $e->getMessage());
    ApiConfig::respondError('Failed to fetch missing person record.', 500);
}
