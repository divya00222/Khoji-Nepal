<?php
/**
 * KHOJI NEPAL — Official Sources System API
 * GET /api/news/sources.php
 * 
 * Returns accredited official source entities for filter dropdowns, verification badges,
 * and source transparency verification.
 */

declare(strict_types=1);

namespace KhojiNepal\Api\News;

require_once __DIR__ . '/../auth/session.php';
require_once __DIR__ . '/../../config/database.php';

use KhojiNepal\Config\Database;
use KhojiNepal\Api\Config\ApiConfig;
use PDO;

ApiConfig::setJsonHeaders();

try {
    $pdo = Database::getConnection();

    $sql = '
        SELECT 
            id, name, code, category, website, contact_phone, is_verified_source, description
        FROM official_sources
        ORDER BY id ASC
    ';

    $stmt = $pdo->query($sql);
    $sources = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Fallback array if table not yet migrated in dev memory
    if (empty($sources)) {
        $sources = [
            ['id' => 1, 'name' => 'Government of Nepal (MOHA / NEOC)', 'code' => 'GON-MOHA', 'category' => 'Government of Nepal', 'website' => 'https://moha.gov.np', 'contact_phone' => '+977-1-4200000', 'is_verified_source' => 1],
            ['id' => 2, 'name' => 'NDRRMA Disaster Management Portal', 'code' => 'NDRRMA', 'category' => 'NDRRMA', 'website' => 'https://bipadportal.gov.np', 'contact_phone' => '1149', 'is_verified_source' => 1],
            ['id' => 3, 'name' => 'Nepal Police Headquarters & Rasuwa DPO', 'code' => 'NEPAL-POLICE', 'category' => 'Nepal Police', 'website' => 'https://nepalpolice.gov.np', 'contact_phone' => '100', 'is_verified_source' => 1],
            ['id' => 4, 'name' => 'Nepali Army Directorate of Disaster Management', 'code' => 'NEPALI-ARMY', 'category' => 'Nepali Army', 'website' => 'https://nepalarmy.mil.np', 'contact_phone' => '+977-10-540101', 'is_verified_source' => 1],
            ['id' => 5, 'name' => 'Armed Police Force Disaster Management Division', 'code' => 'APF-NEPAL', 'category' => 'Armed Police Force', 'website' => 'https://apf.gov.np', 'contact_phone' => '1114', 'is_verified_source' => 1],
            ['id' => 6, 'name' => 'District Administration Office (DAO) Rasuwa', 'code' => 'DAO-RASUWA', 'category' => 'District Administration', 'website' => 'https://daorasuwa.gov.np', 'contact_phone' => '+977-10-540199', 'is_verified_source' => 1],
            ['id' => 7, 'name' => 'Gosaikunda Rural Municipality Disaster Cell', 'code' => 'GOSAIKUNDA-MUN', 'category' => 'Local Municipality', 'website' => 'https://gosaikundamun.gov.np', 'contact_phone' => '+977-10-540144', 'is_verified_source' => 1],
            ['id' => 8, 'name' => 'Nepal Red Cross Society (NRCS) RFL Bureau', 'code' => 'NRCS-RFL', 'category' => 'Other Authorized Organizations', 'website' => 'https://nrcs.org', 'contact_phone' => '112', 'is_verified_source' => 1]
        ];
    }

    ApiConfig::respondSuccess([
        'sources' => $sources,
        'count'   => count($sources)
    ]);
} catch (\Throwable $e) {
    error_log('[Sources List Error] ' . $e->getMessage());
    ApiConfig::respondError('Failed to fetch official sources list.', 500);
}
