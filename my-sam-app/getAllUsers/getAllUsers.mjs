import mysql from 'mysql2/promise';

const dbConfig = {
    host: process.env.RDS_HOSTNAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    database: process.env.RDS_DATABASE,
};

export const handler = async (event) => {
  const page = parseInt(event.queryStringParameters.page) || 1;
  const pageSize = parseInt(event.queryStringParameters.pageSize) || 8;

  const offset = (page - 1) * pageSize;

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const [totalResult] = await connection.query('SELECT COUNT(*) as total FROM Users');
    const total = totalResult[0].total;

    const [rows] = await connection.query(
    'SELECT * FROM Users ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [pageSize, offset]
    );
    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type"
        },
        body: JSON.stringify({
            users: rows,
            total: total,
            page: page,
            pageSize: pageSize
        }),
    };
  } catch (error) {
    console.error('Error retrieving users:', error);
    return {
        statusCode: 500,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type"
        },
        body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  } finally {
    if (connection) await connection.end();
  }
};
