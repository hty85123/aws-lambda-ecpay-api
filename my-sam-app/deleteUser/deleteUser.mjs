import mysql from 'mysql2/promise'; // Import MySQL with ES Modules

const dbConfig = {
    host: process.env.RDS_HOSTNAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    database: process.env.RDS_DATABASE,
};

export const handler = async (event) => {
    let connection;
    try {
        const  userId  = event.pathParameters.userId; // Get userId from the path

        // Establish connection to the database
        connection = await mysql.createConnection(dbConfig);

        // Begin a transaction to ensure both deletes succeed or fail together
        await connection.beginTransaction();

        // Delete all transactions related to the user
        await connection.query('DELETE FROM Transactions WHERE user_id = ?', [userId]);

        // Delete the user
        const [result] = await connection.query('DELETE FROM Users WHERE user_id = ?', [userId]);

        // Commit the transaction
        await connection.commit();

        // Check if the user was deleted (result.affectedRows > 0 means success)
        if (result.affectedRows > 0) {
            return {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "DELETE",
                    "Access-Control-Allow-Headers": "Content-Type"
                },
                body: JSON.stringify({ message: `User with ID ${userId} deleted successfully along with their transactions.` }),
            };
        } else {
            // If no user was deleted, return an error message
            return {
                statusCode: 404,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "DELETE",
                    "Access-Control-Allow-Headers": "Content-Type"
                },
                body: JSON.stringify({ error: `User with ID ${userId} not found.` }),
            };
        }

    } catch (error) {
        // Rollback the transaction if an error occurs
        if (connection) await connection.rollback();

        console.error('Error deleting user and transactions:', error);

        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "DELETE",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    } finally {
        // Ensure the database connection is closed
        if (connection) await connection.end();
    }
};
