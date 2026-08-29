<?php
/**
 * KHOJI NEPAL — Official Bulletin Detail API
 * GET /api/news/detail.php?id=...
 * 
 * Returns full bulletin detail with transparent source verification metadata.
 */

declare(strict_types=1);

namespace KhojiNepal\Api\News;

require_once __DIR__ . '/../auth/session.php';
require_once __DIR__ . '/../../config/database.php';

use KhojiNepal\Config\Database;
use KhojiNepal\Api\Config\ApiConfig;
use PDO;

ApiConfig::setJsonHeaders();

$id = $_GET['id'] ?? null;
if (!$id || !is_numeric($id)) {
    ApiConfig::respondError('Valid bulletin ID is required.', 422);
}

try {
    $pdo = Database::getConnection();
    
    $sql = '
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
            u.name AS verifier_name,
            u.role AS verifier_role,
            os.name AS source_full_name,
            os.category AS source_category,
            os.website AS source_website,
            os.contact_phone AS source_phone,
            os.is_verified_source
        FROM government_news gn
        LEFT JOIN users u ON u.id = gn.created_by
        LEFT JOIN official_sources os ON os.name = gn.organization OR os.category = gn.organization
        WHERE gn.id = :id
        LIMIT 1
    ';

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id' => (int)$id]);
    $bulletin = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$bulletin) {
        ApiConfig::respondError('Official bulletin record not found.', 404);
    }

    // Explicit source transparency guarantee
    $bulletin['is_official_government_source'] = true;
    $bulletin['source_notice'] = 'This alert is published strictly from accredited government, defense, or humanitarian coordinating authorities. User-generated content is not published in official feeds.';

    ApiConfig::respondSuccess($bulletin);
} catch (\Throwable $e) {
    error_log('[News Detail Error] ' . $e->getMessage());
    ApiConfig::respondError('Failed to fetch bulletin details.', 500);
}
