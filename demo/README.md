# Demo Application

This is a working demo of the `llm-as-a-form` library with a mock LLM client.

## Prerequisites

**Important:** You need Node.js 18+ to run this demo. Your current version is 16.18.0.

### Upgrade Node.js

Choose one of these methods:

1. **Using nvm (recommended)**
   ```bash
   nvm install 20
   nvm use 20
   ```

2. **Using Homebrew (macOS)**
   ```bash
   brew upgrade node
   ```

3. **Download from nodejs.org**
   Visit https://nodejs.org/ and download the latest LTS version

## Running the Demo

Once you have Node.js 18+:

```bash
cd demo
npm install
npm run dev
```

Then open your browser to the URL shown (usually http://localhost:5173)

**If you see a React Hook Form error**, make sure to:
1. Stop the dev server (Ctrl+C)
2. Clear the cache: `rm -rf node_modules/.vite`
3. Restart: `npm run dev`

See [../TROUBLESHOOTING.md](../TROUBLESHOOTING.md) for more help.

## What the Demo Shows

- **Mock LLM Client**: Simulates AI responses without requiring API keys
- **Three Different Forms**:
  1. User Information Collection
  2. Appointment Scheduling
  3. Feedback Form
- **Real-time Form Submissions**: See submitted data in the sidebar
- **Dynamic Form Selection**: The "AI" chooses which form to show based on your message

## Try These Prompts

- "I'd like to register"
- "Schedule an appointment"
- "I want to leave feedback"

## Architecture

- Uses the library directly from `../src` (no build step needed)
- Mock LLM client simulates tool calling behavior
- Shows how the library converts tool definitions into forms
- Demonstrates the complete interaction flow

## Alternative: Test Without Running Dev Server

If you can't upgrade Node.js right now, you can still:

1. Review the code in `/demo/src/` to see how the library is used
2. Check `/demo/src/mockLLMClient.ts` to understand the LLM client interface
3. Look at `/demo/src/App.tsx` to see the integration
4. Build on a machine with Node.js 18+ or use a cloud IDE (CodeSandbox, StackBlitz)
