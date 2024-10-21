import mysql from 'mysql2/promise';

const dbConfig = {
    host: process.env.RDS_HOSTNAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    database: process.env.RDS_DATABASE,
};

export const handler = async (event) => {
    const transaction_id = 'ECP' + new Date().getTime();
    const body = JSON.parse(event.body);
    const { transaction_type, amount, status } = body;
    const user_id = event.pathParameters.userId;

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        
        await connection.beginTransaction();

        const [user] = await connection.execute(
            'SELECT balance FROM Users WHERE user_id = ?',
            [user_id]
        );

        if (user.length === 0) {
            throw new Error('User not found');
        }

        const userBalance = user[0].balance;

        if (transaction_type === 'withdraw' && userBalance < amount) {
            throw new Error('Insufficient balance for withdrawal');
        }

        const query = `
            INSERT INTO Transactions (transaction_id, user_id, transaction_type, amount, status)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await connection.execute(query, [transaction_id, user_id, transaction_type, amount, status]);

        await connection.commit();

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({
                message: 'Transaction record created successfully',
                transaction_id: transaction_id,
            }),
        };
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error creating transaction record, transaction rolled back:', error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    } finally {
        if (connection) await connection.end();
    }
};
