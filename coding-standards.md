# Coding Standards

This document defines coding rules and conventions for AI agents working on this codebase.
These rules should be strictly followed to maintain code consistency and quality.

## Table of Contents

- [General Principles](#general-principles)
- [Formatting](#formatting)
- [Naming Conventions](#naming-conventions)
- [Function Patterns](#function-patterns)
- [Component Structure](#component-structure)
- [Index Files](#index-files)
- [Styling](#styling)
- [JSX/TSX Patterns](#jsxtsx-patterns)
- [Type Definitions](#type-definitions)
- [Imports and Exports](#imports-and-exports)
- [State Management](#state-management)
- [Constants](#constants)
- [Comments](#comments)

## General Principles

- Follow the official Airbnb style guides:
  - [JavaScript](https://github.com/airbnb/javascript)
  - [React](https://github.com/airbnb/javascript/tree/master/react)
- Use functional components only
- Always strive to fix code according to linter messages rather than disabling rules
- Move additional logic out of components: either to utils or `assets.ts` in the component's folder

## Formatting

- Use 2 spaces for indentation
- Use single quotes for strings and double quotes for JSX props
- Always add an empty line at the end of the file
- Do not use 2 empty lines in a row
- Maximum line length: **160 characters** (comments, URLs, strings, and template literals are excluded)

## Naming Conventions

### Types and Interfaces

- Strive to use types as much as possible over interfaces
- Add symbol `T` before the type/interface name
- Import and export types/interfaces separately from other variables

```typescript
import React, { useState } from 'react';
import type { FC } from 'react';

type TAppProps = {
  // ...
};

const App: FC<TAppProps> = props => {
  // ...
};

export type { TAppProps };
export { App };
```

### Variables

- Use camelCase notation for all variables
- Use proper abbreviations:
  - `taskID` (not `taskId`)
  - `imageURL` (not `imageUrl`)
  - `JSONResult` (not `JsonResult`)
  - `PDFReader` (not `PdfReader`)

### Booleans

- Prefix boolean variables, props, and functions that return a boolean with `is`, `has`, `should`, or `can`
  - `isVisible`, `hasError`, `shouldRender`, `canEdit`
- Avoid bare adjectives or nouns for booleans (`visible`, `disabled`) — prefix them instead (`isVisible`, `isDisabled`)

### Methods

- Methods and functions must be named using pattern: verb + noun
  - `createSchema()`
  - `makeRequest()`
- Avoid using the verb `get` for every case
- Callbacks for all events must be named with prefix `on`:
  - `onClick()`
  - `onChange()`
- Do not use prefix `handle`

### Arrow Functions — Parentheses. IMPORTANT!

Rule: `as-needed`. ESLint (`@stylistic/arrow-parens`) and Prettier (`arrowParens: "avoid"`) enforce this together.

- Single parameter → **no parentheses**, regardless of block or expression body (Prettier's `arrowParens` option has no way to distinguish block-body from expression-body, so both tools apply the same rule to both cases)
- Multiple parameters → always parentheses

✅ **Correct:**

```typescript
const doubled = items.map(item => item * 2);
const doubled = items.map(item => {
  return item * 2;
});
const sum = items.reduce((acc, item) => acc + item, 0); // multiple params — parens
```

❌ **Incorrect:**

```typescript
const doubled = items.map(item => item * 2); // unnecessary parens
const doubled = items.map(item => {
  return item * 2;
});
```

### Components

- Use functional components only
- Each component must be inside its own folder, containing at least:
  - `index.ts` - for exports
  - `MyComponent.tsx` - component implementation
  - `MyComponent.module.css` - styles for component (optional)
  - `MyComponent.props.ts` - props definitions (optional)
  - `assets.ts` - additional logic (optional)

> IMPORTANT NOTE: file with component implementation must not contain any type declaration.
> All must be put into `MyComponent.props.ts`

### Hooks

- Each custom hook must be inside its own folder, containing at least:
  - `index.ts` - for exports
  - `useMyHook.ts` - hook implementation
  - `types.ts` - the hook's return type (if it returns a value) and any types used internally by the hook

> IMPORTANT NOTE: file with hook implementation must not contain any type declaration.
> All must be put into `types.ts`

## Function Patterns

### Guard Clauses

- Prefer early `return` / `continue` / `break` for validation and edge cases over nesting the rest of the function inside an `if`
- Keep the main logic of the function at the lowest indentation level

✅ **Correct:**

```typescript
function processItem(item: TItem | null): void {
  if (!item) {
    return;
  }

  if (!item.isActive) {
    return;
  }

  saveItem(item);
}
```

❌ **Incorrect:**

```typescript
function processItem(item: TItem | null): void {
  if (item) {
    if (item.isActive) {
      saveItem(item);
    }
  }
}
```

## Index Files

**CRITICAL**: Index files must use `import` and `export` statements instead of re-export syntax.

✅ **Correct:**

```typescript
import { CurrentDomain } from './CurrentDomain';

export { CurrentDomain };
```

❌ **Incorrect:**

```typescript
export { CurrentDomain } from './CurrentDomain';
```

This pattern ensures better code navigation and IDE support.

## Styling

### No Inline Styles. IMPORTANT!

- Never use inline styles (`style={{ ... }}`) for values that could be static — use CSS classes and accordant styles in `*.module.css` file instead
- Inline styles are allowed **only** when the value is genuinely dynamic and the same effect can't be achieved with a static class — for example, a color or position computed from data at render time
- When falling back to inline styles for a dynamic value, prefer setting a CSS custom property and consuming it from the module, so layout and typography still live in the `*.module.css` file

✅ **Correct — static styling in CSS module:**

```typescript
import s from './Component.module.css';

<div className={s.container}>
  {/* content */}
</div>
```

✅ **Correct — genuinely dynamic value via a CSS custom property:**

```typescript
import s from './Shape.module.css';

<div className={s.shape} style={{ '--stroke-color': shape.style.stroke }}>
  {/* content */}
</div>
```

❌ **Incorrect — static value that should be a class:**

```typescript
<div style={{ padding: '10px', color: 'red' }}>
  {/* content */}
</div>
```

## JSX/TSX Patterns

### Props Destructuring

- Destructure props in the function argument when it all fits in one line and there are no default values
- Move destructuring inside the component body when props span multiple lines or when using default values

✅ **Correct — fits in one line, no defaults (destructure in signature):**

```typescript
const Component: FC<TProps> = ({ title, onClick }) => {
  return (
    <Flex onClick={onClick}>
      {title}
    </Flex>
  );
};
```

✅ **Correct — many props / multiline (destructure inside):**

```typescript
const Component: FC<TProps> = (props) => {
  const { title, onClick, isDisabled, variant, size } = props;

  return (
    <Flex onClick={onClick}>
      {title}
    </Flex>
  );
};
```

✅ **Correct — default values (always in signature):**

```typescript
const Component: FC<TProps> = ({ title, onClick, isDisabled = false }) => {
  return (
    <Flex onClick={onClick}>
      {title}
    </Flex>
  );
};
```

❌ **Incorrect — many props in signature:**

```typescript
const Component: FC<TProps> = ({
  title,
  onClick,
  isDisabled,
  variant,
  size,
}) => {
  return <Flex>{title}</Flex>;
};
```

### No Ternary Operators in JSX/TSX. Important!!!

- Extract ternary logic (`? :`) before the return statement
- For a single conditional block, use `&&`
- For two-branch conditional rendering (what a ternary would otherwise do), use a pair of `&&` conditions — one positive, one negated — instead

✅ **Correct - Simple conditional with &&:**

```typescript
const Component: FC<TProps> = ({ isVisible }) => {
  return (
    <Flex>
      {isVisible && (
        <Content />
      )}
    </Flex>
  );
};
```

✅ **Correct - Two-branch rendering with a pair of && conditions:**

```typescript
const Component: FC<TProps> = ({ isActive }) => {
  return (
    <Flex>
      {isActive && (
        <ActiveContent />
      )}
      {!isActive && (
        <InactiveContent />
      )}
    </Flex>
  );
};
```

❌ **Incorrect - Ternary in JSX:**

```typescript
const Component: FC<TProps> = ({ isActive }) => {
  return (
    <Flex>
      {isActive ? <ActiveContent /> : <InactiveContent />}
    </Flex>
  );
};
```

### No Inline Callbacks

- Do not use inline callbacks (arrow functions or anonymous functions) directly in JSX props
- Extract callback functions before the return statement

✅ **Correct:**

```typescript
const Component: FC<TProps> = () => {
  const onClick = () => {
    // handle click
  };

  return (
    <Button onClick={onClick} />
  );
};
```

❌ **Incorrect:**

```typescript
const Component: FC<TProps> = () => {
  return (
    <Button onClick={() => { /* handle click */ }} />
  );
};
```

### Extract Values Before Render

- Extract computed values, conditionals, and complex expressions before the return statement
- This improves readability and performance

✅ **Correct:**

```typescript
const Component: FC<TProps> = ({ user, items }) => {
  const userName = user?.name ?? 'Unknown';
  const itemCount = items.length;
  const hasItems = itemCount > 0;

  return (
    <Flex>
      <Text>{userName}</Text>
      {hasItems && <ItemList items={items} />}
    </Flex>
  );
};
```

❌ **Incorrect:**

```typescript
const Component: FC<TProps> = ({ user, items }) => {
  return (
    <Flex>
      <Text>{user?.name ?? 'Unknown'}</Text>
      {items.length > 0 && <ItemList items={items} />}
    </Flex>
  );
};
```

### Object Destructuring — Consistency

ESLint enforces `ObjectPattern: { consistent: true }` — if any property is on a new line, **all** must be on separate lines.

✅ **Correct:**

```typescript
const { id, name } = user; // all on one line

const {
  // all on separate lines
  id,
  name,
  email,
  createdAt,
} = user;
```

❌ **Incorrect — mixed:**

```typescript
const { id, name } = user;
```

### Always Wrap Condition Body with Curly Braces

- Always use curly braces `{}` for if/else statement bodies, even for single statements
- This prevents bugs and improves code consistency

✅ **Correct:**

```typescript
if (condition) {
  return value;
}

if (isActive) {
  setState(true);
} else {
  setState(false);
}

if (count > 0) {
  processItems();
}
```

❌ **Incorrect:**

```typescript
if (condition) return value;

if (isActive) setState(true);
else setState(false);

if (count > 0) processItems();
```

### Maximum JSX Nesting Depth

- Avoid nesting more than 3 levels of conditional rendering or `.map()` calls inside a single `return`
- When a nested block goes deeper, extract it into its own component

✅ **Correct — deep case extracted into its own component:**

```typescript
const Row: FC<TRowProps> = ({ item }) => {
  return (
    <Flex>
      {item.tags.map((tag) => (
        <Tag key={tag.id} tag={tag} />
      ))}
    </Flex>
  );
};

const List: FC<TListProps> = ({ items }) => {
  return (
    <Flex direction="column">
      {items.map((item) => (
        <Row key={item.id} item={item} />
      ))}
    </Flex>
  );
};
```

❌ **Incorrect — everything nested in one component:**

```typescript
const List: FC<TListProps> = ({ items }) => {
  return (
    <Flex direction="column">
      {items.map((item) => (
        <Flex key={item.id}>
          {item.tags.map((tag) => (
            <Flex key={tag.id}>
              {tag.isActive && <Badge tag={tag} />}
            </Flex>
          ))}
        </Flex>
      ))}
    </Flex>
  );
};
```

### Prop Order

Order JSX props by role, top to bottom:

1. `ref` / `key`
2. Identity (`id`, data props like `shape`, `item`, `value`)
3. Behavior (event handlers: `onClick`, `onChange`, ...)
4. Presentation (`style`, `className`, `variant`, `size`, ...)

✅ **Correct:**

```typescript
<Rect
  ref={setNodeRef}
  id={shape.id}
  value={shape.value}
  onClick={onSelect}
  onDragEnd={onDragEnd}
  variant="solid"
  style={style}
/>
```

## Type Definitions

- Types must be prefixed with `T`
- Import types separately using `import type`
- Export types separately from other exports

```typescript
import type { FC } from 'react';
import type { TUser } from 'types/users/users.types';

type TComponentProps = {
  user: TUser;
};

export type { TComponentProps };
```

### No Inline Type Annotations. IMPORTANT!

- Never annotate types inline inside function parameters or callbacks
- Extract the type to a named type in the relevant `*.props.ts` file

✅ **Correct:**

```typescript
// SankeyChart.props.ts
type TSankeyNode = Omit<SankeyNodeDatum<DefaultNode, DefaultLink>, 'color' | 'label'>;

// SankeyChart.tsx
const renderNode = (node: TSankeyNode) => {
  /* ... */
};
```

❌ **Incorrect:**

```typescript
const renderNode = (node: Omit<SankeyNodeDatum<DefaultNode, DefaultLink>, 'color' | 'label'>) => {
  /* ... */
};
```

### No Nested Type Definitions. IMPORTANT!

- Never nest object type literals inside another type
- Create a dedicated named type for each nested shape

✅ **Correct:**

```typescript
type TSankeyData = {
  nodes: DefaultNode[];
  links: DefaultLink[];
};

type TChartProps = {
  data: TSankeyData;
};
```

❌ **Incorrect:**

```typescript
type TChartProps = {
  data: {
    nodes: DefaultNode[];
    links: DefaultLink[];
  };
};
```

## Imports and Exports

### Imports

- Use absolute paths for imports
- **Always** put an empty line between every import group — ESLint enforces `newlines-between: 'always'`
- Named imports on one line when they fit; multi-line only when the list actually wraps

**Import group order** (each group separated by an empty line):

1. `react` — React and `import type` from react
2. External packages (npm)
3. `~/types/**` — global shared type files
4. `~/enums/**`
5. `~/api/**`
6. `~/utils/**`
7. `~/lib/**`
8. `~/hooks/**`
9. `~/stores/**`
10. `~/components/**`
11. `~/containers/**` / `~/modals/**` / `~/pages/**`
12. Local sibling types: `./*.props`, `./*.types`, `./*.payloads` — **before** local styles
13. Local styles: `./*.module.css`

```typescript
import React, { useState } from 'react';
import type { FC } from 'react';

import { Text } from '@radix-ui/themes';

import type { TUser } from '~/types/users/users.types';

import { EModals } from '~/enums/modals';

import { stageUtils } from '~/utils/stageUtils';

import { ModalsManager } from '~/lib/ModalsManager';

import { stagesStore, stagesSelectors } from '~/stores/stages';

import { Button } from '~/components/Button';

import type { TItemProps } from './Item.props';

import s from './Item.module.css';
```

**Multi-line named imports** — only when they actually span multiple lines:

```typescript
// ✅ short list — one line
import { useState } from 'react';

// ✅ long list — multi-line with trailing comma
import { useState, useEffect, useCallback, useMemo } from 'react';
```

### Exports

- Always use named exports
- Default exports are allowed only for components that can be loaded lazily (via `React.lazy`)
- Exports must be the last statement of the file
- Separate type exports from value exports
- A file can declare as many local variables, functions, or types as needed — but only the ones that are part of the module's public API should appear in the final `export` statement. This turns the export statement into a summary of the file's public API: reading it tells you exactly what the module exposes, without reading the rest of the file.

✅ **Correct — internal helpers stay unexported, only the public API is exported:**

```typescript
const DEFAULT_PADDING = 8;

function computeOffset(value: number): number {
  return value + DEFAULT_PADDING;
}

function Component() {
  const offset = computeOffset(4);
  return <div>{offset}</div>;
}

export {
  Component,
};
```

❌ **Incorrect — exporting internal helpers that aren't part of the module's public API:**

```typescript
export function computeOffset(value: number): number {
  return value + DEFAULT_PADDING;
}

export function Component() {
  // ...
}
```

## State Management

- Use Zustand for state management
- Check existing stores to understand structure and patterns
- Use selectors to access store state
- Use actions to modify store state

```typescript
import { stagesStore, stagesSelectors, stagesActions } from 'stores/stages';

const stage = stagesStore(stagesSelectors.getStageByID(id));
stagesActions.updateStage({ ...stage, title: 'New Title' });
```

## Component Organization

### Smart vs Dumb Components

- **Dumb components**: Reusable, presentational components inside `~/components` folder
- **Smart components**: Components connected to stores, inside `~/containers` folder
- Dumb components can also be placed in their smart component's folder if not reused

### File Structure Example

```
components
└─ Button
   ├─ assets.ts
   ├─ Button.module.css
   ├─ Button.props.ts
   ├─ Button.tsx
   └─ index.ts
```

```
tools
└─ useDrawingTool
   ├─ index.ts
   ├─ types.ts
   └─ useDrawingTool.ts
```

## Constants

- Never use "magic" numbers or strings directly in component or utility code
- Move any literal that has meaning beyond its immediate use into `~/constants/*.ts`, named to describe what it represents
- Values that are only meaningful within a single component's folder can live in that component's local `assets.ts` instead of the shared `constants/` folder

✅ **Correct:**

```typescript
import { SNAP_TOLERANCE_PX } from '~/constants/canvas';

if (distance < SNAP_TOLERANCE_PX) {
  // ...
}
```

❌ **Incorrect:**

```typescript
if (distance < 8) {
  // ...
}
```

## Comments

- Do not write comments that describe **what** the code does — clear naming should already make that obvious
- Only write a comment when it explains **why** — a hidden constraint, a non-obvious invariant, a workaround for a specific bug, or behavior that would otherwise surprise a reader
- If removing a comment would not confuse a future reader, remove it

✅ **Correct — explains a non-obvious constraint:**

```typescript
/**
 * Removes a component definition from the library. Existing instances are not deleted — each is
 * baked into independent shapes in place, so canvas content never disappears when the library
 * entry does.
 */
removeComponent: (componentId: string) => Record<ShapeId, ShapeId[]>;
```

❌ **Incorrect — restates what the code already says:**

```typescript
// Loop through all shapes and remove the one with matching id
const shapes = state.document.shapes.filter(shape => shape.id !== id);
```

## Additional Guidelines

- Do not abuse the possibility to disable ESLint rules
- Always strive to fix code according to linter messages
- Keep components focused and single-purpose
- Extract complex logic to utility functions or `assets.ts` files
- Use proper TypeScript types for all props and state

## Post-Code Verification — Mandatory

After finishing all file changes in current task, run the full project lint before closing the task:

```bash
npm run lint
```

Covers in order:

1. `format` — formatting code
2. `lint:ts` — TypeScript compiler (`tsc --noEmit`) on the whole project
3. `eslint` — ESLint on all `.ts` / `.tsx`

Must run on the **entire project** — not just changed files. Task is not complete until exit code is `0`.
