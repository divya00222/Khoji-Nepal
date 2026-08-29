<?php
/**
 * KHOJI NEPAL — Create Relief SOS Request API
 * POST /api/relief/create-request.php
 */

declare(strict_types=1);

namespace KhojiNepal\Api\Relief;

require_once __DIR__ . '/../auth/session.php';
require_once __DIR__ . '/../../config/database.php';

use KhojiNepal\Config\Database;
use KhojiNepal\Api\Config\ApiConfig;
use function KhojiNepal\Config\logAudit;
use PDO;

ApiConfig::setJsonHeaders();
ApiConfig::enforceRateLimit('relief_create_req', 20, 60);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ApiConfig::respondError('Method not allowed. Use POST.', 405);
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

$errors = [];
$requesterName = trim($input['requester_name'] ?? '');
$phone = trim($input['phone'] ?? '');
$peopleCount = isset($input['people_count']) && is_numeric($input['people_count']) ? (int)$input['people_count'] : 1;
$requestType = trim($input['request_type'] ?? 'food_water');
$description = trim($input['description'] ?? '');
$priority = trim($input['priority'] ?? 'high');
$locationId = isset($input['location_id']) && is_numeric($input['location_id']) ? (int)$input['location_id'] : null;
$lat = isset($input['latitude']) && is_numeric($input['latitude']) ? (float)$input['latitude'] : null;
$lng = isset($input['longitude']) && is_numeric($input['longitude']) ? (float)$input['longitude'] : null;

if (empty($requesterName)) {
    $errors['requester_name'] = 'Requester name is required.';
}
if (empty($phone)) {
    $errors['phone'] = 'Contact phone number is required.';
}
if (empty($description)) {
    $errors['description'] = 'Description of urgent need is required.';
}

$allowedTypes = ['food_water', 'medical_evac', 'shelter_blankets', 'rescue_extraction', 'other'];
if (!in_array($requestType, $allowedTypes, true)) {
    $requestType = 'food_water';
}

$allowedPriorities = ['low', 'medium', 'high', 'critical'];
if (!in_array($priority, $allowedPriorities, true)) {
    $priority = 'high';
}

if (!empty($errors)) {
    ApiConfig::respondError('Validation failed.', 422, $errors);
}

try {
    $pdo = Database::getConnection();
    $year = date('Y');
    $seqStmt = $pdo->query("SELECT COUNT(*) FROM relief_requests WHERE request_id LIKE 'KN-RR-{$year}-%'");
    $requestId = sprintf('KN-RR-%s-%04d', $year, (int)$seqStmt->fetchColumn() + 1);

    $sql = '
        INSERT INTO relief_requests (
            request_id, requester_name, phone, location_id, latitude, longitude,
            people_count, request_type, description, priority, status, created_at
        ) VALUES (
            :request_id, :requester_name, :phone, :location_id, :latitude, :longitude,
            :people_count, :request_type, :description, :priority, "pending", NOW()
        )
    ';

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':request_id'     => $requestId,
        ':requester_name' => $requesterName,
        ':phone'          => $phone,
        ':location_id'    => $locationId,
        ':latitude'       => $lat,
        ':longitude'      => $lng,
        ':people_count'   => max(1, $peopleCount),
        ':request_type'   => $requestType,
        ':description'    => $description,
        ':priority'       => $priority
    ]);

    $insertedId = (int)$pdo->lastInsertId();
    $userId = $_SESSION['user_id'] ?? null;
    logAudit($pdo, $userId ? (int)$userId : null, 'CREATE_RELIEF_REQUEST', 'relief_requests', $insertedId);

    ApiConfig::respondSuccess([
        'id'         => $insertedId,
        'request_id' => $requestId,
        'message'    => 'Emergency relief request recorded. Forwarded to Joint Operations Room.'
    ], 201);
} catch (\Throwable $e) {
    error_log('[Create Relief Request Error] ' . $e->getMessage());
    ApiConfig::respondError('Failed to record relief request.', 500);
}
