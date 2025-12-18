# llm-as-a-form

A React library for interacting with LLMs through dynamic forms instead of chat interfaces. Instead of free-form chat, LLMs request structured information through typed forms based on tool/function calling.

## Features

- **Form-based LLM interaction**: LLMs request information through structured forms instead of chat messages
- **Provider agnostic**: Bring your own LLM client (OpenAI, Anthropic, etc.)
- **Type-safe**: Built with TypeScript and Zod validation
- **React Hook Form**: Leverages react-hook-form for powerful form handling
- **Tool calling**: Uses native LLM tool/function calling to determine which form to show
- **Customizable**: Render your own UI components or use the default ones

## Installation

```bash
npm install llm-as-a-form react react-dom react-hook-form zod
```

## Quick Start

```tsx
import { LLMFormContainer, LLMClient, Message, ToolDefinition } from 'llm-as-a-form';

// 1. Implement the LLM client interface for your provider
const openAIClient: LLMClient = {
  async sendMessage(messages: Message[], tools: ToolDefinition[]) {
    // Call your LLM API here
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
          tool_calls: m.toolCalls,
        })),
        tools: tools.map(t => ({
          type: 'function',
          function: {
            name: t.name,
            description: t.description,
            parameters: {
              type: 'object',
              properties: t.parameters,
              required: Object.entries(t.parameters)
                .filter(([_, p]) => p.required)
                .map(([name]) => name),
            },
          },
        })),
      }),
    });

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

// 2. Define your tools (forms)
const tools: ToolDefinition[] = [
  {
    name: 'collect_user_info',
    description: 'Collect basic user information',
    parameters: {
      name: {
        type: 'string',
        description: 'User\'s full name',
        required: true,
      },
      email: {
        type: 'string',
        description: 'User\'s email address',
        required: true,
      },
      age: {
        type: 'number',
        description: 'User\'s age',
        required: false,
      },
      country: {
        type: 'string',
        description: 'Country of residence',
        required: true,
        enum: ['USA', 'Canada', 'UK', 'Other'],
      },
    },
  },
  {
    name: 'schedule_meeting',
    description: 'Schedule a meeting',
    parameters: {
      title: {
        type: 'string',
        description: 'Meeting title',
        required: true,
      },
      date: {
        type: 'string',
        description: 'Meeting date (YYYY-MM-DD)',
        required: true,
      },
      duration: {
        type: 'number',
        description: 'Duration in minutes',
        required: true,
        enum: [15, 30, 60, 90],
      },
      notes: {
        type: 'string',
        description: 'Additional notes or agenda',
        required: false,
      },
    },
  },
];

// 3. Use the component
function App() {
  return (
    <LLMFormContainer
      tools={tools}
      client={openAIClient}
      systemMessage="Hello! I can help you with scheduling meetings or collecting user information. What would you like to do?"
      onToolSubmit={async (toolName, data) => {
        console.log(`Tool ${toolName} submitted with data:`, data);
        // Handle the form submission
      }}
      onError={(error) => {
        console.error('Error:', error);
      }}
    />
  );
}
```

## Core Concepts

### Tool Definitions

Tools define the forms that the LLM can request. Each tool has:

- `name`: Unique identifier
- `description`: What the form is for (helps the LLM decide when to use it)
- `parameters`: Field definitions with types, descriptions, and validation rules

### LLM Client

You implement the `LLMClient` interface to connect your preferred LLM provider:

```typescript
interface LLMClient {
  sendMessage(messages: Message[], tools: ToolDefinition[]): Promise<Message>;
}
```

This gives you complete control over:
- API authentication
- Model selection
- Request/response formatting
- Error handling
- Streaming (if desired)

### Form Field Types

The library automatically converts tool parameters to appropriate form fields:

| Parameter Type | Form Field | Notes |
|---------------|------------|-------|
| `string` | Text input | Textarea if description > 100 chars |
| `string` with `enum` | Select dropdown | |
| `number` | Number input | |
| `number` with `enum` | Select dropdown | |
| `boolean` | Checkbox | |
| `array` | Not yet supported | Coming soon |
| `object` | Not yet supported | Coming soon |

## Advanced Usage

### Using the Hook Directly

For more control, use the `useLLMForm` hook:

```tsx
import { useLLMForm } from 'llm-as-a-form';

function CustomLLMForm() {
  const {
    messages,
    currentTool,
    isLoading,
    error,
    sendMessage,
    submitTool,
    cancelTool,
    reset,
  } = useLLMForm({
    tools,
    client,
    systemMessage: 'How can I help you?',
    onToolSubmit: async (name, data) => {
      // Handle submission
    },
  });

  // Build your own UI
  return (
    <div>
      {/* Your custom implementation */}
    </div>
  );
}
```

### Custom Rendering

Customize the UI with render props:

```tsx
<LLMFormContainer
  tools={tools}
  client={client}
  renderMessages={(messages) => (
    <div className="custom-messages">
      {messages.map((msg, i) => (
        <CustomMessage key={i} message={msg} />
      ))}
    </div>
  )}
  renderInput={({ value, onChange, onSubmit, isLoading }) => (
    <CustomInput
      value={value}
      onChange={onChange}
      onSubmit={onSubmit}
      disabled={isLoading}
    />
  )}
/>
```

### Standalone Tool Form

Use the `ToolForm` component independently:

```tsx
import { ToolForm } from 'llm-as-a-form';

function MyForm() {
  return (
    <ToolForm
      tool={myToolDefinition}
      onSubmit={(data) => {
        console.log('Form submitted:', data);
      }}
      onCancel={() => {
        console.log('Form cancelled');
      }}
    />
  );
}
```

## Examples

### Anthropic Claude

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropicClient: LLMClient = {
  async sendMessage(messages, tools) {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
      tools: tools.map(t => ({
        name: t.name,
        description: t.description,
        input_schema: {
          type: 'object',
          properties: t.parameters,
          required: Object.entries(t.parameters)
            .filter(([_, p]) => p.required)
            .map(([name]) => name),
        },
      })),
    });

    const toolUse = response.content.find(c => c.type === 'tool_use');

    return {
      role: 'assistant',
      content: response.content.find(c => c.type === 'text')?.text || '',
      toolCalls: toolUse ? [{
        id: toolUse.id,
        name: toolUse.name,
        arguments: toolUse.input,
      }] : undefined,
    };
  },
};
```

### Form Validation

Use Zod schemas for validation:

```tsx
import { toolToZodSchema } from 'llm-as-a-form';

const schema = toolToZodSchema(myTool);
// This automatically creates a Zod schema from your tool definition
```

## API Reference

### Components

#### `LLMFormContainer`

Main component that handles the full LLM interaction flow.

**Props:**
- `tools`: Array of tool definitions
- `client`: LLM client implementation
- `systemMessage?`: Initial message from the assistant
- `onToolSubmit?`: Callback when a form is submitted
- `onError?`: Error handler
- `renderMessages?`: Custom message rendering
- `renderInput?`: Custom input rendering
- `className?`: CSS class name

#### `ToolForm`

Renders a single tool as a form.

**Props:**
- `tool`: Tool definition
- `onSubmit`: Form submission handler
- `onCancel?`: Cancel handler
- `isLoading?`: Loading state

### Hooks

#### `useLLMForm(config)`

Hook for managing LLM form state.

**Returns:**
- `messages`: Conversation history
- `currentTool`: Currently requested tool/form
- `isLoading`: Loading state
- `error`: Error state
- `sendMessage(text)`: Send a user message
- `submitTool(data)`: Submit the current form
- `cancelTool()`: Cancel the current form
- `reset()`: Reset the conversation

### Types

See the [TypeScript definitions](src/types/index.ts) for complete type information.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT
