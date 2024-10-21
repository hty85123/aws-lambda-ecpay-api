import React, { useState } from 'react';

const TransactionDataPanel = ({
  transactions,
  totalTransactions,
  transactionsPerPage,
  currentPage,
  userId,
  selectedUsername,
  setTransactionAmount,
  handleDeposit,
  handleWithdraw,
  handlePayment,
  onPageChange
}) => {
  const [amount, setAmount] = useState(0);
  const totalPages = Math.ceil(totalTransactions / transactionsPerPage);

  const visiblePages = 5;
  const startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
  const endPage = Math.min(totalPages, startPage + visiblePages - 1);

  const onAmountChange = (e) => {
    const value = e.target.value;
    if (Number.isInteger(+value) && +value > 0) {
      setAmount(value);
      setTransactionAmount(value);
    }
  };

  return (
    <div className="transaction-data-panel">
      <h2>Transaction Data Panel</h2>
      {userId ? (
        <>
          <p className="transaction-username">Transactions for {selectedUsername}</p>
          <ul>
            {transactions.map((transaction) => (
              <li key={transaction.transaction_id}>
                {transaction.transaction_type} - {transaction.amount} - {transaction.status} - {new Date(transaction.created_at).toLocaleString()}
                {transaction.status === 'pending' && (
                  <button 
                    className="inner-btn" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handlePayment(transaction.transaction_id); 
                    }}
                  >
                    Payment
                  </button>
                )}
              </li>
            ))}
          </ul>

          <div className="pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            {[...Array(endPage - startPage + 1).keys()].map(i => {
              const page = startPage + i;
              return (
                <button
                  key={page}
                  className={currentPage === page ? 'active' : ''}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages===0}
            >
              Next
            </button>
          </div>

          <input
            type="number"
            value={amount}
            onChange={onAmountChange}
            placeholder="Enter Positive Integer"
          />
          <button onClick={handleDeposit}>Deposit</button>
          <button onClick={handleWithdraw}>Withdraw</button>
        </>
      ) : (
        <p>Please select a user to view transactions.</p>
      )}
    </div>
  );
};

export default TransactionDataPanel;
