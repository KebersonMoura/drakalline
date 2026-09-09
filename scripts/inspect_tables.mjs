import mysql from 'mysql2/promise';

async function inspectTables() {
  const config = {
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  };

  const connection = await mysql.createConnection(config);

  const [tables] = await connection.query('SHOW TABLES');
  const tableKey = Object.keys(tables[0])[0];
  
  console.log(`Database: ${config.database} @ ${config.host}`);
  console.log('----------------------------------------------------');
  
  for (const t of tables) {
    const tableName = t[tableKey];
    const [countRows] = await connection.query(`SELECT COUNT(*) AS total FROM \`${tableName}\``);
    const [cols] = await connection.query(`DESCRIBE \`${tableName}\``);
    console.log(`📋 Table: ${tableName} | Rows: ${countRows[0].total} | Columns: ${cols.map(c => c.Field).join(', ')}`);
  }

  await connection.end();
}

inspectTables();
