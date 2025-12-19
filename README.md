<img width="1263" height="877" alt="Screenshot 2025-12-18 at 4 43 26 PM" src="https://github.com/user-attachments/assets/d1df48cb-d7f3-459a-ba13-f9d8bef46cf0" />


# llm-as-a-form

A React library that replaces chat interfaces with intelligent, dynamic forms. The LLM analyzes context and immediately presents the appropriate form—no chat required.

## Core Concept

Traditional LLM interfaces use chat. This library uses **forms** as the primary interaction method:

1. **User arrives with context** (URL `/register`, app state, user intent)
2. **LLM analyzes and selects form** (registration form, feedback form, etc.)
3. **User fills structured form fields** (name, email, etc.)
4. **LLM processes and responds** (shows completion or requests another form)

**No chat input. No back-and-forth messages. Just intelligent forms.**

## Why Forms Over Chat?

- **Structured data from the start**: No parsing unstructured text
- **Better UX for known tasks**: Users know exactly what information to provide
- **Type safety**: Validate inputs before submission
- **Accessibility**: Standard form controls work with screen readers
- **Mobile-friendly**: Native form inputs, dropdowns, and pickers

## Features

- **Form-first interaction**: LLM determines the right form based on context
- **Provider agnostic**: Bring your own LLM client (OpenAI, Anthropic, etc.)
- **Type-safe**: Built with TypeScript and Zod validation
- **React Hook Form**: Leverages react-hook-form for powerful form handling
- **Tool calling**: Uses native LLM tool/function calling to select forms
- **Customizable**: Render your own UI components or use the default ones

## Installation

```bash
npm install llm-as-a-form react react-dom react-hook-form zod
```

## Quick Start

```tsx
import { LLMFormContainer, LLMClient, Message, ToolDefinition } from 'llm-as-a-form';

// 1. Implement the LLM client interface
const myLLMClient: LLMClient = {
  async sendMessage(messages: Message[], tools: ToolDefinition[]) {
    // Call your LLM API (OpenAI, Anthropic, etc.)
    // Return the response with tool calls
  },
};

// 2. Define your forms as tools
const tools: ToolDefinition[] = [
  {
    name: 'registration_form',
    description: 'User registration and account creation',
    parameters: {
      name: { type: 'string', required: true, description: 'Full name' },
      email: { type: 'string', required: true, description: 'Email address' },
      country: {
        type: 'string',
        required: true,
        enum: ['USA', 'Canada', 'UK', 'Other']
      },
    },
  },
  // ... more forms
];

// 3. Use the component
function RegisterPage() {
  return (
    <LLMFormContainer
      tools={tools}
      client={myLLMClient}
      initialContext="User navigated to /register - they want to create an account"
      systemMessage="Show the appropriate registration form based on the context."
      onToolSubmit={async (toolName, data) => {
        // Handle form submission
        await saveToDatabase(data);
      }}
    />
  );
}
```

## How It Works

### 1. Component Mounts with Context

```tsx
<LLMFormContainer
  tools={tools}
  client={client}
  initialContext="User is on /appointments page"
  ...
/>
```

### 2. LLM Receives Context and Selects Form

The LLM gets:
- System message (your instructions)
- Initial context (page URL, user intent, app state)
- Available tools (your form definitions)

It responds with a tool call selecting the appropriate form.

### 3. Form is Rendered

The library automatically:
- Converts tool parameters to form fields
- Adds validation with Zod
- Renders with react-hook-form

### 4. User Submits, LLM Processes

After submission:
- Your `onToolSubmit` handler is called
- LLM receives the data and can:
  - Show a completion message
  - Request another form (multi-step flows)
  - Show validation errors

## Real-World Example

### Multi-Page App with Different Forms

```tsx
// App.tsx
function App() {
  const route = useRoute(); // /register, /appointments, /feedback

  const getContext = (route) => {
    switch (route) {
      case '/register':
        return 'User wants to create an account';
      case '/appointments':
        return 'User wants to schedule an appointment';
      case '/feedback':
        return 'User wants to leave feedback';
    }
  };

  return (
    <LLMFormContainer
      key={route} // Remount on route change
      tools={tools}
      client={client}
      initialContext={getContext(route)}
      systemMessage="Based on context, show the most appropriate form."
      onToolSubmit={handleSubmit}
    />
  );
}
```

### Multi-Step Form Flow

```tsx
const tools = [
  {
    name: 'collect_basic_info',
    description: 'Collect name and email',
    parameters: { /* ... */ },
  },
  {
    name: 'collect_preferences',
    description: 'Collect user preferences (shown after basic info)',
    parameters: { /* ... */ },
  },
];

// LLM can chain forms:
// 1. Shows collect_basic_info
// 2. User submits
// 3. LLM sees submission and requests collect_preferences
// 4. User submits
// 5. LLM shows completion message
```

## LLM Client Implementation

### OpenAI

```typescript
const openAIClient: LLMClient = {
  async sendMessage(messages, tools) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: messages.map(m => ({
          role: m.role === 'tool' ? 'tool' : m.role,
          content: m.content,
          tool_call_id: m.toolCallId,
          tool_calls: m.toolCalls?.map(tc => ({
            id: tc.id,
            type: 'function',
            function: {
              name: tc.name,
              arguments: JSON.stringify(tc.arguments),
            },
          })),
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
    const message = data.choices[0].message;

    return {
      role: 'assistant',
      content: message.content || '',
      toolCalls: message.tool_calls?.map(tc => ({
        id: tc.id,
        name: tc.function.name,
        arguments: JSON.parse(tc.function.arguments),
      })),
    };
  },
};
```

### Anthropic Claude

```typescript
const anthropicClient: LLMClient = {
  async sendMessage(messages, tools) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: messages
          .filter(m => m.role !== 'assistant' || m.content)
          .map(m => {
            if (m.role === 'tool') {
              return {
                role: 'user',
                content: [{
                  type: 'tool_result',
                  tool_use_id: m.toolCallId,
                  content: m.content,
                }],
              };
            }
            if (m.toolCalls) {
              return {
                role: 'assistant',
                content: [
                  ...(m.content ? [{ type: 'text', text: m.content }] : []),
                  ...m.toolCalls.map(tc => ({
                    type: 'tool_use',
                    id: tc.id,
                    name: tc.name,
                    input: tc.arguments,
                  })),
                ],
              };
            }
            return { role: m.role, content: m.content };
          }),
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
      }),
    });

    const data = await response.json();
    const textContent = data.content.find(c => c.type === 'text');
    const toolUse = data.content.find(c => c.type === 'tool_use');

    return {
      role: 'assistant',
      content: textContent?.text || '',
      toolCalls: toolUse ? [{
        id: toolUse.id,
        name: toolUse.name,
        arguments: toolUse.input,
      }] : undefined,
    };
  },
};
```

## API Reference

### `<LLMFormContainer>`

Main component for form-first LLM interaction.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `tools` | `ToolDefinition[]` | Yes | Available forms |
| `client` | `LLMClient` | Yes | Your LLM client implementation |
| `initialContext` | `string` | Yes | Context for the LLM (e.g., "User on /register page") |
| `systemMessage` | `string` | No | Instructions for the LLM |
| `onToolSubmit` | `(name, data) => void` | No | Called when form is submitted |
| `onError` | `(error) => void` | No | Error handler |
| `renderMessage` | `(msg) => ReactNode` | No | Custom message rendering |
| `renderLoading` | `() => ReactNode` | No | Custom loading state |

### `useLLMForm(config)`

Hook for building custom UIs.

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `currentTool` | `ToolDefinition \| null` | Currently selected form |
| `currentMessage` | `string \| null` | LLM's current message |
| `isLoading` | `boolean` | Loading state |
| `error` | `Error \| null` | Error state |
| `submitTool` | `(data) => Promise<void>` | Submit form data |

### Types

See [src/types/index.ts](src/types/index.ts) for complete TypeScript definitions.

## Examples

Check out the [demo/](demo/) directory for a working example with:
- Mock LLM client (no API keys needed)
- Three different forms
- Tab-based navigation
- Form submission tracking

To run the demo (requires Node.js 18+):

```bash
cd demo
npm install
npm run dev
```

## Use Cases

- **Multi-page forms**: Different forms for different pages
- **Onboarding flows**: Progressive information collection
- **Surveys and feedback**: Structured data collection
- **Booking systems**: Appointment scheduling
- **Configuration wizards**: Step-by-step setup
- **Data entry**: Guided form completion with validation

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT

---

**Built with**: React • TypeScript • Zod • React Hook Form
