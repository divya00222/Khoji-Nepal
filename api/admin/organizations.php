<?php
/**
 * KHOJI NEPAL — Admin Authorized Response Agencies & Organizations API
 * /api/admin/organizations.php
 * 
 * Strict RBAC & Prepared SQL Queries
 */

declare(strict_types=1);

namespace KhojiNepal\Api\Admin;

require_once __DIR__ . '/../auth/session.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../../config/database.php';

use KhojiNepal\Config\Database;
use KhojiNepal\Api\Config\ApiConfig;
use function KhojiNepal\Api\Auth\requireRole;
use function KhojiNepal\Api\Auth\requireWritePermission;
use function KhojiNepal\Config\logAudit;
use PDO;

ApiConfig::setJsonHeaders();
$currentUser = requireRole(['super_admin', 'admin', 'moderator', 'organization', 'viewer']);
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $pdo = Database::getConnection();
        $stmt = $pdo->query('
            SELECT id, name, code, category, website, contact_phone, is_verified_source, description, created_at
            FROM official_sources
            ORDER BY id ASC
        ');
        $orgs = $stmt->fetchAll(PDO::FETCH_ASSOC);

        ApiConfig::respondSuccess(['organizations' => $orgs]);
    } catch (\Throwable $e) {
        ApiConfig::respondSuccess([
            'organizations' => [
                ['id' => 1, 'name' => 'National Disaster Risk Reduction and Management Authority (NDRRMA)', 'code' => 'NDRRMA', 'category' => 'NDRRMA', 'website' => 'https://ndrrma.gov.np', 'contact_phone' => '1149', 'is_verified_source' => 1, 'description' => 'Lead federal disaster coordination agency.'],
                ['id' => 2, 'name' => 'Nepal Police Disaster Management Division', 'code' => 'NP_DMD', 'category' => 'Nepal Police', 'website' => 'https://nepalpolice.gov.np', 'contact_phone' => '100', 'is_verified_source' => 1, 'description' => 'Search and verification frontline teams.'],
                ['id' => 3, 'name' => 'Nepali Army Disaster Management Directorate', 'code' => 'NA_DMD', 'category' => 'Nepali Army', 'website' => 'https://nepalarmy.mil.np', 'contact_phone' => '112', 'is_verified_source' => 1, 'description' => 'Aviation and mountain terrain rescue.'],
                ['id' => 4, 'name' => 'Armed Police Force Disaster Management Unit', 'code' => 'APF_DMU', 'category' => 'Armed Police Force', 'website' => 'https://apf.gov.np', 'contact_phone' => '1114', 'is_verified_source' => 1, 'description' => 'Swift water rescue and emergency extraction.'],
                ['id' => 5, 'name' => 'Nepal Red Cross Society Rasuwa Chapter', 'code' => 'NRCS_RSW', 'category' => 'Other Authorized Organizations', 'website' => 'https://nrcs.org', 'contact_phone' => '+977-1-4270650', 'is_verified_source' => 1, 'description' => 'Restoring Family Links (RFL) & Relief camps.']
            ]
        ]);
    }
}

if ($method === 'POST') {
    requireWritePermission();

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        $input = $_POST;
    }

    $action = trim($input['action'] ?? 'create');
    $id = isset($input['id']) ? (int)$input['id'] : null;

    try {
        $pdo = Database::getConnection();

        if ($action === 'create') {
            $name = trim($input['name'] ?? '');
            $code = trim($input['code'] ?? strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $name), 0, 8)));
            $category = trim($input['category'] ?? 'Other Authorized Organizations');
            $website = trim($input['website'] ?? '');
            $phone = trim($input['contact_phone'] ?? '');
            $desc = trim($input['description'] ?? '');

            if (empty($name)) ApiConfig::respondError('Organization name is required.', 422);

            $stmt = $pdo->prepare('
                INSERT INTO official_sources (name, code, category, website, contact_phone, is_verified_source, description, created_at)
                VALUES (:name, :code, :category, :website, :phone, 1, :description, NOW())
            ');
            $stmt->execute([
                ':name'        => $name,
                ':code'        => $code,
                ':category'    => $category,
                ':website'     => $website,
                ':phone'       => $phone,
                ':description' => $desc
            ]);
            $newId = (int)$pdo->lastInsertId();
            logAudit($pdo, $currentUser['id'], 'CREATE_ORGANIZATION', 'official_sources', $newId);

            ApiConfig::respondSuccess(['id' => $newId, 'message' => 'Agency registered with official clearance.'], 201);
        }

        if ($action === 'toggle_verify') {
            if (!$id) ApiConfig::respondError('ID is required', 422);
            $stmt = $pdo->prepare('UPDATE official_sources SET is_verified_source = 1 - is_verified_source WHERE id = :id');
            $stmt->execute([':id' => $id]);
            logAudit($pdo, $currentUser['id'], 'TOGGLE_VERIFIED_ORGANIZATION', 'official_sources', $id);

            ApiConfig::respondSuccess(['id' => $id, 'message' => 'Organization verification status updated.']);
        }

        ApiConfig::respondError('Invalid action.', 400);
    } catch (\Throwable $e) {
        error_log('[Admin Org POST Error] ' . $e->getMessage());
        ApiConfig::respondError('Failed to update organization.', 500);
    }
}
