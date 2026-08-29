<?php
/**
 * KHOJI NEPAL — Official Government Bulletins & News List API
 * GET /api/news/list.php
 * 
 * Supports:
 * - Query search across title, summary, content
 * - Organization filtering (Government of Nepal, NDRRMA, Nepal Police, Nepali Army, Armed Police Force, DAO Rasuwa, Local Municipality, NRCS)
 * - Category filtering (ROAD UPDATE, RESCUE UPDATE, RELIEF UPDATE, WEATHER UPDATE, SAFETY NOTICE)
 * - Priority filtering (critical, warning, info)
 * - Important alerts flag (is_important=1)
 * - Date filtering (date, date_from, date_to)
 * - Server-side pagination
 */

declare(strict_types=1);

namespace KhojiNepal\Api\News;

require_once __DIR__ . '/../auth/session.php';
require_once __DIR__ . '/../../config/database.php';

use KhojiNepal\Config\Database;
use KhojiNepal\Api\Config\ApiConfig;
use function KhojiNepal\Api\Auth\isPrivilegedUser;
use PDO;

ApiConfig::setJsonHeaders();
ApiConfig::enforceRateLimit('news_list', 180, 60);

try {
    $pdo = Database::getConnection();
    $isPrivileged = isPrivilegedUser();

    $search = trim($_GET['q'] ?? $_GET['search'] ?? '');
    $organization = trim($_GET['organization'] ?? $_GET['org'] ?? 'all');
    $category = trim($_GET['category'] ?? 'all');
    $priority = trim($_GET['priority'] ?? 'all');
    $importantOnly = isset($_GET['important']) && ($_GET['important'] === '1' || $_GET['important'] === 'true');
    $date = trim($_GET['date'] ?? '');
    $dateFrom = trim($_GET['date_from'] ?? '');
    $dateTo = trim($_GET['date_to'] ?? '');
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = min(100, max(1, (int)($_GET['limit'] ?? 12)));
    $offset = ($page - 1) * $limit;

    $where = [];
    $params = [];

    // Public only sees published & unarchived news
    if (!$isPrivileged || !isset($_GET['all_status'])) {
        $where[] = 'gn.is_published = 1';
        $where[] = 'gn.is_archived = 0';
    }

    if ($search !== '') {
        $where[] = '(gn.title LIKE :q OR gn.summary LIKE :q OR gn.content LIKE :q OR gn.organization LIKE :q)';
        $params[':q'] = '%' . $search . '%';
    }

    if ($organization !== '' && strtolower($organization) !== 'all') {
        $where[] = '(LOWER(gn.organization) LIKE :org OR LOWER(os.category) LIKE :org)';
        $params[':org'] = '%' . strtolower($organization) . '%';
    }

    if ($category !== '' && strtolower($category) !== 'all') {
        $where[] = 'LOWER(gn.category) = :cat';
        $params[':cat'] = strtolower($category);
    }

    if ($priority !== '' && strtolower($priority) !== 'all') {
        $where[] = 'LOWER(gn.priority) = :priority';
        $params[':priority'] = strtolower($priority);
    }

    if ($importantOnly) {
        $where[] = 'gn.is_important = 1';
    }

    if ($date !== '') {
        $where[] = 'DATE(gn.published_at) = :exact_date';
        $params[':exact_date'] = $date;
    }

    if ($dateFrom !== '') {
        $where[] = 'DATE(gn.published_at) >= :date_from';
        $params[':date_from'] = $dateFrom;
    }

    if ($dateTo !== '') {
        $where[] = 'DATE(gn.published_at) <= :date_to';
        $params[':date_to'] = $dateTo;
    }

    $whereSql = !empty($where) ? ('WHERE ' . implode(' AND ', $where)) : '';

    $countSql = "
        SELECT COUNT(*) 
        FROM government_news gn
        LEFT JOIN official_sources os ON os.name = gn.organization OR os.category = gn.organization
        {$whereSql}
    ";
    $countStmt = $pdo->prepare($countSql);
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    $dataSql = "
        SELECT 
            gn.id,
            gn.title,
            gn.summary,
            gn.content,
            gn.organization,
            gn.category,
            gn.priority,
            gn.source_url,
            gn.image,
            gn.published_at,
            gn.updated_at,
            gn.verification_status,
            gn.is_important,
            gn.is_published,
            gn.is_archived,
            gn.created_by,
            u.name AS author_name,
            os.website AS source_website,
            os.contact_phone AS source_phone
        FROM government_news gn
        LEFT JOIN users u ON u.id = gn.created_by
        LEFT JOIN official_sources os ON os.name = gn.organization OR os.category = gn.organization
        {$whereSql}
        ORDER BY gn.is_important DESC, gn.published_at DESC
        LIMIT :limit OFFSET :offset
    ";

    $dataStmt = $pdo->prepare($dataSql);
    foreach ($params as $k => $v) {
        $dataStmt->bindValue($k, $v);
    }
    $dataStmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $dataStmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $dataStmt->execute();

    $records = $dataStmt->fetchAll(PDO::FETCH_ASSOC);

    ApiConfig::respondSuccess([
        'bulletins'  => $records,
        'pagination' => [
            'total'       => $total,
            'page'        => $page,
            'limit'       => $limit,
            'total_pages' => (int)ceil($total / max(1, $limit))
        ]
    ]);
} catch (\Throwable $e) {
    error_log('[News List Error] ' . $e->getMessage());
    ApiConfig::respondError('Failed to fetch emergency bulletins.', 500);
}
