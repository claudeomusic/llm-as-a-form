import React from 'react';
import { LLMFormContainer } from '../../src';
import { createOpenAIClient } from './openai-client';
import { createAnthropicClient } from './anthropic-client';
import { tools } from './tools';

// Choose your provider
const PROVIDER = 'openai'; // or 'anthropic'

const client =
  PROVIDER === 'openai'
    ? createOpenAIClient(process.env.OPENAI_API_KEY || '')
    : createAnthropicClient(process.env.ANTHROPIC_API_KEY || '');

export function App() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>LLM as a Form - Example</h1>
      <p>
        This example demonstrates form-based LLM interaction. Instead of free-form chat,
        the LLM requests specific information through structured forms.
      </p>

      <div style={{ marginTop: '2rem' }}>
        <LLMFormContainer
          tools={tools}
          client={client}
          systemMessage="Hello! I can help you with collecting information, scheduling appointments, or gathering feedback. What would you like to do today?"
          onToolSubmit={async (toolName, data) => {
            console.log(`Form "${toolName}" submitted:`, data);
            // In a real app, you would:
            // - Save to database
            // - Send to an API
            // - Update application state
            // etc.

            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 500));
          }}
          onError={(error) => {
            console.error('Error occurred:', error);
            alert(`Error: ${error.message}`);
          }}
        />
      </div>

      <div style={{ marginTop: '3rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Tips:</h3>
        <ul>
          <li>Try asking: "I'd like to schedule an appointment"</li>
          <li>Try asking: "Can you collect my information?"</li>
          <li>Try asking: "I want to leave feedback"</li>
          <li>The LLM will automatically show the appropriate form</li>
          <li>All form submissions are logged to the console</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
