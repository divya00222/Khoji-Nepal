<?php
/**
 * KHOJI NEPAL — Auth Logout API
 * POST /api/auth/logout.php
 */

declare(strict_types=1);

namespace KhojiNepal\Api\Auth;

require_once __DIR__ . '/session.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../../config/database.php';

use KhojiNepal\Config\Database;
use KhojiNepal\Api\Config\ApiConfig;
use function KhojiNepal\Config\logAudit;

ApiConfig::setJsonHeaders();

$userId = $_SESSION['user_id'] ?? null;

if ($userId) {
    try {
        $pdo = Database::getConnection();
        logAudit($pdo, (int)$userId, 'AUTH_LOGOUT', 'users', (int)$userId);
    } catch (\Throwable) {
        // Non-blocking
    }
}

// Clear all session variables
$_SESSION = [];

// Invalidate session cookie
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params['path'],
        $params['domain'],
        $params['secure'],
        $params['httponly']
    );
}

// Destroy session
session_destroy();

ApiConfig::respondSuccess([
    'message' => 'Logged out successfully from official console.'
]);
