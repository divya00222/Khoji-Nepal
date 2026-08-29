<?php
/**
 * KHOJI NEPAL — Report Found Person API
 * POST /api/found/create.php
 */

declare(strict_types=1);

namespace KhojiNepal\Api\Found;

require_once __DIR__ . '/../auth/session.php';
require_once __DIR__ . '/../../config/database.php';

use KhojiNepal\Config\Database;
use KhojiNepal\Api\Config\ApiConfig;
use function KhojiNepal\Config\logAudit;
use PDO;

ApiConfig::setJsonHeaders();
ApiConfig::enforceRateLimit('found_create', 20, 60);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ApiConfig::respondError('Method not allowed. Use POST.', 405);
}

$data = $_POST;
if (empty($data)) {
    $raw = json_decode(file_get_contents('php://input'), true);
    if (is_array($raw)) {
        $data = $raw;
    }
}

$errors = [];
$foundLocation = trim($data['found_location'] ?? '');
$currentLocation = trim($data['current_location'] ?? '');
$foundDate = trim($data['found_date'] ?? date('Y-m-d'));

if (empty($foundLocation)) {
    $errors['found_location'] = 'Found location is required.';
}
if (empty($currentLocation)) {
    $errors['current_location'] = 'Current shelter or hospital location is required.';
}

$photoPath = 'assets/placeholder_avatar.png';
if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
    $finfo = new \finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($_FILES['photo']['tmp_name']);
    $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    if (isset($allowed[$mime])) {
        $uploadDir = __DIR__ . '/../../uploads/found/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        $safeName = 'fp_' . date('Ymd_His') . '_' . bin2hex(random_bytes(8)) . '.' . $allowed[$mime];
        if (move_uploaded_file($_FILES['photo']['tmp_name'], $uploadDir . $safeName)) {
            $photoPath = 'uploads/found/' . $safeName;
        }
    }
}

if (!empty($errors)) {
    ApiConfig::respondError('Validation failed.', 422, $errors);
}

try {
    $pdo = Database::getConnection();
    $year = date('Y');
    $seqStmt = $pdo->query("SELECT COUNT(*) FROM found_persons WHERE report_id LIKE 'KN-FP-{$year}-%'");
    $reportId = sprintf('KN-FP-%s-%04d', $year, (int)$seqStmt->fetchColumn() + 1);

    $sql = '
        INSERT INTO found_persons (
            report_id, approx_name, approx_age, gender, photo,
            found_date, found_location, current_location, description,
            source_type, source_name, verification_status, created_at
        ) VALUES (
            :report_id, :approx_name, :approx_age, :gender, :photo,
            :found_date, :found_location, :current_location, :description,
            :source_type, :source_name, :verification_status, NOW()
        )
    ';

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':report_id'           => $reportId,
        ':approx_name'         => trim($data['approx_name'] ?? '') ?: 'Unidentified Citizen',
        ':approx_age'          => isset($data['approx_age']) && is_numeric($data['approx_age']) ? (int)$data['approx_age'] : null,
        ':gender'              => strtolower(trim($data['gender'] ?? 'unknown')),
        ':photo'               => $photoPath,
        ':found_date'          => $foundDate,
        ':found_location'      => $foundLocation,
        ':current_location'    => $currentLocation,
        ':description'         => trim($data['description'] ?? ''),
        ':source_type'         => trim($data['source_type'] ?? 'citizen'),
        ':source_name'         => trim($data['source_name'] ?? 'Intake Desk'),
        ':verification_status' => 'pending'
    ]);

    $insertedId = (int)$pdo->lastInsertId();
    $userId = $_SESSION['user_id'] ?? null;
    logAudit($pdo, $userId ? (int)$userId : null, 'CREATE_FOUND_REPORT', 'found_persons', $insertedId);

    ApiConfig::respondSuccess([
        'id'        => $insertedId,
        'report_id' => $reportId,
        'message'   => 'Found person intake recorded. Verification underway.'
    ], 201);
} catch (\Throwable $e) {
    error_log('[Found Create Error] ' . $e->getMessage());
    ApiConfig::respondError('Failed to record found person report.', 500);
}
