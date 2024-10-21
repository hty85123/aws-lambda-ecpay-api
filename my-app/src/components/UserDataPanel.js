import React from 'react';

const UserDataPanel = ({ users, totalUsers, usersPerPage, currentPage, onSelectUser, onDeleteUser, onPageChange, selectedUserId, setShowPopup }) => {
  const totalPages = Math.ceil(totalUsers / usersPerPage);

  const visiblePages = 5;
  const startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
  const endPage = Math.min(totalPages, startPage + visiblePages - 1);

  return (
    <div className="user-data-panel">
      <h2>User Data Panel</h2>
      <ul>
        {users.map((user) => (
          <li
            key={user.user_id}
            className={selectedUserId === user.user_id ? 'selected' : ''}
            onClick={() => onSelectUser(user.user_id, user.username)}
          >
            {user.username} - {user.email} - Balance: ${user.balance}
            <button className="inner-btn" onClick={(e) => { e.stopPropagation(); onDeleteUser(user.user_id); }}>Delete</button>
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

      <button onClick={() => setShowPopup(true)}>Create New User</button>
    </div>
  );
};

export default UserDataPanel;
