import { LLMClient, Message, ToolDefinition } from '../../src/types';

/**
 * Example Anthropic client implementation
 * Requires: npm install @anthropic-ai/sdk
 */
export function createAnthropicClient(apiKey: string): LLMClient {
  return {
    async sendMessage(messages: Message[], tools: ToolDefinition[]) {
      // Convert our message format to Anthropic's format
      const anthropicMessages = messages
        .filter(m => m.role !== 'assistant' || m.content) // Filter out empty assistant messages
        .map(m => {
          if (m.role === 'tool') {
            return {
              role: 'user' as const,
              content: [
                {
                  type: 'tool_result' as const,
                  tool_use_id: m.toolCallId || 'unknown',
                  content: m.content,
                },
              ],
            };
          }

          if (m.role === 'assistant' && m.toolCalls) {
            return {
              role: 'assistant' as const,
              content: [
                ...(m.content ? [{ type: 'text' as const, text: m.content }] : []),
                ...m.toolCalls.map(tc => ({
                  type: 'tool_use' as const,
                  id: tc.id,
                  name: tc.name,
                  input: tc.arguments,
                })),
              ],
            };
          }

          return {
            role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
            content: m.content,
          };
        });

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages: anthropicMessages,
          tools: tools.map(t => ({
            name: t.name,
            description: t.description,
            input_schema: {
              type: 'object',
              properties: Object.fromEntries(
                Object.entries(t.parameters).map(([name, param]) => [
                  name,
                  {
                    type: param.type,
                    description: param.description,
                    enum: param.enum,
                  },
                ])
              ),
              required: Object.entries(t.parameters)
                .filter(([_, p]) => p.required)
                .map(([name]) => name),
            },
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Anthropic API error: ${error}`);
      }

      const data = await response.json();

      // Find text and tool_use in the response
      const textContent = data.content.find(c => c.type === 'text');
      const toolUse = data.content.find(c => c.type === 'tool_use');

      return {
        role: 'assistant',
        content: textContent?.text || '',
        toolCalls: toolUse
          ? [
              {
                id: toolUse.id,
                name: toolUse.name,
                arguments: toolUse.input,
              },
            ]
          : undefined,
      };
    },
  };
}
