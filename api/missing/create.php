<?php
/**
 * KHOJI NEPAL — Report Missing Person API
 * POST /api/missing/create.php
 * 
 * Validates: Name, age, gender, date, last seen location, reporter details.
 * Implements: Server-side validation, duplicate check, MIME validation,
 * secure image storage, and auto-generated report ID.
 */

declare(strict_types=1);

namespace KhojiNepal\Api\Missing;

require_once __DIR__ . '/../auth/session.php';
require_once __DIR__ . '/../../config/database.php';

use KhojiNepal\Config\Database;
use KhojiNepal\Api\Config\ApiConfig;
use function KhojiNepal\Api\Auth\validateCsrfToken;
use function KhojiNepal\Config\logAudit;
use PDO;

ApiConfig::setJsonHeaders();
ApiConfig::enforceRateLimit('missing_create', 20, 60);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ApiConfig::respondError('Method not allowed. Use POST.', 405);
}

// Support multipart/form-data or JSON
$data = $_POST;
if (empty($data)) {
    $raw = json_decode(file_get_contents('php://input'), true);
    if (is_array($raw)) {
        $data = $raw;
    }
}

// 1. Validate Required Fields
$errors = [];

$fullName = trim($data['full_name'] ?? '');
if (empty($fullName) || mb_strlen($fullName) < 2 || mb_strlen($fullName) > 150) {
    $errors['full_name'] = 'Full name is required (2 to 150 characters).';
}

$age = isset($data['age']) && is_numeric($data['age']) ? (int)$data['age'] : null;
if ($age !== null && ($age < 0 || $age > 125)) {
    $errors['age'] = 'Please enter a valid age between 0 and 125.';
}

$gender = strtolower(trim($data['gender'] ?? 'unknown'));
if (!in_array($gender, ['male', 'female', 'other', 'unknown'], true)) {
    $gender = 'unknown';
}

$missingDate = trim($data['missing_date'] ?? '');
if (empty($missingDate) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $missingDate)) {
    $errors['missing_date'] = 'Valid missing date (YYYY-MM-DD) is required.';
}

$lastSeenLocation = trim($data['last_seen_location'] ?? '');
if (empty($lastSeenLocation)) {
    $errors['last_seen_location'] = 'Last seen location is required.';
}

$district = trim($data['district'] ?? 'Rasuwa');
$municipality = trim($data['municipality'] ?? '');
$ward = trim($data['ward'] ?? '');
$description = trim($data['description'] ?? '');
$clothingDescription = trim($data['clothing_description'] ?? '');
$identifyingMarks = trim($data['identifying_marks'] ?? '');
$guardianName = trim($data['guardian_name'] ?? '');
$guardianPhone = trim($data['guardian_phone'] ?? '');

if (empty($guardianPhone) && empty($guardianName)) {
    $errors['guardian_phone'] = 'Reporter or guardian contact phone/name is required for verification.';
}

// 2. File Upload & MIME Validation
$photoPath = 'assets/placeholder_avatar.png';

if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
    $fileTmp = $_FILES['photo']['tmp_name'];
    $fileSize = $_FILES['photo']['size'];
    
    // Max 5MB file limit
    if ($fileSize > 5 * 1024 * 1024) {
        $errors['photo'] = 'Uploaded photo size must not exceed 5MB.';
    } else {
        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($fileTmp);
        $allowedMimes = [
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
            'image/webp' => 'webp'
        ];

        if (!isset($allowedMimes[$mime])) {
            $errors['photo'] = 'Invalid file format. Only JPG, PNG, and WebP images are allowed.';
        } else {
            $uploadDir = __DIR__ . '/../../uploads/missing/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            $ext = $allowedMimes[$mime];
            $safeName = 'mp_' . date('Ymd_His') . '_' . bin2hex(random_bytes(8)) . '.' . $ext;
            $destPath = $uploadDir . $safeName;
            
            if (move_uploaded_file($fileTmp, $destPath)) {
                $photoPath = 'uploads/missing/' . $safeName;
            }
        }
    }
}

if (!empty($errors)) {
    ApiConfig::respondError('Validation failed. Please correct the highlighted fields.', 422, $errors);
}

try {
    $pdo = Database::getConnection();

    // 3. Duplicate Report Warning Check
    $dupStmt = $pdo->prepare('
        SELECT id, report_id, full_name, missing_date, status 
        FROM missing_persons 
        WHERE LOWER(full_name) = LOWER(:name) 
          AND missing_date = :mdate 
          AND district = :district
        LIMIT 1
    ');
    $dupStmt->execute([
        ':name'     => $fullName,
        ':mdate'    => $missingDate,
        ':district' => $district
    ]);
    $existing = $dupStmt->fetch(PDO::FETCH_ASSOC);

    // 4. Generate Unique Sequential Report ID (e.g. KN-MP-2026-0042)
    $year = date('Y');
    $seqStmt = $pdo->query("SELECT COUNT(*) FROM missing_persons WHERE report_id LIKE 'KN-MP-{$year}-%'");
    $seqCount = (int)$seqStmt->fetchColumn() + 1;
    $reportId = sprintf('KN-MP-%s-%04d', $year, $seqCount);

    // Ensure collision avoidance
    $checkReportStmt = $pdo->prepare('SELECT COUNT(*) FROM missing_persons WHERE report_id = :rid');
    $checkReportStmt->execute([':rid' => $reportId]);
    if ((int)$checkReportStmt->fetchColumn() > 0) {
        $reportId = sprintf('KN-MP-%s-%04d-%s', $year, $seqCount, bin2hex(random_bytes(2)));
    }

    $insertSql = '
        INSERT INTO missing_persons (
            report_id, full_name, age, gender, photo, missing_date, missing_time,
            last_seen_location, district, municipality, ward, description,
            clothing_description, identifying_marks, guardian_name, guardian_phone,
            status, source_type, source_name, verification_status, created_at
        ) VALUES (
            :report_id, :full_name, :age, :gender, :photo, :missing_date, :missing_time,
            :last_seen_location, :district, :municipality, :ward, :description,
            :clothing_description, :identifying_marks, :guardian_name, :guardian_phone,
            :status, :source_type, :source_name, :verification_status, NOW()
        )
    ';

    $stmt = $pdo->prepare($insertSql);
    $stmt->execute([
        ':report_id'            => $reportId,
        ':full_name'            => $fullName,
        ':age'                  => $age,
        ':gender'               => $gender,
        ':photo'                => $photoPath,
        ':missing_date'         => $missingDate,
        ':missing_time'         => !empty($data['missing_time']) ? $data['missing_time'] : null,
        ':last_seen_location'   => $lastSeenLocation,
        ':district'             => $district,
        ':municipality'         => $municipality ?: null,
        ':ward'                 => $ward ?: null,
        ':description'          => $description ?: null,
        ':clothing_description' => $clothingDescription ?: null,
        ':identifying_marks'    => $identifyingMarks ?: null,
        ':guardian_name'        => $guardianName ?: null,
        ':guardian_phone'       => $guardianPhone ?: null,
        ':status'               => 'missing',
        ':source_type'          => 'citizen',
        ':source_name'          => $guardianName ?: 'Citizen Portal Intake',
        ':verification_status'  => 'pending'
    ]);

    $insertedId = (int)$pdo->lastInsertId();
    $userId = $_SESSION['user_id'] ?? null;
    logAudit($pdo, $userId ? (int)$userId : null, 'CREATE_MISSING_REPORT', 'missing_persons', $insertedId);

    $responseData = [
        'id'                  => $insertedId,
        'report_id'           => $reportId,
        'full_name'           => $fullName,
        'status'              => 'missing',
        'verification_status' => 'pending',
        'message'             => 'Report submitted successfully. Case ID assigned for tracking and official verification.'
    ];

    if ($existing) {
        $responseData['duplicate_warning'] = [
            'message'              => 'A matching report already exists in the system under verification.',
            'existing_report_id'   => $existing['report_id']
        ];
    }

    ApiConfig::respondSuccess($responseData, 201);
} catch (\Throwable $e) {
    error_log('[Create Missing Error] ' . $e->getMessage());
    ApiConfig::respondError('Failed to record missing person report. Please try again.', 500);
}
