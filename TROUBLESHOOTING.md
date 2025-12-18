# Troubleshooting Guide

## React Hook Form Error: "Cannot read properties of null (reading 'useRef')"

This error typically occurs when:

1. **Multiple React instances are loaded** - React Hook Form can't access the correct React context
2. **React version mismatch** - The library and demo are using different React versions

### Solutions

#### 1. Restart the Dev Server

After updating `demo/vite.config.ts` with the `dedupe` configuration, you must restart:

```bash
# Stop the server (Ctrl+C)
# Then restart:
cd demo
npm run dev
```

#### 2. Clear Vite Cache

```bash
cd demo
rm -rf node_modules/.vite
npm run dev
```

#### 3. Reinstall Dependencies

```bash
cd demo
rm -rf node_modules package-lock.json
npm install
npm run dev
```

#### 4. Verify React Deduplication

The `demo/vite.config.ts` should include:

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'llm-as-a-form': resolve(__dirname, '../src'),
    },
    dedupe: ['react', 'react-dom'], // This is critical
  },
});
```

#### 5. Check Node Version

This demo requires Node.js 18+. Check your version:

```bash
node --version
```

If you see v16.x.x, upgrade:

```bash
# Using nvm
nvm install 20
nvm use 20

# Or using Homebrew
brew upgrade node
```

## Other Common Issues

### TypeScript Errors

If you see TypeScript errors related to types:

```bash
cd demo
npm install --save-dev @types/react @types/react-dom
```

### Zod Validation Errors

If forms aren't validating properly, check that:
1. Tool parameters have correct `required` flags
2. Zod schema generation in `src/utils/schema.ts` handles all parameter types

### Form Not Showing

If the LLM response doesn't show a form:

1. Check that the mock client is returning `toolCalls` in the response
2. Verify tool names match between tool definitions and LLM responses
3. Check browser console for errors

### Loading State Stuck

If the component stays in loading state:

1. Check that `initialContext` is provided to `LLMFormContainer`
2. Verify the LLM client is resolving (not rejecting)
3. Check network tab for API call failures (if using real LLM)

## Debug Mode

To see what's happening, add console logs to the mock client:

```typescript
// demo/src/mockLLMClient.ts
async sendMessage(messages, tools) {
  console.log('Messages:', messages);
  console.log('Tools:', tools);

  const response = { /* ... */ };
  console.log('Response:', response);

  return response;
}
```

## Still Having Issues?

1. Check the browser console for specific error messages
2. Verify all dependencies are installed: `npm list` in both root and demo
3. Try the examples in `/examples/basic/` which have different setup
4. Open an issue at https://github.com/claudeomusic/llm-as-a-form/issues with:
   - Error message
   - Node version
   - Browser and version
   - Steps to reproduce
