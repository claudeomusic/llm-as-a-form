import { useState } from 'react';
import { LLMFormContainer } from 'llm-as-a-form';
import { createMockLLMClient } from './mockLLMClient';
import { tools } from './tools';
import './App.css';
import './FormStyles.css';

const mockClient = createMockLLMClient();

type PageContext = 'register' | 'appointments' | 'feedback';

function App() {
  const [submissions, setSubmissions] = useState<Array<{ tool: string; data: any }>>([]);
  const [currentPage, setCurrentPage] = useState<PageContext>('register');
  const [key, setKey] = useState(0); // Force remount when page changes

  const handlePageChange = (page: PageContext) => {
    setCurrentPage(page);
    setKey(prev => prev + 1); // Trigger remount
  };

  const getContextMessage = (page: PageContext) => {
    switch (page) {
      case 'register':
        return 'User navigated to /register - they want to create an account';
      case 'appointments':
        return 'User navigated to /appointments - they want to schedule a meeting';
      case 'feedback':
        return 'User navigated to /feedback - they want to leave a review';
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🎯 LLM as a Form</h1>
        <p className="subtitle">Form-first AI interactions (no chat!)</p>
      </header>

      <div className="container">
        <div className="main-content">
          <div className="info-card">
            <h2>👋 Welcome to the Demo!</h2>
            <p>
              This demo shows <strong>llm-as-a-form</strong> in action. The LLM analyzes context
              and immediately shows the appropriate form—no chat interface needed!
            </p>
            <div className="tips">
              <h3>How it works:</h3>
              <ul>
                <li>📍 Click a tab above to simulate different page contexts</li>
                <li>🤖 LLM receives context (e.g., URL, user intent)</li>
                <li>📝 LLM selects and shows the appropriate form</li>
                <li>✅ User fills form and submits structured data</li>
                <li>🔄 LLM can request another form or show completion message</li>
              </ul>
            </div>
            <div className="note">
              <strong>Note:</strong> This uses a mock LLM client. In production, connect to
              OpenAI, Anthropic, or your preferred provider.
            </div>
          </div>

          {/* Page navigation tabs */}
          <div className="tabs">
            <button
              className={currentPage === 'register' ? 'tab active' : 'tab'}
              onClick={() => handlePageChange('register')}
            >
              📝 Register
            </button>
            <button
              className={currentPage === 'appointments' ? 'tab active' : 'tab'}
              onClick={() => handlePageChange('appointments')}
            >
              📅 Appointments
            </button>
            <button
              className={currentPage === 'feedback' ? 'tab active' : 'tab'}
              onClick={() => handlePageChange('feedback')}
            >
              ⭐ Feedback
            </button>
          </div>

          <div className="form-container">
            <LLMFormContainer
              key={key}
              tools={tools}
              client={mockClient}
              systemMessage="You are a helpful assistant that collects information through forms. Based on the user's context, immediately show the most appropriate form."
              initialContext={getContextMessage(currentPage)}
              onToolSubmit={async (toolName, data) => {
                console.log(`Tool "${toolName}" submitted:`, data);
                setSubmissions((prev) => [...prev, { tool: toolName, data, timestamp: new Date() }]);
              }}
              onError={(error) => {
                console.error('Error:', error);
                alert(`Error: ${error.message}`);
              }}
            />
          </div>
        </div>

        {submissions.length > 0 && (
          <aside className="sidebar">
            <h3>📋 Form Submissions</h3>
            <p className="sidebar-note">Data submitted through forms:</p>
            <div className="submissions">
              {submissions.map((submission, idx) => (
                <div key={idx} className="submission">
                  <div className="submission-header">
                    <strong>{submission.tool}</strong>
                    <span className="submission-time">
                      {submission.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <pre className="submission-data">
                    {JSON.stringify(submission.data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

export default App;
