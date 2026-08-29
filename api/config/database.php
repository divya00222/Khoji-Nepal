<?php
/**
 * KHOJI NEPAL — Database & API Configuration
 * /api/config/database.php
 */

declare(strict_types=1);

namespace KhojiNepal\Api\Config;

require_once __DIR__ . '/../../config/database.php';

use KhojiNepal\Config\Database;
use PDO;

class ApiConfig
{
    /**
     * Standard JSON Response Header & Security Headers
     */
    public static function setJsonHeaders(): void
    {
        header('Content-Type: application/json; charset=utf-8');
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: SAMEORIGIN');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');
    }

    /**
     * Send structured JSON success response
     */
    public static function respondSuccess(mixed $data, int $httpCode = 200): void
    {
        http_response_code($httpCode);
        self::setJsonHeaders();
        echo json_encode([
            'success' => true,
            'data'    => $data
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    /**
     * Send structured JSON error response
     */
    public static function respondError(string $message, int $httpCode = 400, array $errors = []): void
    {
        http_response_code($httpCode);
        self::setJsonHeaders();
        $payload = [
            'success' => false,
            'message' => $message
        ];
        if (!empty($errors)) {
            $payload['errors'] = $errors;
        }
        echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    /**
     * Simple token/session rate limiter helper
     */
    public static function enforceRateLimit(string $key, int $maxRequests = 60, int $decaySeconds = 60): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $now = time();
        $rateKey = 'rate_limit_' . $key;
        if (!isset($_SESSION[$rateKey])) {
            $_SESSION[$rateKey] = ['count' => 1, 'start' => $now];
            return;
        }
        if ($now - $_SESSION[$rateKey]['start'] > $decaySeconds) {
            $_SESSION[$rateKey] = ['count' => 1, 'start' => $now];
            return;
        }
        $_SESSION[$rateKey]['count']++;
        if ($_SESSION[$rateKey]['count'] > $maxRequests) {
            self::respondError('Too many requests. Please try again shortly.', 429);
        }
    }
}
