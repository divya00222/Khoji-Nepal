<?php
/**
 * KHOJI NEPAL — Update Relief SOS Request API
 * POST /api/relief/update-request.php
 */

declare(strict_types=1);

namespace KhojiNepal\Api\Relief;

require_once __DIR__ . '/../auth/session.php';
require_once __DIR__ . '/../../config/database.php';

use KhojiNepal\Config\Database;
use KhojiNepal\Api\Config\ApiConfig;
use function KhojiNepal\Api\Auth\isPrivilegedUser;
use function KhojiNepal\Config\logAudit;
use PDO;

ApiConfig::setJsonHeaders();

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

$id = isset($input['id']) && is_numeric($input['id']) ? (int)$input['id'] : null;
$requestId = trim($input['request_id'] ?? '');

if (!$id && empty($requestId)) {
    ApiConfig::respondError('Valid request ID is required.', 422);
}

$status = trim($input['status'] ?? '');
$priority = trim($input['priority'] ?? '');
$assignedTeam = trim($input['assigned_team'] ?? '');
$adminNotes = trim($input['admin_notes'] ?? '');

$updates = [];
$params = [];

if ($id) {
    $where = 'id = :id';
    $params[':id'] = $id;
} else {
    $where = 'request_id = :request_id';
    $params[':request_id'] = $requestId;
}

$allowedStatuses = ['pending', 'assigned', 'in_progress', 'dispatched', 'acknowledged', 'resolved', 'rejected'];
if ($status !== '') {
    if (in_array(strtolower($status), $allowedStatuses, true)) {
        $updates[] = 'status = :status';
        $params[':status'] = strtolower($status);
    }
}

$allowedPriorities = ['low', 'medium', 'high', 'critical'];
if ($priority !== '') {
    if (in_array(strtolower($priority), $allowedPriorities, true)) {
        $updates[] = 'priority = :priority';
        $params[':priority'] = strtolower($priority);
    }
}

if ($assignedTeam !== '') {
    $updates[] = 'assigned_team = :assigned_team';
    $params[':assigned_team'] = $assignedTeam;
}

if ($adminNotes !== '') {
    $updates[] = 'description = CONCAT(description, "\n[Update: ", :notes, "]")';
    $params[':notes'] = $adminNotes;
}

if (empty($updates)) {
    ApiConfig::respondError('No valid fields to update provided.', 422);
}

try {
    $pdo = Database::getConnection();
    $sql = "UPDATE relief_requests SET " . implode(', ', $updates) . " WHERE {$where}";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    $userId = $_SESSION['user_id'] ?? null;
    logAudit($pdo, $userId ? (int)$userId : null, 'UPDATE_RELIEF_REQUEST', 'relief_requests', $id);

    ApiConfig::respondSuccess([
        'message' => 'Relief request status updated successfully.'
    ]);
} catch (\Throwable $e) {
    error_log('[Update Relief Request Error] ' . $e->getMessage());
    ApiConfig::respondError('Failed to update relief request.', 500);
}
