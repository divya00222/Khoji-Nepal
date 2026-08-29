<?php
/**
 * KHOJI NEPAL — Locations GIS List API
 * GET /api/locations/list.php
 */

declare(strict_types=1);

namespace KhojiNepal\Api\Locations;

require_once __DIR__ . '/../auth/session.php';
require_once __DIR__ . '/../../config/database.php';

use KhojiNepal\Config\Database;
use KhojiNepal\Api\Config\ApiConfig;
use PDO;

ApiConfig::setJsonHeaders();

try {
    $pdo = Database::getConnection();

    $type = trim($_GET['type'] ?? 'all');
    $where = ['1=1'];
    $params = [];

    if ($type !== '' && strtolower($type) !== 'all') {
        $where[] = 'LOWER(type) = :type';
        $params[':type'] = strtolower($type);
    }

    $sql = '
        SELECT 
            id, name, type, district, municipality, ward,
            latitude, longitude, address, status
        FROM locations
        WHERE ' . implode(' AND ', $where) . '
        ORDER BY id ASC
    ';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $locations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    ApiConfig::respondSuccess([
        'locations' => $locations,
        'count'     => count($locations)
    ]);
} catch (\Throwable $e) {
    error_log('[Locations List Error] ' . $e->getMessage());
    ApiConfig::respondError('Failed to fetch GIS locations.', 500);
}
