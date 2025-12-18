import React, { useState } from 'react';
import { LLMFormConfig } from '../types';
import { useLLMForm } from '../hooks/useLLMForm';
import { ToolForm } from './ToolForm';

export interface LLMFormContainerProps extends LLMFormConfig {
  /**
   * Custom rendering for the conversation/messages
   */
  renderMessages?: (messages: LLMFormConfig['systemMessage'] extends string ? any[] : any[]) => React.ReactNode;

  /**
   * Custom rendering for the input field
   */
  renderInput?: (props: {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    isLoading: boolean;
  }) => React.ReactNode;

  /**
   * Additional class name for the container
   */
  className?: string;
}

export function LLMFormContainer({
  tools,
  client,
  systemMessage,
  onToolSubmit,
  onError,
  renderMessages,
  renderInput,
  className,
}: LLMFormContainerProps) {
  const [inputValue, setInputValue] = useState('');

  const { messages, currentTool, isLoading, error, sendMessage, submitTool, cancelTool } = useLLMForm({
    tools,
    client,
    systemMessage,
    onToolSubmit,
    onError,
  });

  const handleSendMessage = () => {
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Messages */}
      {renderMessages ? (
        renderMessages(messages)
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {messages
            .filter((m) => m.role !== 'tool')
            .map((message, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  backgroundColor: message.role === 'user' ? '#e3f2fd' : '#f5f5f5',
                  alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                }}
              >
                <strong>{message.role === 'user' ? 'You' : 'Assistant'}:</strong>
                <p style={{ margin: '0.25rem 0 0 0' }}>{message.content}</p>
              </div>
            ))}
        </div>
      )}

      {/* Error display */}
      {error && (
        <div
          style={{
            padding: '0.75rem',
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderRadius: '4px',
          }}
        >
          Error: {error.message}
        </div>
      )}

      {/* Tool form */}
      {currentTool && (
        <div
          style={{
            padding: '1rem',
            border: '2px solid #007bff',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa',
          }}
        >
          <ToolForm
            tool={currentTool}
            onSubmit={submitTool}
            onCancel={cancelTool}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Input */}
      {!currentTool &&
        (renderInput ? (
          renderInput({
            value: inputValue,
            onChange: setInputValue,
            onSubmit: handleSendMessage,
            isLoading,
          })
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '1rem',
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading || !inputValue.trim() ? 'not-allowed' : 'pointer',
                opacity: isLoading || !inputValue.trim() ? 0.6 : 1,
                fontSize: '1rem',
              }}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        ))}
    </div>
  );
}
