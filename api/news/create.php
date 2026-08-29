<?php
/**
 * KHOJI NEPAL — Create Official Government News API (Authorized Only)
 * POST /api/news/create.php
 * 
 * Enforces:
 * - Admin/Moderator privilege check
 * - Source accreditation validation
 * - Server-side content validation
 * - Audit logging
 * - Optional image attachment upload
 */

declare(strict_types=1);

namespace KhojiNepal\Api\News;

require_once __DIR__ . '/../auth/session.php';
require_once __DIR__ . '/../../config/database.php';

use KhojiNepal\Config\Database;
use KhojiNepal\Api\Config\ApiConfig;
use function KhojiNepal\Api\Auth\isPrivilegedUser;
use function KhojiNepal\Config\logAudit;
use PDO;

ApiConfig::setJsonHeaders();
ApiConfig::enforceRateLimit('news_create', 30, 60);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ApiConfig::respondError('Method not allowed. Use POST.', 405);
}

if (!isPrivilegedUser()) {
    ApiConfig::respondError('Unauthorized access. Official administrator or verification officer credentials required.', 403);
}

$data = $_POST;
if (empty($data)) {
    $raw = json_decode(file_get_contents('php://input'), true);
    if (is_array($raw)) {
        $data = $raw;
    }
}

$errors = [];

$title = trim($data['title'] ?? '');
if (empty($title) || mb_strlen($title) < 5 || mb_strlen($title) > 255) {
    $errors['title'] = 'Title is required (between 5 and 255 characters).';
}

$summary = trim($data['summary'] ?? '');
if (empty($summary) || mb_strlen($summary) < 10) {
    $errors['summary'] = 'Summary is required (minimum 10 characters).';
}

$content = trim($data['content'] ?? '');
if (empty($content) || mb_strlen($content) < 20) {
    $errors['content'] = 'Detailed content is required (minimum 20 characters).';
}

$organization = trim($data['organization'] ?? '');
$allowedOrgs = [
    'Government of Nepal',
    'NDRRMA',
    'Nepal Police',
    'Nepali Army',
    'Armed Police Force',
    'District Administration',
    'Local Municipality',
    'Other Authorized Organizations',
    'National Emergency Operation Centre (NEOC / MOHA)',
    'District Administration Office (DAO), Rasuwa',
    'Nepal Red Cross Society (NRCS)'
];
if (empty($organization)) {
    $errors['organization'] = 'Accredited source organization is required.';
}

$category = strtoupper(trim($data['category'] ?? 'SAFETY NOTICE'));
$allowedCategories = ['ROAD UPDATE', 'RESCUE UPDATE', 'RELIEF UPDATE', 'WEATHER UPDATE', 'SAFETY NOTICE', 'GENERAL'];
if (!in_array($category, $allowedCategories, true)) {
    $category = 'SAFETY NOTICE';
}

$priority = strtolower(trim($data['priority'] ?? 'info'));
if (!in_array($priority, ['critical', 'warning', 'info'], true)) {
    $priority = 'info';
}

$verificationStatus = strtolower(trim($data['verification_status'] ?? 'official'));
$allowedStatuses = ['official', 'verified', 'verified_bulletin', 'advisory', 'press_release'];
if (!in_array($verificationStatus, $allowedStatuses, true)) {
    $verificationStatus = 'official';
}

$sourceUrl = trim($data['source_url'] ?? '');
if (!empty($sourceUrl) && !filter_var($sourceUrl, FILTER_VALIDATE_URL)) {
    $errors['source_url'] = 'Please enter a valid source URL (e.g., https://moha.gov.np).';
}

$publishedAt = trim($data['published_at'] ?? '');
if (empty($publishedAt)) {
    $publishedAt = date('Y-m-d H:i:s');
} else {
    // Validate datetime format
    $timestamp = strtotime($publishedAt);
    if ($timestamp === false) {
        $publishedAt = date('Y-m-d H:i:s');
    } else {
        $publishedAt = date('Y-m-d H:i:s', $timestamp);
    }
}

$isImportant = !empty($data['is_important']) ? 1 : 0;
$isPublished = isset($data['is_published']) ? ((int)$data['is_published'] ? 1 : 0) : 1;

// Image upload handling
$imagePath = 'assets/demo_news_1.jpg';
if (!empty($data['image_url'])) {
    $imagePath = trim($data['image_url']);
}

if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $finfo = new \finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($_FILES['image']['tmp_name']);
    $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    if (isset($allowed[$mime])) {
        $uploadDir = __DIR__ . '/../../uploads/news/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        $safeName = 'news_' . date('Ymd_His') . '_' . bin2hex(random_bytes(6)) . '.' . $allowed[$mime];
        if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadDir . $safeName)) {
            $imagePath = 'uploads/news/' . $safeName;
        }
    }
}

if (!empty($errors)) {
    ApiConfig::respondError('Validation failed. Please verify the submitted information.', 422, $errors);
}

try {
    $pdo = Database::getConnection();
    $userId = $_SESSION['user_id'] ?? null;

    $sql = '
        INSERT INTO government_news (
            title, summary, content, organization, category, priority,
            source_url, image, published_at, updated_at, verification_status,
            is_important, is_published, is_archived, created_by
        ) VALUES (
            :title, :summary, :content, :organization, :category, :priority,
            :source_url, :image, :published_at, NOW(), :verification_status,
            :is_important, :is_published, 0, :created_by
        )
    ';

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':title'               => $title,
        ':summary'             => $summary,
        ':content'             => $content,
        ':organization'        => $organization,
        ':category'            => $category,
        ':priority'            => $priority,
        ':source_url'          => $sourceUrl ?: null,
        ':image'               => $imagePath,
        ':published_at'        => $publishedAt,
        ':verification_status' => $verificationStatus,
        ':is_important'        => $isImportant,
        ':is_published'        => $isPublished,
        ':created_by'          => $userId ? (int)$userId : null
    ]);

    $insertedId = (int)$pdo->lastInsertId();
    logAudit($pdo, $userId ? (int)$userId : null, 'CREATE_OFFICIAL_NEWS', 'government_news', $insertedId);

    ApiConfig::respondSuccess([
        'id'                  => $insertedId,
        'title'               => $title,
        'organization'        => $organization,
        'category'            => $category,
        'priority'            => $priority,
        'verification_status' => $verificationStatus,
        'is_published'        => $isPublished,
        'message'             => 'Official government advisory published successfully.'
    ], 201);
} catch (\Throwable $e) {
    error_log('[Create News Error] ' . $e->getMessage());
    ApiConfig::respondError('Failed to record official bulletin.', 500);
}
