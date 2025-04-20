import React from 'react';

export function EmailList({ emails, onSelect }) {
  return (
    <div className="email-list">
      <h3>Scanned Emails</h3>
      {emails.length > 0 ? (
        <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
          {emails.map((email, index) => (
            <li key={index} className="email-item" onClick={() => onSelect(email)}>
              <p><strong>Subject:</strong> {email.subject}</p>
              <p><strong>From:</strong> {email.from}</p>
              <p><strong>Date:</strong> {email.date}</p>
              <p style={{ color: 
                email.status === 'clean' ? '#4CAF50' :
                email.status === 'suspicious' ? '#FFEB3B' : '#F44336'
              }}>{email.status}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No emails to display</p>
      )}
    </div>
  );
}
