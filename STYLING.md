# Styling Guide

The library provides **zero styling** by default - you have complete control over how forms look.

## CSS Class Names

All components use predictable CSS class names that you can target:

### Container

- `.llm-form-container` - Main container
- `.llm-form-error-container` - Error message container
- `.llm-form-loading` - Loading state container
- `.llm-form-loading-icon` - Loading icon
- `.llm-form-loading-text` - Loading text
- `.llm-form-message` - Assistant message container
- `.llm-form-message-text` - Assistant message text

### Form

- `.llm-form` - Form element
- `.llm-form-title` - Form title (h2)
- `.llm-form-description` - Form description
- `.llm-form-field` - Field container
- `.llm-form-label` - Field label
- `.llm-form-required` - Required indicator (*)
- `.llm-form-help` - Help text (small)
- `.llm-form-error` - Validation error message

### Input Elements

- `.llm-form-input` - Text/number inputs
- `.llm-form-select` - Select dropdowns
- `.llm-form-textarea` - Textarea
- `.llm-form-checkbox` - Checkboxes

### Actions

- `.llm-form-actions` - Button container
- `.llm-form-submit` - Submit button
- `.llm-form-cancel` - Cancel button

## Styling Options

### Option 1: Use Default Styles

Import the optional default stylesheet:

```tsx
import 'llm-as-a-form/styles.css';
```

### Option 2: Write Your Own CSS

```css
/* custom.css */
.llm-form {
  max-width: 600px;
  margin: 0 auto;
}

.llm-form-input,
.llm-form-select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
}

.llm-form-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
}
```

### Option 3: Use Tailwind CSS

Style components inline or with custom classes:

```tsx
<LLMFormContainer
  className="max-w-2xl mx-auto p-6"
  // ... other props
/>
```

Then target form elements:

```css
/* In your globals.css */
@layer components {
  .llm-form-input,
  .llm-form-select,
  .llm-form-textarea {
    @apply w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500;
  }

  .llm-form-submit {
    @apply px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700;
  }

  .llm-form-error {
    @apply text-red-600 text-sm mt-1;
  }
}
```

### Option 4: Use CSS-in-JS

With styled-components, emotion, etc:

```tsx
import styled from 'styled-components';
import { LLMFormContainer } from 'llm-as-a-form';

const StyledFormContainer = styled.div`
  .llm-form {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .llm-form-input,
  .llm-form-select {
    border: 1px solid #d1d5db;
    transition: border-color 0.2s;

    &:focus {
      border-color: #3b82f6;
      outline: none;
    }
  }

  .llm-form-submit {
    background: #3b82f6;
    color: white;
    font-weight: 600;
    transition: background 0.2s;

    &:hover:not(:disabled) {
      background: #2563eb;
    }
  }
`;

function MyApp() {
  return (
    <StyledFormContainer>
      <LLMFormContainer {...props} />
    </StyledFormContainer>
  );
}
```

### Option 5: CSS Modules

```tsx
import styles from './MyForm.module.css';

<LLMFormContainer className={styles.container} />
```

```css
/* MyForm.module.css */
.container :global(.llm-form) {
  background: var(--surface-color);
}

.container :global(.llm-form-input) {
  border-color: var(--border-color);
}
```

## Custom Rendering

For complete control, use render props:

```tsx
<LLMFormContainer
  renderMessage={(message) => (
    <div className="my-custom-message-box">
      <Icon name="assistant" />
      <p>{message}</p>
    </div>
  )}
  renderLoading={() => (
    <div className="my-spinner">
      <Spinner />
    </div>
  )}
/>
```

## Example Themes

### Minimal Theme

```css
.llm-form-input,
.llm-form-select,
.llm-form-textarea {
  border: none;
  border-bottom: 1px solid #e0e0e0;
  border-radius: 0;
  padding: 8px 0;
}

.llm-form-submit {
  background: black;
  color: white;
  border-radius: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}
```

### Neumorphic Theme

```css
.llm-form {
  background: #e0e5ec;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 9px 9px 16px rgba(163, 177, 198, 0.6),
    -9px -9px 16px rgba(255, 255, 255, 0.5);
}

.llm-form-input,
.llm-form-select {
  background: #e0e5ec;
  border: none;
  box-shadow: inset 2px 2px 5px rgba(163, 177, 198, 0.6),
    inset -3px -3px 7px rgba(255, 255, 255, 0.5);
}
```

### Glassmorphism Theme

```css
.llm-form {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
}

.llm-form-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
}
```

## Best Practices

1. **Use CSS variables** for easy theming:
   ```css
   :root {
     --form-primary-color: #007bff;
     --form-border-radius: 8px;
   }
   ```

2. **Respect user preferences**:
   ```css
   @media (prefers-color-scheme: dark) {
     .llm-form-input {
       background: #2d2d2d;
       color: white;
     }
   }
   ```

3. **Consider accessibility**:
   ```css
   .llm-form-input:focus {
     outline: 2px solid var(--focus-color);
     outline-offset: 2px;
   }
   ```

4. **Add transitions**:
   ```css
   .llm-form-input {
     transition: border-color 0.2s, box-shadow 0.2s;
   }
   ```
