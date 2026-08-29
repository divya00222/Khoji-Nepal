<?php
/**
 * ==============================================================================
 * KHOJI NEPAL (खोजि नेपाल) — RASUWA FLOOD INFORMATION & RESPONSE PLATFORM
 * DATABASE CONFIGURATION & PDO CONNECTION HANDLER (PHP 8+)
 * ==============================================================================
 * 
 * Secure, production-ready PDO wrapper for MySQL with UTF-8 mb4 encoding,
 * prepared statement enforcement, environment credential resolution,
 * and built-in sensitive data sanitization/masking functions.
 * 
 * Privacy Rule: Sensitive citizen data (guardian phone numbers, private reporter
 * contacts) are strictly redacted before sending to public APIs.
 */

declare(strict_types=1);

namespace KhojiNepal\Config;

use PDO;
use PDOException;
use Exception;

class Database
{
    private static ?PDO $instance = null;
    private static array $config = [];

    /**
     * Load environment or default configuration
     */
    private static function initConfig(): void
    {
        if (!empty(self::$config)) {
            return;
        }

        // Support standard environment variables with production defaults
        self::$config = [
            'host'     => getenv('DB_HOST') ?: ($_ENV['DB_HOST'] ?? '127.0.0.1'),
            'port'     => (int)(getenv('DB_PORT') ?: ($_ENV['DB_PORT'] ?? 3306)),
            'database' => getenv('DB_DATABASE') ?: ($_ENV['DB_DATABASE'] ?? 'khoji_nepal'),
            'username' => getenv('DB_USERNAME') ?: ($_ENV['DB_USERNAME'] ?? 'khoji_user'),
            'password' => getenv('DB_PASSWORD') ?: ($_ENV['DB_PASSWORD'] ?? ''),
            'charset'  => getenv('DB_CHARSET') ?: ($_ENV['DB_CHARSET'] ?? 'utf8mb4'),
            'options'  => [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
            ]
        ];
    }

    /**
     * Get the PDO Database Instance (Singleton Pattern)
     * 
     * @return PDO
     * @throws Exception If database connection fails
     */
    public static function getConnection(): PDO
    {
        if (self::$instance !== null) {
            return self::$instance;
        }

        self::initConfig();

        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=%s',
            self::$config['host'],
            self::$config['port'],
            self::$config['database'],
            self::$config['charset']
        );

        try {
            self::$instance = new PDO(
                $dsn,
                self::$config['username'],
                self::$config['password'],
                self::$config['options']
            );
            return self::$instance;
        } catch (PDOException $e) {
            // Log real error to server error log without leaking passwords in public responses
            error_log('[Khoji Nepal DB Error] Connection failed: ' . $e->getMessage());
            
            throw new Exception(
                'A secure database connection could not be established. Please verify system environment configuration.',
                500
            );
        }
    }

    /**
     * Execute a prepared SQL statement safely
     * 
     * @param string $sql Parameterized SQL query
     * @param array $params Query parameter values
     * @return \PDOStatement
     */
    public static function query(string $sql, array $params = []): \PDOStatement
    {
        $pdo = self::getConnection();
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    /**
     * Start a Database Transaction
     */
    public static function beginTransaction(): bool
    {
        return self::getConnection()->beginTransaction();
    }

    /**
     * Commit active transaction
     */
    public static function commit(): bool
    {
        return self::getConnection()->commit();
    }

    /**
     * Roll back active transaction
     */
    public static function rollBack(): bool
    {
        return self::getConnection()->rollBack();
    }
}

// ==============================================================================
// PRIVACY & DATA SANITIZATION HELPERS
// ==============================================================================

/**
 * Mask a phone number to safeguard citizen privacy.
 * Example: "+977 9841234567" -> "+977 9841***567"
 * 
 * @param string|null $phone
 * @return string|null
 */
function maskPhoneNumber(?string $phone): ?string
{
    if ($phone === null || trim($phone) === '') {
        return null;
    }

    $clean = trim($phone);
    $len = strlen($clean);

    if ($len <= 4) {
        return '****';
    }

    if ($len <= 7) {
        return substr($clean, 0, 2) . str_repeat('*', $len - 4) . substr($clean, -2);
    }

    // Standard phone length (e.g., 10-14 digits): show first 6 chars, mask middle, show last 3 chars
    $prefixLen = min(6, (int)floor($len / 3));
    $suffixLen = min(3, (int)floor($len / 4));
    $maskLen = max(3, $len - $prefixLen - $suffixLen);

    return substr($clean, 0, $prefixLen) . str_repeat('*', $maskLen) . substr($clean, -$suffixLen);
}

/**
 * Sanitize a missing person record for public API presentation.
 * Redacts guardian phone number, private notes, and internal flags
 * unless the requester is an authorized verifier/administrator.
 * 
 * @param array $record Raw database record
 * @param bool $isAuthorizedPrivileged Whether the requester is an authorized moderator/admin
 * @return array Sanitized public record
 */
function sanitizeMissingPersonPublic(array $record, bool $isAuthorizedPrivileged = false): array
{
    $sanitized = $record;

    if (!$isAuthorizedPrivileged) {
        // Redact direct contact information
        if (isset($sanitized['guardian_phone'])) {
            $sanitized['guardian_phone'] = maskPhoneNumber($sanitized['guardian_phone']);
            $sanitized['is_contact_masked'] = true;
            $sanitized['contact_channel'] = 'Contact District Police (100) or RFL Desk (112) for verified guardian coordination';
        }

        // Conceal internal system notes if present
        unset($sanitized['source_reference']);
    }

    return $sanitized;
}

/**
 * Sanitize a relief request record for public dashboard presentation.
 * Masks requester phone number and exact personal identifiers.
 * 
 * @param array $record Raw database record
 * @param bool $isAuthorizedPrivileged
 * @return array
 */
function sanitizeReliefRequestPublic(array $record, bool $isAuthorizedPrivileged = false): array
{
    $sanitized = $record;

    if (!$isAuthorizedPrivileged) {
        if (isset($sanitized['phone'])) {
            $sanitized['phone'] = maskPhoneNumber($sanitized['phone']);
        }
        if (isset($sanitized['requester_name'])) {
            // Show only first name or initial for public crisis map privacy
            $parts = explode(' ', trim($sanitized['requester_name']));
            $sanitized['requester_name'] = count($parts) > 1 ? $parts[0] . ' ' . substr($parts[1], 0, 1) . '.' : $parts[0];
        }
    }

    return $sanitized;
}

/**
 * Write a secure, prepared audit log entry
 * 
 * @param PDO $pdo
 * @param int|null $userId
 * @param string $action
 * @param string $entityType
 * @param int|null $entityId
 * @param string|null $ipAddress
 * @return bool
 */
function logAudit(
    PDO $pdo,
    ?int $userId,
    string $action,
    string $entityType,
    ?int $entityId = null,
    ?string $ipAddress = null
): bool {
    try {
        $stmt = $pdo->prepare(
            'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address, created_at)
             VALUES (:user_id, :action, :entity_type, :entity_id, :ip_address, NOW())'
        );
        return $stmt->execute([
            ':user_id'     => $userId,
            ':action'      => $action,
            ':entity_type' => $entityType,
            ':entity_id'   => $entityId,
            ':ip_address'  => $ipAddress ?? ($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1')
        ]);
    } catch (\Throwable $e) {
        error_log('[Khoji Nepal Audit Error] ' . $e->getMessage());
        return false;
    }
}
