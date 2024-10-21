import mysql from 'mysql2/promise'; // 使用 ES Modules 導入 mysql2

const dbConfig = {
    host: process.env.RDS_HOSTNAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    database: process.env.RDS_DATABASE,
};

export const handler = async (event) => {
  let connection;
  
  try {
    const { username, email } = JSON.parse(event.body);
    
    // Verify that both the username and email exist in the request.
    if (!username || !email) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type"
        },
        body: JSON.stringify({ error: 'Username and email are required' }),
      };
    }

    // Connect to MySQL
    connection = await mysql.createConnection(dbConfig);

    await connection.beginTransaction();

    // Insert new user data
    const [result] = await connection.execute(
      'INSERT INTO Users (username, email) VALUES (?, ?)', [username, email]
    );

    // Construct response data
    const newUser = {
      username,
      email,
      balance: 0 // balance initialize
    };
    await connection.commit();
    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify(newUser),
    };

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error creating user:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  } finally {
    if (connection) await connection.end();
  }
};
