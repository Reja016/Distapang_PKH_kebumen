import mysql from 'mysql2/promise';

declare global {
  // eslint-disable-next-line no-var
  var _simantapPool: mysql.Pool | undefined;
}

export const pool =
  global._simantapPool ??
  mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'simantap_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

if (process.env.NODE_ENV !== 'production') {
  global._simantapPool = pool;
}

export default pool;