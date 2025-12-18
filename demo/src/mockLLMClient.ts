import { LLMClient, Message, ToolDefinition } from 'llm-as-a-form';

/**
 * Mock LLM client that simulates tool calling behavior
 * This allows testing without requiring actual API keys
 */
export function createMockLLMClient(): LLMClient {
  return {
    async sendMessage(messages: Message[], tools: ToolDefinition[]): Promise<Message> {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get the last message
      const lastMessage = messages[messages.length - 1];

      // If this is a tool result, acknowledge it and possibly request another form
      if (lastMessage.role === 'tool') {
        const toolData = JSON.parse(lastMessage.content);

        if (lastMessage.name === 'collect_user_info') {
          return {
            role: 'assistant',
            content: `Thank you, ${toolData.name}! Your information has been saved. ${toolData.subscribe ? "You've been subscribed to our newsletter." : ""} Everything is complete!`,
          };
        } else if (lastMessage.name === 'schedule_appointment') {
          return {
            role: 'assistant',
            content: `Perfect! Your appointment "${toolData.title}" has been scheduled for ${toolData.date} at ${toolData.time} (${toolData.duration} minutes). You'll receive a confirmation email shortly.`,
          };
        } else if (lastMessage.name === 'provide_feedback') {
          return {
            role: 'assistant',
            content: `Thank you for your ${toolData.rating}-star rating! We truly appreciate your feedback about our ${toolData.category}. ${toolData.wouldRecommend ? "We're glad you would recommend us to others!" : "We'll work hard to improve."}`,
          };
        }
      }

      const userMessage = lastMessage.content.toLowerCase();

      // Determine which tool to call based on context
      if (userMessage.includes('register') || userMessage.includes('sign up') || userMessage.includes('/register')) {
        return {
          role: 'assistant',
          content: "Welcome! Let's get you registered. Please fill out your information below:",
          toolCalls: [
            {
              id: `call_${Date.now()}`,
              name: 'collect_user_info',
              arguments: {},
            },
          ],
        };
      }

      if (userMessage.includes('schedule') || userMessage.includes('appointment') || userMessage.includes('/appointments')) {
        return {
          role: 'assistant',
          content: "Let's schedule your appointment. Please provide the details:",
          toolCalls: [
            {
              id: `call_${Date.now()}`,
              name: 'schedule_appointment',
              arguments: {},
            },
          ],
        };
      }

      if (userMessage.includes('feedback') || userMessage.includes('review') || userMessage.includes('/feedback')) {
        return {
          role: 'assistant',
          content: "We'd love to hear your feedback! Please fill out the form:",
          toolCalls: [
            {
              id: `call_${Date.now()}`,
              name: 'provide_feedback',
              arguments: {},
            },
          ],
        };
      }

      // Default: Show info collection form
      return {
        role: 'assistant',
        content: "Welcome! Let's start by collecting some basic information:",
        toolCalls: [
          {
            id: `call_${Date.now()}`,
            name: 'collect_user_info',
            arguments: {},
          },
        ],
      };
    },
  };
}
