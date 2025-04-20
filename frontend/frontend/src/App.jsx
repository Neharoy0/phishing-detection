import React, { useState, useEffect } from 'react';
import { PieChart } from 'react-minimal-pie-chart';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './components/ThemeProvider';

function App() {
  const [emails, setEmails] = useState(() => {
    const savedEmails = localStorage.getItem("emails");
    return savedEmails ? JSON.parse(savedEmails) : [];
  });
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [emailStats, setEmailStats] = useState({ clean: 0, suspicious: 0, malicious: 0 });

  // Fetch emails from backend
  useEffect(() => {
    fetch('http://127.0.0.1:5000/scan-emails')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const parsedData = data.map((email) => ({
            subject: email.subject || 'No Subject',
            from: email.from || 'Unknown sender',
            date: email.date || 'Unknown date',
            body: email.body || 'No email body available',
            urls: email.urls || [],
            //status: email.status || (email.urls?.length > 0 ? 'suspicious' : 'clean'),
            status: email.status,  // backend provides the final verdict now
          }));
          setEmails((prevEmails) => {
            const allEmails = [...prevEmails, ...parsedData];
            localStorage.setItem("emails", JSON.stringify(allEmails));
            return allEmails;
          });
        }
      })
      .catch(console.error);
  }, []);

  // Update stats whenever emails change
  useEffect(() => {
    const stats = { clean: 0, suspicious: 0, malicious: 0 };
    emails.forEach((email) => {
      if (email.status === 'clean') stats.clean++;
      else if (email.status === 'suspicious') stats.suspicious++;
      else if (email.status === 'malicious') stats.malicious++;
    });
    setEmailStats(stats);
  }, [emails]);

  // Pie chart only shows segments for present categories
  const pieData = [
    emailStats.clean > 0 && { value: emailStats.clean, color: '#4CAF50' },
    emailStats.suspicious > 0 && { value: emailStats.suspicious, color: '#FFEB3B' },
    emailStats.malicious > 0 && { value: emailStats.malicious, color: '#F44336' },
  ].filter(Boolean);

  return (
    <ThemeProvider>
      <div className="dashboard-root">
        <Toaster />
        <header className="dashboard-header">
          <h1>
            <span role="img" aria-label="mail" style={{ marginRight: 8 }}>📬</span>
            <span>Phishing Detection Dashboard</span>
          </h1>
        </header>
        
        <div className="dashboard-top-section">
          <div className="stats-pie-container">
            {/* Pie Chart Card */}
            <section className="pie-card" aria-label="Email Status Pie Chart">
              <PieChart
                data={pieData}
                label={null}
                radius={45}
                animate
                style={{ width: '350px', height: '350px', margin: '0 auto' }}
              />
              <div className="pie-legend">
                {emailStats.clean > 0 && (
                  <span>
                    <span className="legend-dot" style={{ background: '#4CAF50' }}></span> Clean
                  </span>
                )}
                {emailStats.suspicious > 0 && (
                  <span>
                    <span className="legend-dot" style={{ background: '#FFEB3B' }}></span> Suspicious
                  </span>
                )}
                {emailStats.malicious > 0 && (
                  <span>
                    <span className="legend-dot" style={{ background: '#F44336' }}></span> Malicious
                  </span>
                )}
              </div>
            </section>
            
            {/* Stats Cards */}
            <section className="stats-container">
              <div className="stat-card">
                <span className="stat-label">Total Emails</span>
                <span className="stat-value stat-total-value">{emails.length}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Clean</span>
                <span className="stat-value" style={{ color: '#4CAF50' }}>{emailStats.clean}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Suspicious</span>
                <span className="stat-value" style={{ color: '#FFEB3B' }}>{emailStats.suspicious}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Malicious</span>
                <span className="stat-value" style={{ color: '#F44336' }}>{emailStats.malicious}</span>
              </div>
            </section>
          </div>
        </div>
        
        <div className="dashboard-main-section">
          {/* Email List */}
          <section className="email-list-container">
            <div className="panel-title">
              <span role="img" aria-label="list" style={{ marginRight: 8 }}>📧</span>
              Email List
            </div>
            <div className="email-list">
              {emails.length > 0 ? (
                emails.map((email, index) => (
                  <div 
                    key={index} 
                    className={`email-item ${selectedEmail === email ? 'selected' : ''}`}
                    onClick={() => setSelectedEmail(email)}
                  >
                    <div className="email-item-line">
                      <strong>Subject:</strong> {email.subject}
                    </div>
                    <div className="email-item-line">
                      <strong>From:</strong> {email.from}
                    </div>
                    <div className="email-item-line">
                      <strong>Date:</strong> {email.date}
                    </div>
                    <div 
                      className="email-item-status"
                      style={{ 
                        color: email.status === 'clean' ? '#4CAF50' : 
                               email.status === 'suspicious' ? '#FFEB3B' : '#F44336' 
                      }}
                    >
                      {email.status}
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-emails">No emails to display</p>
              )}
            </div>
          </section>
          
          {/* Email Details */}
          <section className="email-detail-container">
            <div className="panel-title">
              <span role="img" aria-label="details" style={{ marginRight: 8 }}>📝</span>
              Email Details
            </div>
            {selectedEmail ? (
              <div className="email-detail">
                <h3>{selectedEmail.subject}</h3>
                <p><strong>From:</strong> {selectedEmail.from}</p>
                <p><strong>Date:</strong> {selectedEmail.date}</p>
                <p>
                  <strong>Status:</strong> 
                  <span style={{ 
                    color: selectedEmail.status === 'clean' ? '#4CAF50' : 
                           selectedEmail.status === 'suspicious' ? '#FFEB3B' : '#F44336',
                    marginLeft: '8px'
                  }}>
                    {selectedEmail.status}
                  </span>
                </p>
                <p><strong>Body:</strong></p>
                <div className="email-body">{selectedEmail.body}</div>
                {selectedEmail.urls?.length > 0 && (
                  <>
                    <p><strong>URLs:</strong></p>
                    <ul className="url-list">
                      {selectedEmail.urls.map((url, idx) => (
                        <li key={idx}>
                          <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            ) : (
              <div className="email-detail-placeholder">
                Select an email to view details
              </div>
            )}
          </section>
        </div>
      </div>
    </ThemeProvider>
  );
}

export { App };
