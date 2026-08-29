<?php
/**
 * KHOJI NEPAL — Missing Persons Search API
 * GET /api/missing/search.php
 * 
 * Supports: Partial matching, case-insensitivity, Nepali/English text,
 * pagination, multi-attribute filtering, and privacy redaction.
 */

declare(strict_types=1);

namespace KhojiNepal\Api\Missing;

require_once __DIR__ . '/../auth/session.php';
require_once __DIR__ . '/../../config/database.php';

use KhojiNepal\Config\Database;
use KhojiNepal\Api\Config\ApiConfig;
use function KhojiNepal\Api\Auth\isPrivilegedUser;
use function KhojiNepal\Config\sanitizeMissingPersonPublic;
use PDO;

ApiConfig::setJsonHeaders();
ApiConfig::enforceRateLimit('missing_search', 120, 60);

try {
    $pdo = Database::getConnection();
    $isPrivileged = isPrivilegedUser();

    // Query parameters
    $name = trim($_GET['name'] ?? ($_GET['q'] ?? ''));
    $age = isset($_GET['age']) && is_numeric($_GET['age']) ? (int)$_GET['age'] : null;
    $gender = trim($_GET['gender'] ?? 'all');
    $district = trim($_GET['district'] ?? 'all');
    $municipality = trim($_GET['municipality'] ?? 'all');
    $status = trim($_GET['status'] ?? 'all');
    $verification = trim($_GET['verification_status'] ?? 'all');

    // Pagination
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = min(50, max(1, (int)($_GET['limit'] ?? 12)));
    $offset = ($page - 1) * $limit;

    // Build SQL Where Clauses
    $where = ['1=1'];
    $params = [];

    if ($name !== '') {
        $where[] = '(mp.full_name LIKE :name OR mp.description LIKE :name_desc OR mp.last_seen_location LIKE :name_loc)';
        $params[':name'] = '%' . $name . '%';
        $params[':name_desc'] = '%' . $name . '%';
        $params[':name_loc'] = '%' . $name . '%';
    }

    if ($age !== null) {
        $where[] = 'mp.age BETWEEN :age_min AND :age_max';
        $params[':age_min'] = max(0, $age - 3);
        $params[':age_max'] = $age + 3;
    }

    if ($gender !== '' && strtolower($gender) !== 'all') {
        $where[] = 'LOWER(mp.gender) = :gender';
        $params[':gender'] = strtolower($gender);
    }

    if ($district !== '' && strtolower($district) !== 'all') {
        $where[] = 'LOWER(mp.district) = :district';
        $params[':district'] = strtolower($district);
    }

    if ($municipality !== '' && strtolower($municipality) !== 'all') {
        $where[] = 'LOWER(mp.municipality) LIKE :municipality';
        $params[':municipality'] = '%' . strtolower($municipality) . '%';
    }

    if ($status !== '' && strtolower($status) !== 'all') {
        $where[] = 'LOWER(mp.status) = :status';
        $params[':status'] = strtolower($status);
    }

    if ($verification !== '' && strtolower($verification) !== 'all') {
        $where[] = 'LOWER(mp.verification_status) = :verification';
        $params[':verification'] = strtolower($verification);
    }

    $whereSql = implode(' AND ', $where);

    // Total Count for Pagination
    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM missing_persons mp WHERE {$whereSql}");
    $countStmt->execute($params);
    $totalRecords = (int)$countStmt->fetchColumn();

    // Data Select Query
    $dataSql = "
        SELECT 
            mp.id,
            mp.report_id,
            mp.full_name,
            mp.age,
            mp.gender,
            mp.photo,
            mp.missing_date,
            mp.missing_time,
            mp.last_seen_location,
            mp.district,
            mp.municipality,
            mp.ward,
            mp.description,
            mp.clothing_description,
            mp.identifying_marks,
            mp.guardian_name,
            mp.guardian_phone,
            mp.status,
            mp.source_type,
            mp.source_name,
            mp.source_reference,
            mp.verification_status,
            mp.created_at,
            mp.updated_at
        FROM missing_persons mp
        WHERE {$whereSql}
        ORDER BY mp.created_at DESC
        LIMIT :limit OFFSET :offset
    ";

    $dataStmt = $pdo->prepare($dataSql);
    foreach ($params as $k => $v) {
        $dataStmt->bindValue($k, $v);
    }
    $dataStmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $dataStmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $dataStmt->execute();

    $rows = $dataStmt->fetchAll(PDO::FETCH_ASSOC);

    // Sanitize records (Guardian privacy protection)
    $sanitized = array_map(function ($row) use ($isPrivileged) {
        return sanitizeMissingPersonPublic($row, $isPrivileged);
    }, $rows);

    ApiConfig::respondSuccess([
        'records'     => $sanitized,
        'pagination'  => [
            'total'        => $totalRecords,
            'page'         => $page,
            'limit'        => $limit,
            'total_pages'  => (int)ceil($totalRecords / $limit)
        ],
        'filters'     => [
            'name'         => $name,
            'gender'       => $gender,
            'district'     => $district,
            'status'       => $status
        ]
    ]);
} catch (\Throwable $e) {
    error_log('[Missing Search Error] ' . $e->getMessage());
    ApiConfig::respondError('Failed to search missing persons records.', 500);
}
