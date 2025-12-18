# Basic Example

This example demonstrates how to use `llm-as-a-form` with different LLM providers.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set your API key:
```bash
# For OpenAI
export OPENAI_API_KEY=your_key_here

# For Anthropic
export ANTHROPIC_API_KEY=your_key_here
```

3. Run the example (when you build your app):
```bash
npm start
```

## Files

- `openai-client.ts` - Example OpenAI client implementation
- `anthropic-client.ts` - Example Anthropic client implementation
- `tools.ts` - Example tool definitions
- `App.tsx` - Example React app

## What it demonstrates

- How to implement the `LLMClient` interface for different providers
- How to define tools that become forms
- How to handle form submissions
- Basic conversation flow with form interactions
