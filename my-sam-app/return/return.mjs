import ecpay_payment from 'ecpay_aio_nodejs';
import querystring from 'querystring';
import mysql from 'mysql2/promise';

const MERCHANTID = "2000132"; // ECPAY official test MERCHANTID
const HASHKEY = "5294y06JbISpM5x9"; // ECPAY official test HASHKEY
const HASHIV = "v77hoKGq4kWxNNIS"; // ECPAY official test HASHIV

const options = {
  OperationMode: 'Test',
  MercProfile: {
    MerchantID: MERCHANTID,
    HashKey: HASHKEY,
    HashIV: HASHIV,
  },
  IgnorePayment: [],
  IsProjectContractor: false,
};

const dbConfig = {
  host: process.env.RDS_HOSTNAME,
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  database: process.env.RDS_DATABASE,
};

export const handler = async (event) => {
  // const decodedBody = Buffer.from(event.body, 'base64').toString('utf-8');
  // console.log(decodedBody);
  const body = querystring.parse(event.body);

  // Prepare data for ECPay security check
  const { CheckMacValue, MerchantTradeNo } = body;
  const data = { ...body };
  delete data.CheckMacValue;
  // ECPay security check using SDK
  const create = new ecpay_payment(options);
  const checkValue = create.payment_client.helper.gen_chk_mac_value(data);
  const isValid = CheckMacValue === checkValue;

  const transaction_id = event.pathParameters.transactionId;
  const user_id = event.pathParameters.userId;

  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();
    if (isValid) { // mark the transaction successful and update the balance of the user
      
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

    } else { // mark the transaction failed
      const [result] = await connection.execute(
        'UPDATE Transactions SET status = ? WHERE transaction_id = ?',
        ['failed', transaction_id]
      );
      console.log(`Transaction ${transaction_id} marked as failed.`);
    }
    
    await connection.commit();
    return {
      statusCode: 200,
      body: isValid ? '1|OK' : '0|Internal Server Error',
      headers: {
        'Content-Type': 'text/plain',
      },
    };

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error processing transaction, transaction rolled back:', error);

    return {
      statusCode: 500,
      body: '0|Internal Server Error',
      headers: {
        'Content-Type': 'text/plain',
      },
    };

  } finally {
    if (connection) await connection.end();
  }
};
