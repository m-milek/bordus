---
description: Code style rules for TypeScript and JavaScript
---

# Code Style

1. **Functions**: Always define functions as `const` (arrow functions). Never use the `function` keyword.
2. **Exports**: Prefer inline named exports. Do not use default exports.
3. **Component Props**: Every React component must have its own explicit `interface` named `<ComponentName>Props`, even if empty.
4. **Prop Destructuring**: Always destructure props directly in the component's function signature.
