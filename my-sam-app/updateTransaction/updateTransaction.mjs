import mysql from 'mysql2/promise';

const dbConfig = {
    host: process.env.RDS_HOSTNAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    database: process.env.RDS_DATABASE,
};

export const handler = async (event) => {
    const transaction_id = event.pathParameters.transactionId;
    let connection;

    try {
        connection = await mysql.createConnection(dbConfig);

        await connection.beginTransaction();

        const [transaction] = await connection.execute(
            'SELECT user_id, amount, transaction_type, status FROM Transactions WHERE transaction_id = ?',
            [transaction_id]
        );

        if (transaction.length === 0) {
            throw new Error('Transaction not found');
        }

        const { user_id, amount, transaction_type, status } = transaction[0];

        if (status !== 'pending') {
            throw new Error('Transaction already processed');
        }

        const [user] = await connection.execute(
            'SELECT balance FROM Users WHERE user_id = ?',
            [user_id]
        );

        if (user.length === 0) {
            throw new Error('User not found');
        }

        let userBalance = user[0].balance;

        if (transaction_type === 'deposit') {
            userBalance += amount;
        } else if (transaction_type === 'withdraw') {
            if (userBalance < amount) {
                throw new Error('Insufficient balance for withdraw');
            }
            userBalance -= amount;
        } else {
            throw new Error('Invalid transaction type');
        }

        await connection.execute(
            'UPDATE Users SET balance = ? WHERE user_id = ?',
            [userBalance, user_id]
        );

        await connection.execute(
            'UPDATE Transactions SET status = ? WHERE transaction_id = ?',
            ['completed', transaction_id]
        );

        await connection.commit();

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "PATCH",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({ message: 'Transaction processed successfully',}),
        };
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error processing transaction, transaction rolled back:', error);

        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "PATCH",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({ message: 'Internal Server Error' }),
        };
    } finally {
        if (connection) await connection.end();
    }
};
