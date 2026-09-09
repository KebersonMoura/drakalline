import mysql from 'mysql2/promise';

async function testConnection() {
  console.log('Testing MySQL Connection...');
  console.log('Env variables detected:');
  console.log('MYSQL_HOST:', process.env.MYSQL_HOST || '(not set)');
  console.log('MYSQL_PORT:', process.env.MYSQL_PORT || '3306');
  console.log('MYSQL_USER:', process.env.MYSQL_USER || '(not set)');
  console.log('MYSQL_DATABASE:', process.env.MYSQL_DATABASE || '(not set)');
  console.log('MYSQL_PASSWORD set?:', Boolean(process.env.MYSQL_PASSWORD));
  console.log('DATABASE_URL set?:', Boolean(process.env.DATABASE_URL));

  const config = {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || undefined,
    connectTimeout: 10000,
    ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  };

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Successfully connected to MySQL!');
    const [rows] = await connection.query('SELECT 1 + 1 AS result');
    console.log('Query result:', rows);
    await connection.end();
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    // If database didn't exist or ssl was required, try without database first
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('Database does not exist yet. Attempting connection without database name to create it...');
      try {
        const connWithoutDb = await mysql.createConnection({
          host: config.host,
          port: config.port,
          user: config.user,
          password: config.password,
          ssl: config.ssl
        });
        console.log('✅ Connected without DB. Creating database', process.env.MYSQL_DATABASE);
        await connWithoutDb.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.MYSQL_DATABASE}\``);
        console.log('✅ Database created!');
        await connWithoutDb.end();
      } catch (err2) {
        console.error('Failed to create database:', err2.message);
      }
    }
  }
}

testConnection();
