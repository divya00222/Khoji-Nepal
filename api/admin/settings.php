<?php
/**
 * KHOJI NEPAL — Admin Emergency Settings & System Parameters API
 * /api/admin/settings.php
 * 
 * Strict RBAC: Super Admin and Admin only
 */

declare(strict_types=1);

namespace KhojiNepal\Api\Admin;

require_once __DIR__ . '/../auth/session.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../../config/database.php';

use KhojiNepal\Config\Database;
use KhojiNepal\Api\Config\ApiConfig;
use function KhojiNepal\Api\Auth\requireRole;
use function KhojiNepal\Config\logAudit;
use PDO;

ApiConfig::setJsonHeaders();
$currentUser = requireRole(['super_admin', 'admin']);
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $pdo = Database::getConnection();
        $stmt = $pdo->query('
            SELECT id, organization, service, phone, description, source, is_active
            FROM emergency_contacts
            ORDER BY id ASC
        ');
        $contacts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        ApiConfig::respondSuccess([
            'emergency_contacts' => $contacts,
            'system_config' => [
                'incident_name'          => 'Rasuwa Flash Flood & Landslide Response 2024',
                'lead_agency'            => 'National Disaster Risk Reduction and Management Authority (NDRRMA)',
                'operations_status'      => 'RED_ALERT_ACTIVE',
                'sms_broadcast_enabled'  => true,
                'ai_photo_verification'  => 'HUMAN_CONFIRMATION_MANDATORY',
                'sensitive_data_redaction'=> 'ENFORCED_PUBLIC_MASK',
                'backup_interval_hours'  => 6
            ]
        ]);
    } catch (\Throwable $e) {
        ApiConfig::respondSuccess([
            'emergency_contacts' => [
                ['id' => 1, 'organization' => 'National Emergency Operations Centre (NEOC)', 'service' => 'Disaster Command Desk', 'phone' => '1149', 'description' => 'Toll-free 24/7 national operations center', 'is_active' => 1],
                ['id' => 2, 'organization' => 'Nepal Police Emergency Control', 'service' => 'Police Dispatch', 'phone' => '100', 'description' => 'Immediate search & security response', 'is_active' => 1],
                ['id' => 3, 'organization' => 'Armed Police Force Disaster Wing', 'service' => 'Swift Water & Extraction', 'phone' => '1114', 'description' => 'Riverine rescue operations', 'is_active' => 1],
                ['id' => 4, 'organization' => 'Nepali Army Air Wing Directorate', 'service' => 'Air Ambulance & Extraction', 'phone' => '112', 'description' => 'Helicopter evacuation coordinator', 'is_active' => 1],
                ['id' => 5, 'organization' => 'Nepal Red Cross Society', 'service' => 'Restoring Family Links (RFL)', 'phone' => '1130', 'description' => 'Missing person tracing hotline', 'is_active' => 1]
            ],
            'system_config' => [
                'incident_name'          => 'Rasuwa Flash Flood & Landslide Response 2024',
                'lead_agency'            => 'National Disaster Risk Reduction and Management Authority (NDRRMA)',
                'operations_status'      => 'RED_ALERT_ACTIVE',
                'sms_broadcast_enabled'  => true,
                'ai_photo_verification'  => 'HUMAN_CONFIRMATION_MANDATORY',
                'sensitive_data_redaction'=> 'ENFORCED_PUBLIC_MASK',
                'backup_interval_hours'  => 6
            ]
        ]);
    }
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        $input = $_POST;
    }

    $action = trim($input['action'] ?? 'update_contact');

    try {
        $pdo = Database::getConnection();

        if ($action === 'add_contact') {
            $org = trim($input['organization'] ?? '');
            $service = trim($input['service'] ?? '');
            $phone = trim($input['phone'] ?? '');
            $desc = trim($input['description'] ?? '');

            if (empty($org) || empty($phone)) {
                ApiConfig::respondError('Organization and Phone hotline are required.', 422);
            }

            $stmt = $pdo->prepare('
                INSERT INTO emergency_contacts (organization, service, phone, description, is_active, created_at)
                VALUES (:org, :service, :phone, :desc, 1, NOW())
            ');
            $stmt->execute([
                ':org'     => $org,
                ':service' => $service,
                ':phone'   => $phone,
                ':desc'    => $desc
            ]);
            $newId = (int)$pdo->lastInsertId();
            logAudit($pdo, $currentUser['id'], 'ADD_EMERGENCY_CONTACT', 'emergency_contacts', $newId);

            ApiConfig::respondSuccess(['id' => $newId, 'message' => 'Emergency contact added.']);
        }

        if ($action === 'toggle_contact') {
            $id = isset($input['id']) ? (int)$input['id'] : null;
            if (!$id) ApiConfig::respondError('ID required', 422);

            $stmt = $pdo->prepare('UPDATE emergency_contacts SET is_active = 1 - is_active WHERE id = :id');
            $stmt->execute([':id' => $id]);
            logAudit($pdo, $currentUser['id'], 'TOGGLE_EMERGENCY_CONTACT', 'emergency_contacts', $id);

            ApiConfig::respondSuccess(['id' => $id, 'message' => 'Contact status updated.']);
        }

        ApiConfig::respondError('Invalid settings action.', 400);
    } catch (\Throwable $e) {
        error_log('[Admin Settings POST Error] ' . $e->getMessage());
        ApiConfig::respondError('Settings update failed.', 500);
    }
}
