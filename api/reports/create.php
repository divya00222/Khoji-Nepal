<?php
/**
 * KHOJI NEPAL — Citizen Sighting & Verification Report API
 * POST /api/reports/create.php
 */

declare(strict_types=1);

namespace KhojiNepal\Api\Reports;

require_once __DIR__ . '/../auth/session.php';
require_once __DIR__ . '/../../config/database.php';

use KhojiNepal\Config\Database;
use KhojiNepal\Api\Config\ApiConfig;
use function KhojiNepal\Config\logAudit;
use PDO;

ApiConfig::setJsonHeaders();
ApiConfig::enforceRateLimit('reports_create', 20, 60);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ApiConfig::respondError('Method not allowed. Use POST.', 405);
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

$errors = [];
$reportType = trim($input['report_type'] ?? 'missing_sighting');
$targetId = isset($input['target_id']) && is_numeric($input['target_id']) ? (int)$input['target_id'] : null;
$reason = trim($input['reason'] ?? '');
$description = trim($input['description'] ?? '');

$allowedTypes = ['missing_sighting', 'fraud_flag', 'duplicate_claim', 'data_update', 'location_hazard'];
if (!in_array($reportType, $allowedTypes, true)) {
    $reportType = 'missing_sighting';
}

if (!$targetId) {
    $errors['target_id'] = 'Valid target person or incident ID is required.';
}
if (empty($reason)) {
    $errors['reason'] = 'Sighting or report summary is required.';
}

if (!empty($errors)) {
    ApiConfig::respondError('Validation failed.', 422, $errors);
}

try {
    $pdo = Database::getConnection();
    $reporterId = $_SESSION['user_id'] ?? null;

    $sql = '
        INSERT INTO reports (
            report_type, reporter_id, target_id, reason, description, status, created_at
        ) VALUES (
            :report_type, :reporter_id, :target_id, :reason, :description, "pending", NOW()
        )
    ';

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':report_type'  => $reportType,
        ':reporter_id'  => $reporterId,
        ':target_id'    => $targetId,
        ':reason'       => $reason,
        ':description'  => $description
    ]);

    $insertedId = (int)$pdo->lastInsertId();
    logAudit($pdo, $reporterId ? (int)$reporterId : null, 'CREATE_SIGHTING_REPORT', 'reports', $insertedId);

    ApiConfig::respondSuccess([
        'id'      => $insertedId,
        'message' => 'Sighting submission received. Forwarded to field verification unit.'
    ], 201);
} catch (\Throwable $e) {
    error_log('[Report Create Error] ' . $e->getMessage());
    ApiConfig::respondError('Failed to record submission.', 500);
}
