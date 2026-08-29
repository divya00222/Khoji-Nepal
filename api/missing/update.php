<?php
/**
 * KHOJI NEPAL — Update Missing Person API (Authorized Only)
 * POST /api/missing/update.php
 */

declare(strict_types=1);

namespace KhojiNepal\Api\Missing;

require_once __DIR__ . '/../auth/session.php';
require_once __DIR__ . '/../../config/database.php';

use KhojiNepal\Config\Database;
use KhojiNepal\Api\Config\ApiConfig;
use function KhojiNepal\Api\Auth\isPrivilegedUser;
use function KhojiNepal\Config\logAudit;
use PDO;

ApiConfig::setJsonHeaders();

if (!isPrivilegedUser()) {
    ApiConfig::respondError('Unauthorized access. Official verification privileges required.', 403);
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

$id = isset($input['id']) && is_numeric($input['id']) ? (int)$input['id'] : null;
if (!$id) {
    ApiConfig::respondError('Valid record ID is required.', 422);
}

$status = trim($input['status'] ?? '');
$verificationStatus = trim($input['verification_status'] ?? '');

$allowedStatus = ['missing', 'rescued', 'found', 'deceased', 'closed'];
$allowedVerification = ['pending', 'verified', 'rejected', 'under_review'];

$updates = [];
$params = [':id' => $id];

if ($status !== '' && in_array($status, $allowedStatus, true)) {
    $updates[] = 'status = :status';
    $params[':status'] = $status;
}

if ($verificationStatus !== '' && in_array($verificationStatus, $allowedVerification, true)) {
    $updates[] = 'verification_status = :verification_status';
    $params[':verification_status'] = $verificationStatus;
}

if (empty($updates)) {
    ApiConfig::respondError('No valid update parameters provided.', 422);
}

try {
    $pdo = Database::getConnection();
    $sql = 'UPDATE missing_persons SET ' . implode(', ', $updates) . ', updated_at = NOW() WHERE id = :id';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    $userId = $_SESSION['user_id'] ?? null;
    logAudit($pdo, $userId ? (int)$userId : null, 'UPDATE_MISSING_STATUS', 'missing_persons', $id);

    ApiConfig::respondSuccess([
        'id'      => $id,
        'message' => 'Missing person record updated successfully.'
    ]);
} catch (\Throwable $e) {
    error_log('[Update Missing Error] ' . $e->getMessage());
    ApiConfig::respondError('Failed to update missing person record.', 500);
}
