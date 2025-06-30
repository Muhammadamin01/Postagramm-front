import React, { useState } from 'react';
import './Users.css';

const usersData = [
  { id: 1, name: 'JaneSmith' },
  { id: 2, name: 'MikeDoe' },
  { id: 3, name: 'TechGirl' },
];

export default function UserSearch() {
  const [query, setQuery] = useState('');
  const filteredUsers = usersData.filter(user =>
    user.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="user-search-container">
      <div className="user-search-box">
        <input
          type="text"
          placeholder="Search users..."
          className="user-search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {filteredUsers.map(user => (
          <div key={user.id} className="user-card">
            <div className="user-info">
              <div className="user-avatar"></div>
              <span>{user.name}</span>
            </div>
            <button className="follow-button">Follow</button>
          </div>
        ))}
      </div>
    </div>
  );
}
