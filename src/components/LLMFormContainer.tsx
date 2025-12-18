import React from 'react';
import { LLMFormConfig } from '../types';
import { useLLMForm } from '../hooks/useLLMForm';
import { ToolForm } from './ToolForm';

export interface LLMFormContainerProps extends LLMFormConfig {
  /**
   * Initial context to send to the LLM (e.g., page URL, user intent, app state)
   */
  initialContext: string;

  /**
   * Custom rendering for assistant messages between forms
   */
  renderMessage?: (message: string) => React.ReactNode;

  /**
   * Custom rendering for the loading state
   */
  renderLoading?: () => React.ReactNode;

  /**
   * Additional class name for the container
   */
  className?: string;
}

export function LLMFormContainer({
  tools,
  client,
  systemMessage,
  initialContext,
  onToolSubmit,
  onError,
  renderMessage,
  renderLoading,
  className,
}: LLMFormContainerProps) {
  const { currentTool, currentMessage, isLoading, error, submitTool } = useLLMForm({
    tools,
    client,
    systemMessage,
    initialContext,
    onToolSubmit,
    onError,
  });

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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

      {/* Loading state */}
      {isLoading && !currentTool && (
        renderLoading ? (
          renderLoading()
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
            <p style={{ color: '#666' }}>Loading...</p>
          </div>
        )
      )}

      {/* Assistant message (shown between forms) */}
      {!isLoading && !currentTool && currentMessage && (
        renderMessage ? (
          renderMessage(currentMessage)
        ) : (
          <div
            style={{
              padding: '1.5rem',
              backgroundColor: '#f0f4ff',
              borderRadius: '8px',
              borderLeft: '4px solid #007bff',
            }}
          >
            <p style={{ margin: 0, lineHeight: 1.6 }}>{currentMessage}</p>
          </div>
        )
      )}

      {/* Tool form */}
      {currentTool && (
        <ToolForm
          tool={currentTool}
          onSubmit={submitTool}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
