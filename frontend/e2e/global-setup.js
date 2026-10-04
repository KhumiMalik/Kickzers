import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import { backendDir, backendEnv } from './support/servers'

/**
 * Runs once before the e2e tests: rebuilds the throwaway SQLite database and
 * seeds the demo catalog, so every run starts from the same data
 * (18 products, 9 posts, coupons, jane@example.com / password).
 */
export default function globalSetup() {
  if (!fs.existsSync(backendEnv.DB_DATABASE)) fs.writeFileSync(backendEnv.DB_DATABASE, '')

  execFileSync('php', ['artisan', 'migrate:fresh', '--seed', '--force', '--no-interaction'], {
    cwd: backendDir,
    env: { ...process.env, ...backendEnv },
    stdio: 'inherit',
  })
}
