import { Pool } from 'pg';

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    const connectionString =
      process.env.DATABASE_URL ||
      `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || '12345'}@${
        process.env.TYPEORM_HOST || process.env.POSTGRES_HOST || 'daily-postgres'
      }:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'api'}`;

    pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 4000,
    });

    pool.on('error', (err) => {
      console.error('[DB Pool Error]', err);
    });
  }

  return pool;
}

export async function dbQuery<T = any>(text: string, params?: any[]): Promise<T[]> {
  const p = getDbPool();
  try {
    const res = await p.query(text, params);
    return res.rows as T[];
  } catch (err) {
    console.error('[dbQuery Error]', text, err);
    throw err;
  }
}
