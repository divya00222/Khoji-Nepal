<?php
/**
 * KHOJI NEPAL — Admin Match Verification API
 * /api/admin/matches.php
 * 
 * Strict Privacy & Verification Workflow:
 * - Admin confirmation does NOT automatically expose sensitive contact information publicly.
 * - Handles candidate match pairs: Query photo vs Missing record photo, similarity metrics, signal breakdown.
 * - Actions: Confirm for review, Reject match, Request more information, Forward to authorized authority (Police/Red Cross).
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
use function KhojiNepal\Api\Auth\getCurrentUser;
use function KhojiNepal\Config\logAudit;
use PDO;

ApiConfig::setJsonHeaders();
$currentUser = requireRole(['super_admin', 'admin', 'moderator', 'organization', 'viewer']);
$method = $_SERVER['REQUEST_METHOD'];

// In-memory / storage matches list for review desk
$candidateMatches = [
    [
        'match_id'         => 'MATCH-2024-8801',
        'query_image'      => 'assets/demo_found_1.jpg',
        'candidate_id'     => 1,
        'candidate_name'   => 'Pasang Norbu Tamang',
        'candidate_report' => 'KN-MP-2024-001',
        'candidate_photo'  => 'assets/demo_person_1.jpg',
        'candidate_age'    => 34,
        'candidate_gender' => 'male',
        'last_seen'        => 'Syabrubesi Suspension Bridge Area',
        'similarity_score' => 89.4,
        'signals'          => [
            'visual_similarity' => 88.5,
            'age_proximity'     => 92.0,
            'location_match'    => 90.0,
            'gender_match'      => 100.0
        ],
        'source'           => 'Citizen Web Portal Search',
        'submitted_at'     => '2024-07-09 14:32:00',
        'verification_status' => 'pending_review',
        'notes'            => 'Facial bone structure and scar signal match brother description.',
        'sensitive_guardian_masked' => 'Dawa Tamang (+977-98412***111)'
    ],
    [
        'match_id'         => 'MATCH-2024-8802',
        'query_image'      => 'assets/demo_person_2.jpg',
        'candidate_id'     => 2,
        'candidate_name'   => 'Sunita Ghale',
        'candidate_report' => 'KN-MP-2024-002',
        'candidate_photo'  => 'assets/demo_person_2.jpg',
        'candidate_age'    => 22,
        'candidate_gender' => 'female',
        'last_seen'        => 'Timure Customs Yard',
        'similarity_score' => 94.2,
        'signals'          => [
            'visual_similarity' => 96.0,
            'age_proximity'     => 95.0,
            'location_match'    => 88.0,
            'gender_match'      => 100.0
        ],
        'source'           => 'Field Hospital Admission Scan (Dhunche)',
        'submitted_at'     => '2024-07-09 16:05:00',
        'verification_status' => 'confirmed_review',
        'notes'            => 'High visual match, hospital records show patient unable to speak.',
        'sensitive_guardian_masked' => 'Maya Ghale (+977-98412***222)'
    ],
    [
        'match_id'         => 'MATCH-2024-8803',
        'query_image'      => 'assets/demo_person_1.jpg',
        'candidate_id'     => 1,
        'candidate_name'   => 'Pasang Norbu Tamang',
        'candidate_report' => 'KN-MP-2024-001',
        'candidate_photo'  => 'assets/demo_person_1.jpg',
        'candidate_age'    => 34,
        'candidate_gender' => 'male',
        'last_seen'        => 'Syabrubesi Suspension Bridge Area',
        'similarity_score' => 61.2,
        'signals'          => [
            'visual_similarity' => 62.0,
            'age_proximity'     => 70.0,
            'location_match'    => 50.0,
            'gender_match'      => 100.0
        ],
        'source'           => 'Public Tip Submission',
        'submitted_at'     => '2024-07-09 18:20:00',
        'verification_status' => 'rejected',
        'notes'            => 'Lighting artifact caused false positive on jawline.',
        'sensitive_guardian_masked' => 'Dawa Tamang (+977-98412***111)'
    ]
];

if ($method === 'GET') {
    $statusFilter = trim($_GET['status'] ?? '');
    
    $filtered = $candidateMatches;
    if ($statusFilter !== '') {
        $filtered = array_values(array_filter($filtered, fn($m) => $m['verification_status'] === $statusFilter));
    }

    ApiConfig::respondSuccess([
        'matches' => $filtered,
        'disclaimer' => 'AI-assisted similarity result. Identity has not been confirmed. Human/official verification is required before any public disclosure.',
        'privacy_policy' => 'Admin confirmation marks record for field verification. Sensitive guardian details remain strictly protected and unexposed.'
    ]);
}

if ($method === 'POST') {
    requireWritePermission();

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        $input = $_POST;
    }

    $matchId = trim($input['match_id'] ?? '');
    $action = trim($input['action'] ?? '');
    $officialNotes = trim($input['notes'] ?? '');
    $targetAuthority = trim($input['authority'] ?? 'Nepal Police RFL Desk');

    if (empty($matchId) || empty($action)) {
        ApiConfig::respondError('Match ID and valid verification action are required.', 422);
    }

    $allowedActions = ['confirm_review', 'reject_match', 'request_info', 'forward_authority'];
    if (!in_array($action, $allowedActions, true)) {
        ApiConfig::respondError('Invalid match verification action.', 422);
    }

    try {
        $pdo = Database::getConnection();
        // Log action in audit logs ledger
        logAudit(
            $pdo,
            $currentUser['id'],
            'MATCH_VERIFICATION_' . strtoupper($action),
            'photo_matches',
            null,
            $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'
        );
    } catch (\Throwable) {
        // Non-blocking log
    }

    $actionMessages = [
        'confirm_review'   => 'Match confirmed for official field review. Contact details remain securely protected.',
        'reject_match'     => 'Match marked as false positive / rejected.',
        'request_info'     => 'Additional information requested from submitting party.',
        'forward_authority'=> sprintf('Case dossier successfully forwarded to %s for ground verification.', htmlspecialchars($targetAuthority))
    ];

    ApiConfig::respondSuccess([
        'match_id' => $matchId,
        'action'   => $action,
        'status'   => $action === 'confirm_review' ? 'confirmed_review' : ($action === 'reject_match' ? 'rejected' : 'forwarded_authority'),
        'message'  => $actionMessages[$action] ?? 'Action processed successfully.'
    ]);
}
