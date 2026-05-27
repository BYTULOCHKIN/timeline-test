# Project Context - Phenomenon React TypeScript Template

## Project Overview

This is a React + TypeScript project template by Phenomenon.Studio. It uses modern tooling and follows strict architectural patterns for maintainability and scalability.

### Stack

- **Vite** - Build tool with HMR
- **React 19** - UI framework with compiler optimizations
- **TypeScript** - Type-safe development with strict mode
- **TanStack Router** - Type-safe, file-based routing with code-splitting
- **TanStack Query** - Async state management
- **TanStack Form** - Type-safe form state management
- **TailwindCSS** - Utility-first CSS framework
- **Ky** - Modern HTTP client
- **Zod** - TypeScript-first schema validation

## Architecture Patterns

### Folder Structure

```
src/
├── components/          # Shared components with business logic
│   ├── ui/             # Basic UI components without business logic
│   └── layouts/        # Layout components (include <Outlet />)
├── modules/            # Independent features/pages (used in routes)
├── routes/             # File-based route definitions (TanStack Router)
├── services/           # API service layer
│   └── <serviceName>/
│       ├── api.ts      # API functions
│       ├── queries.ts  # Query/mutation hooks
│       ├── queryKeys.ts # Query key hierarchy
│       └── types.ts    # Request/response types
├── lib/                # Core utilities and configurations
│   ├── @http.ts        # HTTP client (Ky)
│   ├── @queryClient.ts # TanStack Query client
│   ├── constants.ts    # Global constants
│   ├── schemas.ts      # Global Zod schemas
│   ├── types.ts        # Global TypeScript types
│   └── utils/          # Global utility functions
├── hooks/              # Global React hooks
├── styles/             # Global styles
└── icons/              # SVG icons
```

## Modules

Modules represent pages/routes in the application. They are the only entities that can be rendered by routes.

### Module Rules

- **Location**: `src/modules/<ModuleName>/`
- **No Props**: Modules NEVER accept props
- **Default Export**: Must use default export
- **Naming**: Module name matches route name (PascalCase)
- **Structure**: Can contain:
  - `index.tsx` - Main component (required)
  - `styles.module.css` - Styles (optional)
  - `types.ts` - Types (optional)
  - `constants.ts` - Constants (optional)
  - `hooks/` - Module-specific hooks (optional)
  - `utils/` - Module-specific utilities (optional)
  - `schemas/` - Module-specific Zod schemas (optional)
  - `components/` - Sub-components (optional)
  - `context/` - Module-specific contexts (optional)

### Module Pattern

```typescript
// src/modules/Home/index.tsx
import type { HomeExampleProps } from './types';
import Counter from './components/Counter';
import s from './style.module.css';

const Home: React.FC<HomeExampleProps> = () => {
    return (
        <main className={s.wrap}>
            <Counter />
        </main>
    );
};

export default Home;
```

## Components

### Shared Components (`src/components/`)

Components with business logic that can be reused across the application.

### UI Components (`src/components/ui/`)

Basic UI components without business logic (buttons, inputs, etc.).

### Component Structure

Each component folder can contain:
- `index.tsx` - Component file (required)
- `styles.module.css` - Styles (optional)
- `types.ts` - Types (optional)
- `hooks/` - Component-specific hooks (optional)
- `utils/` - Component-specific utilities (optional)
- `constants.ts` - Constants (optional)
- `schemas/` - Component-specific schemas (optional)
- `components/` - Sub-components (optional)
- `context/` - Component-specific contexts (optional)

### Component Pattern

```typescript
// src/components/Counter/index.tsx
import React from 'react';
import s from './style.module.css';

const Counter: React.FC = () => {
    const [count, setCount] = React.useState(0);
    // ...
    return <div className={s.wrap}>...</div>;
};

export default React.memo(Counter);
```

## Services & API Layer

Services handle API calls and external integrations. Each service must have 4 files.

### Service Structure

```
src/services/<serviceName>/
├── api.ts        # API functions using http/httpPrivate
├── queries.ts    # Query and mutation hooks/options
├── queryKeys.ts  # Query key hierarchy
└── types.ts      # Request and response types
```

### API Pattern (`api.ts`)

```typescript
import { http, httpPrivate } from '@/lib/@http';
import type { OptionsWithTypedJson } from '@/lib/@http';
import type { LoginData, LoginRequestData } from './types';

export const login = async (options: OptionsWithTypedJson<LoginRequestData>) => {
    const res = await http.post<LoginData>('api/login', options);
    return res.json();
};
```

### Query Keys Pattern (`queryKeys.ts`)

Query keys must use hierarchical structure:

```typescript
export const authExampleKeys = {
    root() {
        return ['authExample'] as const;
    },
    listAll() {
        return [...authExampleKeys.root(), 'list'] as const;
    },
    list(searchParams?: Record<string, unknown>) {
        return [...authExampleKeys.listAll(), searchParams || {}] as const;
    },
    me() {
        return [...authExampleKeys.root(), 'me'] as const;
    },
};
```

### Queries Pattern (`queries.ts`)

```typescript
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { login } from './api';
import { authExampleKeys } from './queryKeys';

export const meQueryOptions = () => {
    return queryOptions({
        queryKey: authExampleKeys.me(),
        queryFn: me,
    });
};

export const loginMutationOptions = () => {
    return mutationOptions({
        mutationKey: authExampleKeys.login(),
        mutationFn: login,
        onSuccess(data, _variables, _onMutateResult, { client }) {
            // Handle success
        },
    });
};
```

### Types Pattern (`types.ts`)

```typescript
export type LoginRequestData = {
    email: string;
    password: string;
};

export type LoginData = {
    user: MeData;
    accessToken: string;
    refreshToken: string;
};
```

## Routing

TanStack Router uses file-based routing in `src/routes/`.

### Route Types

#### Lazy Routes (`index.lazy.tsx`)

Use when you don't need search parameter validation or loaders:

```typescript
import { createLazyFileRoute } from '@tanstack/react-router';
import Home from '@/modules/Home';

export const Route = createLazyFileRoute('/')({
    component: Home,
});
```

#### Regular Routes (`index.tsx`)

Use when you need search validation, loaders, or actions:

```typescript
import { createFileRoute } from '@tanstack/react-router';
import About from '@/modules/About';

export const Route = createFileRoute('/about')({
    component: About,
    validateSearch(search) {
        // Validate search params
    },
    loader({ search }) {
        // Prefetch data
    },
});
```

#### Mixed Routes

You can split logic between regular and lazy routes:

```
src/routes/about/
├── index.tsx        # Regular route (validation, loader)
└── index.lazy.tsx  # Lazy route (component)
```

### Layouts

Layouts wrap routes and must include `<Outlet />`.

**Layout Structure:**
```
src/routes/
├── _protected-layout/
│   └── index.lazy.tsx
└── _protected-layout.tsx
```

**Layout Component:**
```typescript
// src/components/layouts/ProtectedLayout/index.tsx
import { Outlet } from '@tanstack/react-router';

const ProtectedLayout: React.FC = () => {
    return (
        <div>
            <Outlet />
        </div>
    );
};
```

**Layout Route:**
```typescript
// src/routes/_protected-layout.tsx
import ProtectedLayout from '@/components/layouts/ProtectedLayout';

export const Route = createFileRoute('/_protected-layout')({
    component: ProtectedLayout,
});
```

### Route API Hooks

Create custom route hooks for each module to optimize router tree iterations:

**Pattern**: `src/modules/<ModuleName>/hooks/use<ModuleName>RouteApi.ts`

```typescript
import { getRouteApi } from '@tanstack/react-router';

const aboutRouteApi = getRouteApi('/about');

export const useAboutRouteApi = () => {
    const search = aboutRouteApi.useSearch();
    const navigate = aboutRouteApi.useNavigate();
    return { search, navigate };
};
```

## Hooks

### Global Hooks (`src/hooks/`)

Hooks used across the entire application.

### Component/Module Hooks

Hooks used only within a specific component or module should be in that entity's `hooks/` folder.

### Hook Pattern

```typescript
// src/hooks/useExampleHook.ts
export const useExampleHook = () => {
    // Hook logic
};
```

## Utilities

### Global Utils (`src/lib/utils/`)

Utility functions used across the entire application.

### Component/Module Utils

Utilities used only within a specific component or module should be in that entity's `utils/` folder.

### Util Pattern

```typescript
// src/lib/utils/exampleUtil.ts
export const exampleUtil = () => {
    // Util logic
};
```

## Constants

### Global Constants (`src/lib/constants.ts`)

Constants used across the entire application.

### Component/Module Constants

Constants used only within a specific component or module should be in that entity's `constants.ts` file.

### Constants Pattern

```typescript
// src/lib/constants.ts
export const ONE_SECOND = 1_000;
export const COMMON_ERROR_MESSAGE = 'Uh-oh, something went wrong.';
```

## Schemas

Schemas use Zod for validation and type inference.

### Global Schemas (`src/lib/schemas.ts`)

Schemas used across the entire application.

### Component/Module Schemas

Schemas used only within a specific component or module should be in that entity's `schemas/` folder.

### Schema Pattern

```typescript
import { z } from 'zod';

export const exampleSchema = z.object({
    name: z.string(),
    type: z.string(),
});

export type ExampleSchema = z.infer<typeof exampleSchema>;
```

## Icons

Icons are SVG files located in `src/icons/`.

### Icon Rules

- **Naming**: kebab-case, lowercase (e.g., `arrow-left.svg`, `profile.svg`)
- **Compression**: Compress with [SVGOMG](https://jakearchibald.github.io/svgomg/) before adding

### Icon Usage

```typescript
import { Component as ArrowLeftIcon } from '@/icons/arrow-left.svg?svgUse';

<ArrowLeftIcon className={s.icon} />
```

**Important**: Always add `?svgUse` parameter to the import path.

## Import Conventions

Use `@/` alias for imports from `src/`:

```typescript
import { http } from '@/lib/@http';
import Home from '@/modules/Home';
import { useExampleHook } from '@/hooks/useExampleHook';
```

## Type Safety

- Always use TypeScript types
- Infer types from Zod schemas when possible
- Service types should be in `types.ts` files
- Component types should be in `types.ts` files

## HTTP Client

The project uses Ky for HTTP requests:

- `http` - Public API client
- `httpPrivate` - Authenticated API client (auto-adds Bearer token)

```typescript
import { http, httpPrivate } from '@/lib/@http';
import type { OptionsWithTypedJson } from '@/lib/@http';

// JSON request
const res = await httpPrivate.post<ResponseData>('api/endpoint', {
    json: requestData,
});
return res.json();

// FormData request
const res = await httpPrivate.post<ResponseData>('api/endpoint', {
    body: formData,
});
return res.json();
```

## Query Client

TanStack Query is configured in `src/lib/@queryClient.ts`. The client:
- Has retry disabled by default
- Shows error toasts for failed queries with data
- Uses HTTPError from Ky as default error type

## Common Patterns

### Query Hooks

Query hooks accept parameters as arguments (prefer list over object when possible):

```typescript
export const useGetBooks = (search: string) => {
    return useQuery({
        queryKey: BOOKS_QUERY_KEYS.listWithParams({ search }),
        queryFn: () => getBooks({ search }),
    });
};
```

### Mutation Hooks

Mutation hooks return callable functions:

```typescript
const { mutate: addBookToFavorites } = useMutation(
    addBookToFavoritesMutationOptions()
);

// Usage
addBookToFavorites(bookId, {...});
```

## Important Notes

1. **Modules NEVER have props** - This is a critical rule
2. **Routes render modules only** - Never pass components from `src/components` directly to routes
3. **Services must have 4 files** - `api.ts`, `queries.ts`, `queryKeys.ts`, `types.ts`
4. **Query keys must be hierarchical** - Use the pattern shown above
5. **Icons require `?svgUse`** - Always add this parameter to icon imports
6. **Schemas must export types** - Use `z.infer<typeof schema>`
7. **Check existing code** - The project serves as a reference implementation

## References

- **README.md** - Complete project documentation with all details
- **.ai/EXAMPLES.md** - Real code examples from the project
- **.ai/QUICK_REFERENCE.md** - Quick lookup tables and checklists
