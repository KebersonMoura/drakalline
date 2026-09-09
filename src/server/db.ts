import mysql, { Pool } from 'mysql2/promise';

let pool: Pool | null = null;

export function getMySqlPool(): Pool | null {
  if (pool) return pool;

  const host = process.env.MYSQL_HOST;
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQL_DATABASE;
  const port = parseInt(process.env.MYSQL_PORT || '3306', 10);

  if (!host || !user) {
    return null;
  }

  try {
    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 10000,
      ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    });
    return pool;
  } catch (err) {
    console.error('Error creating MySQL pool:', err);
    return null;
  }
}

export interface DbStatusInfo {
  connected: boolean;
  provider: string;
  host?: string;
  database?: string;
  user?: string;
  tables: Record<string, number>;
  lastChecked: string;
  error?: string;
}

export async function checkMySqlConnection(): Promise<DbStatusInfo> {
  const p = getMySqlPool();
  if (!p) {
    return {
      connected: false,
      provider: 'Local Storage / In-Memory',
      tables: {},
      lastChecked: new Date().toISOString(),
      error: 'Variáveis de ambiente MySQL não configuradas.'
    };
  }

  try {
    const connection = await p.getConnection();
    const [rows] = await connection.query('SELECT 1 + 1 AS result');
    
    // Count rows across all Dra. Kaline tables
    const tableNames = [
      'appointments',
      'clients',
      'client_procedure_history',
      'procedures',
      'gallery_posts',
      'blog_posts',
      'testimonials',
      'notifications',
      'clinic_settings',
      'hero_slides',
      'admin_users'
    ];

    const tablesCount: Record<string, number> = {};

    for (const tbl of tableNames) {
      try {
        const [cntRows]: any = await connection.query(`SELECT COUNT(*) as cnt FROM \`${tbl}\``);
        tablesCount[tbl] = cntRows[0]?.cnt || 0;
      } catch {
        tablesCount[tbl] = 0;
      }
    }

    connection.release();

    return {
      connected: true,
      provider: 'MySQL Cloud / Externo',
      host: process.env.MYSQL_HOST,
      database: process.env.MYSQL_DATABASE,
      user: process.env.MYSQL_USER,
      tables: tablesCount,
      lastChecked: new Date().toISOString()
    };
  } catch (err: any) {
    console.error('MySQL connection check error:', err);
    return {
      connected: false,
      provider: 'MySQL Cloud / Externo (Falha na conexão)',
      host: process.env.MYSQL_HOST,
      database: process.env.MYSQL_DATABASE,
      user: process.env.MYSQL_USER,
      tables: {},
      lastChecked: new Date().toISOString(),
      error: err.message
    };
  }
}
