import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

// Required for Node.js to use WebSockets with Neon
neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ Missing DATABASE_URL in .env');
    console.error('   Get your connection string from: https://console.neon.tech');
    process.exit(1);
}

// Connect over WebSocket using the serverless driver.
// This perfectly bypasses strict local firewalls blocking port 5432!
const pool = new Pool({
    connectionString: DATABASE_URL,
});

// Verify connection on startup
pool.query('SELECT NOW()')
    .then(() => {
        console.log('╔════════════════════════════════════════════════════════╗');
        console.log('║        ✅ Neon PostgreSQL Connected Successfully      ║');
        console.log('╚════════════════════════════════════════════════════════╝');
    })
    .catch(err => {
        console.error('❌ Failed to connect to Neon PostgreSQL. Full error:', err);
    });

/**
 * Execute a parameterized SQL query.
 * @param {string} text - SQL query with $1, $2, ... placeholders
 * @param {Array} params - Parameter values
 * @returns {Promise<{rows: Array, rowCount: number}>}
 */
export const query = (text, params) => pool.query(text, params);

export { pool };
