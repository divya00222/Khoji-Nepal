<?php
/**
 * KHOJI NEPAL — Emergency Alerts API (Banner & Ticker)
 * GET /api/news/alerts.php
 * 
 * Returns high-priority urgent advisories (Critical, Warning, Important)
 * for the emergency banner across the public portal.
 */

declare(strict_types=1);

namespace KhojiNepal\Api\News;

require_once __DIR__ . '/../auth/session.php';
require_once __DIR__ . '/../../config/database.php';

use KhojiNepal\Config\Database;
use KhojiNepal\Api\Config\ApiConfig;
use PDO;

ApiConfig::setJsonHeaders();
ApiConfig::enforceRateLimit('news_alerts', 300, 60);

try {
    $pdo = Database::getConnection();

    $sql = '
        SELECT 
            gn.id,
            gn.title,
            gn.summary,
            gn.organization,
            gn.category,
            gn.priority,
            gn.source_url,
            gn.published_at,
            gn.updated_at,
            gn.verification_status,
            gn.is_important
        FROM government_news gn
        WHERE gn.is_published = 1 
          AND gn.is_archived = 0 
          AND (gn.priority IN ("critical", "warning") OR gn.is_important = 1)
        ORDER BY FIELD(gn.priority, "critical", "warning", "info"), gn.published_at DESC
        LIMIT 10
    ';

    $stmt = $pdo->query($sql);
    $alerts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    ApiConfig::respondSuccess([
        'alerts' => $alerts,
        'count'  => count($alerts),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
} catch (\Throwable $e) {
    error_log('[News Alerts Error] ' . $e->getMessage());
    ApiConfig::respondError('Failed to fetch emergency alerts.', 500);
}
