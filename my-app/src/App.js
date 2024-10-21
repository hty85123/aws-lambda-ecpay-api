import React, { useState, useEffect } from 'react';
import UserDataPanel from './components/UserDataPanel';
import TransactionDataPanel from './components/TransactionDataPanel';
import './styles.css';

const API_ID = "cz7axg7qk9";
const App = () => {

  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transactionAmount, setTransactionAmount] = useState(0);
  const [selectedUsername, setSelectedUsername] = useState('');
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  

  // Pagination Relational state
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const usersPerPage = 8;
  const [transactionCurrentPage, setTransactionCurrentPage] = useState(1);
  const transactionsPerPage = 6;

  // Helper function to fetch data from the API
  const fetchData = async (url, options = {}) => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error('Network response was not ok');
      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else if (contentType && contentType.includes('text/html')) {
        return await response.text();
      } else {
        throw new Error('Unsupported content type: ' + contentType);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  };

  // Fetch users based on pagination
  const fetchUsers = async () => {
    const data = await fetchData(`https://${API_ID}.execute-api.ap-southeast-2.amazonaws.com/Prod/users?page=${userCurrentPage}&pageSize=${usersPerPage}`);
    setUsers(data.users);
    setTotalUsers(data.total);
  };

  // Fetch transactions of the selected user based on pagination
  const fetchTransactions = async () => {
    if (selectedUserId) {
      const data = await fetchData(`https://${API_ID}.execute-api.ap-southeast-2.amazonaws.com/Prod/users/${selectedUserId}/transactions?page=${transactionCurrentPage}&pageSize=${transactionsPerPage}`);
      setTransactions(data.transactions);
      setTotalTransactions(data.total);
    }
  };

  // useEffect for fetching users
  useEffect(() => {
    fetchUsers();
  }, [userCurrentPage]);

  // useEffect for fetching transactions
  useEffect(() => {
    fetchTransactions();
  }, [selectedUserId, transactionCurrentPage]);

  // Handle user selection
  const handleSelectUser = (userId, username) => {
    setSelectedUserId(userId);
    setSelectedUsername(username);
    fetchTransactions(); // Fetch transactions whenever a user is selected
    setTransactionCurrentPage(1);
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    try {
      await fetchData(`https://${API_ID}.execute-api.ap-southeast-2.amazonaws.com/Prod/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      // After deleting a user, refetch the users list and reset transactions
      fetchUsers();
      setSelectedUserId(null);
      setSelectedUsername('');
      setTransactions([]); // Clear transactions for deleted user
      alert('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  // Handle user creation
  const handleCreateUser = async () => {
    if (!newUsername || !newEmail) {
      alert('Please provide username and email');
      return;
    }
    try {
      const data = await fetchData(`https://${API_ID}.execute-api.ap-southeast-2.amazonaws.com/Prod/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername,
          email: newEmail,
        }),
      });
  
      // After creating a user, refetch the users list
      fetchUsers();
      setNewUsername('');
      setNewEmail('');
      setShowPopup(false);
      alert('User created successfully');
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user');
    }
  };

  // Common function to create transaction
  const createTransaction = async (transactionAmount, type, status = 'pending') => {
    const payload = {
      transaction_type: type,
      amount: transactionAmount,
      status
    };
    const response = await fetchData(`https://${API_ID}.execute-api.ap-southeast-2.amazonaws.com/Prod/users/${selectedUserId}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return response;
  };
  
  // Common function to deal with deposit and withdraw
  const updateTransaction = async (transaction_id) => {
    await fetchData(`https://${API_ID}.execute-api.ap-southeast-2.amazonaws.com/Prod/users/${selectedUserId}/transactions/${transaction_id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    });
  };

  //Common function to get payment page
  const requestPayment = async (transaction_id) =>{
    const response = await fetchData(`https://${API_ID}.execute-api.ap-southeast-2.amazonaws.com/Prod/users/${selectedUserId}/transactions/${transaction_id}/requestPayment`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/html' },
    });
    // Redirect to ecpay payment page
    const html = response;
    const paymentDiv = document.createElement('div');
    paymentDiv.innerHTML = html;
    document.body.appendChild(paymentDiv);
    paymentDiv.querySelector('form').submit();
  };


  // Handle deposit logic
  const handleDeposit = async () => {
    if (transactionAmount <= 0) {
      alert('Input amount must be greater than 0');
      return;
    }
    try {

      const createTransactionResponse = await createTransaction(transactionAmount, 'deposit');
      const transaction_id = createTransactionResponse.transaction_id;
      fetchTransactions();
      alert('Redirect to ECPay payment page.');
      await requestPayment(transaction_id);
      
    } catch (error) {
      alert('Error during Deposit:', error);
    }
  };

  // Handle withdraw logic
  const handleWithdraw = async () => {
    if (transactionAmount <= 0) {
      alert('Input amount must be greater than 0');
      return;
    }

    const selectedUser = users.find(user => user.user_id === selectedUserId);
    if (transactionAmount > selectedUser.balance) {
      alert('Withdrawal amount exceeds balance.');
      return;
    }

    try {
      const createTransactionResponse = await createTransaction(transactionAmount, 'withdraw');

      const transaction_id = createTransactionResponse.transaction_id;

      await updateTransaction(transaction_id);

      // After withdraw, refetch the transaction list
      fetchUsers();
      fetchTransactions();
      alert('Withdraw completed.');
    } catch (error) {
      alert('Error during withdraw:', error);
    }
  };

  return (
    <div className={`app-container ${showPopup ? 'disabled' : ''}`}>
      <UserDataPanel
        users={users}
        totalUsers={totalUsers}
        usersPerPage={usersPerPage}
        currentPage={userCurrentPage}
        onSelectUser={handleSelectUser}
        onDeleteUser={handleDeleteUser}
        onPageChange={setUserCurrentPage}
        selectedUserId={selectedUserId}
        setShowPopup={setShowPopup}
      />

      <TransactionDataPanel
        transactions={transactions}
        totalTransactions={totalTransactions}
        transactionsPerPage={transactionsPerPage}
        currentPage={transactionCurrentPage}
        userId={selectedUserId}
        selectedUsername={selectedUsername}
        setTransactionAmount={setTransactionAmount}
        handleDeposit={handleDeposit}
        handleWithdraw={handleWithdraw}
        handlePayment={requestPayment}
        onPageChange={setTransactionCurrentPage}
      />

      {/* User creating popup */}
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Create New User</h3>
            <input
              type="text"
              placeholder="Username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <button onClick={handleCreateUser}>Create</button>
            <button onClick={() => setShowPopup(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
