import React from 'react';

export function EmailDetail({ email }) {
  return (
    <div className="email-detail">
      <h3>{email.subject}</h3>
      <p><strong>From:</strong> {email.from}</p>
      <p><strong>Date:</strong> {email.date}</p>
      <p><strong>Status:</strong> <span style={{color: 
        email.status === 'clean' ? '#4CAF50' :
        email.status === 'suspicious' ? '#FFEB3B' : '#F44336'
      }}>{email.status}</span></p>
      <p><strong>Body:</strong> {email.body}</p>
      {email.urls?.length > 0 && (
        <>
          <p><strong>URLs:</strong></p>
          <ul>
            {email.urls.map((url, idx) => (
              <li key={idx}>
                <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
