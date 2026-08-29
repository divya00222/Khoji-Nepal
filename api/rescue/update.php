<?php
/**
 * KHOJI NEPAL — Rescue Record Update API
 * POST /api/rescue/update.php
 */

declare(strict_types=1);

namespace KhojiNepal\Api\Rescue;

require_once __DIR__ . '/../auth/session.php';
require_once __DIR__ . '/../../config/database.php';

use KhojiNepal\Config\Database;
use KhojiNepal\Api\Config\ApiConfig;
use function KhojiNepal\Api\Auth\isPrivilegedUser;
use function KhojiNepal\Config\logAudit;
use PDO;

ApiConfig::setJsonHeaders();

if (!isPrivilegedUser()) {
    ApiConfig::respondError('Unauthorized. Only authorized rescue coordinators can update rescue records.', 403);
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

$id = isset($input['id']) && is_numeric($input['id']) ? (int)$input['id'] : null;
if (!$id) {
    ApiConfig::respondError('Valid rescue record ID is required.', 422);
}

$rescueStatus = trim($input['rescue_status'] ?? '');
$currentLocation = trim($input['current_location'] ?? '');
$description = trim($input['description'] ?? '');

$updates = [];
$params = [':id' => $id];

if ($rescueStatus !== '') {
    $updates[] = 'rescue_status = :rescue_status';
    $params[':rescue_status'] = $rescueStatus;
}
if ($currentLocation !== '') {
    $updates[] = 'current_location = :current_location';
    $params[':current_location'] = $currentLocation;
}
if ($description !== '') {
    $updates[] = 'description = :description';
    $params[':description'] = $description;
}

if (empty($updates)) {
    ApiConfig::respondError('No fields to update provided.', 422);
}

try {
    $pdo = Database::getConnection();
    $sql = 'UPDATE rescue_records SET ' . implode(', ', $updates) . ', updated_at = NOW() WHERE id = :id';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    $userId = $_SESSION['user_id'] ?? null;
    logAudit($pdo, $userId ? (int)$userId : null, 'UPDATE_RESCUE_RECORD', 'rescue_records', $id);

    ApiConfig::respondSuccess([
        'id'      => $id,
        'message' => 'Rescue operation log updated.'
    ]);
} catch (\Throwable $e) {
    error_log('[Rescue Update Error] ' . $e->getMessage());
    ApiConfig::respondError('Failed to update rescue record.', 500);
}
