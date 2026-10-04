import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * The end-to-end stack: its own Laravel server and Vite server on dedicated
 * ports, so a run never reuses (or writes to) the development servers and
 * their MySQL database.
 */

const here = path.dirname(fileURLToPath(import.meta.url))

export const FRONTEND_PORT = 5180
export const API_PORT = 8010

export const frontendUrl = `http://localhost:${FRONTEND_PORT}`
export const apiUrl = `http://localhost:${API_PORT}`

export const backendDir = path.resolve(here, '../../../backend')

const opcacheLoaded = () => {
  try {
    return execFileSync('php', ['-r', "echo extension_loaded('Zend OPcache') ? 1 : 0;"]).toString() === '1'
  } catch {
    return false
  }
}

/**
 * The Laravel API on PHP's built-in web server, run from backend/public with
 * Laravel's own router script (what `php artisan serve` does), plus OPcache:
 * without it every request recompiles the framework (~0.5 s instead of ~0.05 s),
 * and the one-request-at-a-time built-in server makes the browser tests time out.
 * The extension is loaded only when php.ini does not load it already.
 */
export function apiServerCommand() {
  const opcache = [...(opcacheLoaded() ? [] : ['-d zend_extension=opcache']), '-d opcache.enable_cli=1']
  const router = path.join(backendDir, 'vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php')

  return `php ${opcache.join(' ')} -S localhost:${API_PORT} "${router}"`
}

/**
 * Environment of every Laravel process in the e2e stack. Real environment
 * variables win over backend/.env (Laravel never overwrites them), so this
 * points the app at a throwaway SQLite file and at the e2e frontend origin.
 */
export const backendEnv = {
  APP_URL: apiUrl,
  FRONTEND_URL: frontendUrl,
  SANCTUM_STATEFUL_DOMAINS: `localhost:${FRONTEND_PORT}`,
  DB_CONNECTION: 'sqlite',
  DB_DATABASE: path.join(backendDir, 'database', 'e2e.sqlite'),
  DB_URL: '',
  SESSION_DRIVER: 'file',
  CACHE_STORE: 'array',
  // E-mails are "sent" right away into memory: no queue worker needed.
  QUEUE_CONNECTION: 'sync',
  MAIL_MAILER: 'array',
  // Tests log in, check out and post forms from one IP far faster than a person.
  SHOP_RATE_LIMITING: 'false',
}
