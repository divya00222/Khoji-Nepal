<?php
/**
 * KHOJI NEPAL — Auth Session Verification, RBAC & CSRF
 * /api/auth/session.php
 * 
 * Strict Server-Side Role Enforcement:
 * - Super Admin (super_admin): Full system configuration, user creation, audits, security
 * - Admin (admin): Command center operations, records management, verification, dispatches
 * - Moderator (moderator): Verification desk for missing/found, match reviews, reports
 * - Organization (organization): Red Cross, Army, APF, Hospitals (rescue logs, relief centers)
 * - Viewer (viewer): Read-only situational awareness, no write permissions
 */

declare(strict_types=1);

namespace KhojiNepal\Api\Auth;

require_once __DIR__ . '/../config/database.php';

use KhojiNepal\Api\Config\ApiConfig;

if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 86400,
        'path'     => '/',
        'secure'   => isset($_SERVER['HTTPS']),
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    session_start();
}

/**
 * Generate CSRF token if not set
 */
function getCsrfToken(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * Validate CSRF token from header or post body
 */
function validateCsrfToken(?string $token): bool
{
    if (empty($token) || empty($_SESSION['csrf_token'])) {
        return false;
    }
    return hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Get current authenticated user
 */
function getCurrentUser(): ?array
{
    if (empty($_SESSION['user_id'])) {
        return null;
    }
    return [
        'id'    => (int)$_SESSION['user_id'],
        'name'  => $_SESSION['user_name'] ?? 'Authorized Official',
        'email' => $_SESSION['user_email'] ?? '',
        'role'  => $_SESSION['user_role'] ?? 'viewer',
        'org'   => $_SESSION['user_org'] ?? 'NEOC Joint Operations'
    ];
}

/**
 * Check if user possesses one of the authorized roles
 */
function hasRole(string|array $allowedRoles): bool
{
    $user = getCurrentUser();
    if (!$user) {
        return false;
    }

    $roles = is_array($allowedRoles) ? $allowedRoles : [$allowedRoles];
    
    // Super Admin has all permissions
    if ($user['role'] === 'super_admin' || $user['role'] === 'admin') {
        return true;
    }

    return in_array($user['role'], $roles, true);
}

/**
 * Enforce RBAC permission check on server side.
 * Terminates immediately with 403 Forbidden if not authorized.
 */
function requireRole(string|array $allowedRoles): array
{
    $user = getCurrentUser();
    if (!$user) {
        ApiConfig::respondError('Authentication required. Please sign in to the official command console.', 401);
    }

    $roles = is_array($allowedRoles) ? $allowedRoles : [$allowedRoles];

    // Super Admin & Admin bypass check
    if ($user['role'] === 'super_admin' || $user['role'] === 'admin' || in_array($user['role'], $roles, true)) {
        return $user;
    }

    ApiConfig::respondError(
        sprintf('Access forbidden. Your account role (%s) lacks the required clearance for this operation.', strtoupper($user['role'])),
        403
    );
}

/**
 * Enforce write permissions (Viewers are read-only)
 */
function requireWritePermission(): array
{
    $user = getCurrentUser();
    if (!$user) {
        ApiConfig::respondError('Authentication required.', 401);
    }

    if ($user['role'] === 'viewer' || $user['role'] === 'user') {
        ApiConfig::respondError('Write permission denied. Viewer accounts have read-only clearance.', 403);
    }

    return $user;
}

/**
 * Check if user is an authorized verifier/moderator/admin
 */
function isPrivilegedUser(): bool
{
    $user = getCurrentUser();
    if (!$user) return false;
    return in_array($user['role'], ['super_admin', 'admin', 'moderator', 'organization'], true);
}

/**
 * Check if user can manage users/accounts (Super Admin and Admin only)
 */
function canManageUsers(): bool
{
    $user = getCurrentUser();
    if (!$user) return false;
    return in_array($user['role'], ['super_admin', 'admin'], true);
}

// If accessed directly via GET, return session status
if (basename($_SERVER['SCRIPT_FILENAME']) === 'session.php') {
    $user = getCurrentUser();
    ApiConfig::respondSuccess([
        'authenticated' => $user !== null,
        'user'          => $user,
        'is_privileged' => isPrivilegedUser(),
        'can_manage_users' => canManageUsers(),
        'csrf_token'    => getCsrfToken()
    ]);
}
