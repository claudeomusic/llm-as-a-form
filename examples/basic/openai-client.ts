import { LLMClient, Message, ToolDefinition } from '../../src/types';

/**
 * Example OpenAI client implementation
 * Requires: npm install openai
 */
export function createOpenAIClient(apiKey: string): LLMClient {
  return {
    async sendMessage(messages: Message[], tools: ToolDefinition[]) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: messages.map(m => {
            if (m.role === 'tool') {
              return {
                role: 'tool',
                tool_call_id: m.toolCallId,
                content: m.content,
              };
            }
            return {
              role: m.role,
              content: m.content,
              tool_calls: m.toolCalls?.map(tc => ({
                id: tc.id,
                type: 'function',
                function: {
                  name: tc.name,
                  arguments: JSON.stringify(tc.arguments),
                },
              })),
            };
          }),
          tools: tools.map(t => ({
            type: 'function',
            function: {
              name: t.name,
              description: t.description,
              parameters: {
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
            },
          })),
          tool_choice: 'auto',
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const choice = data.choices[0];

      return {
        role: 'assistant',
        content: choice.message.content || '',
        toolCalls: choice.message.tool_calls?.map(tc => ({
          id: tc.id,
          name: tc.function.name,
          arguments: JSON.parse(tc.function.arguments),
        })),
      };
    },
  };
}
