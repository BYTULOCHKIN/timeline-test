# Quick Reference - Phenomenon React TypeScript Template

Quick lookup tables, checklists, and code snippets for common tasks.

## Folder Structure Checklist

### Module Checklist
```
src/modules/<ModuleName>/
├── index.tsx              ✓ Required
├── style.module.css        ○ Optional
├── types.ts                ○ Optional
├── constants.ts            ○ Optional
├── hooks/                  ○ Optional
│   └── <hookName>.ts
├── utils/                  ○ Optional
│   └── <utilName>.ts
├── schemas/                ○ Optional
│   └── <schemaName>Schema.ts
├── components/             ○ Optional
│   └── <ComponentName>/
└── context/                ○ Optional
    └── <ContextName>Context.tsx
```

### Component Checklist
```
src/components/<ComponentName>/  (or src/components/ui/<ComponentName>/)
├── index.tsx              ✓ Required
├── style.module.css        ○ Optional
├── types.ts                ○ Optional
├── hooks/                  ○ Optional
├── utils/                  ○ Optional
├── constants.ts            ○ Optional
├── schemas/                ○ Optional
├── components/             ○ Optional
└── context/                ○ Optional
```

### Service Checklist
```
src/services/<serviceName>/
├── api.ts        ✓ Required
├── queries.ts    ✓ Required
├── queryKeys.ts  ✓ Required
└── types.ts      ✓ Required
```

### Route Checklist
```
src/routes/
├── __root.tsx                    ✓ Required (root route)
├── index.lazy.tsx               ○ Lazy route
├── index.tsx                    ○ Regular route
├── <route-name>/                ○ Route folder
│   ├── index.lazy.tsx          ○ Lazy route
│   └── index.tsx               ○ Regular route
└── _<layout-name>-layout/       ○ Layout folder
    ├── index.lazy.tsx          ○ Layout lazy route
    └── _<layout-name>-layout.tsx ○ Layout route file
```

## Naming Conventions Table

| Entity Type | Naming Convention | Example | Location |
|------------|-------------------|---------|----------|
| Module | PascalCase | `Home`, `About` | `src/modules/Home/` |
| Component | PascalCase | `Counter`, `ArticleCard` | `src/components/Counter/` |
| Hook | camelCase, `use` prefix | `useExampleHook.ts` | `src/hooks/useExampleHook.ts` |
| Util | camelCase | `exampleUtil.ts` | `src/lib/utils/exampleUtil.ts` |
| Schema | camelCase, `Schema` suffix | `exampleSchema.ts` | `src/schemas/exampleSchema.ts` |
| Route | kebab-case, lowercase | `about.tsx`, `user-profile.tsx` | `src/routes/about.tsx` |
| Icon | kebab-case, lowercase | `arrow-left.svg` | `src/icons/arrow-left.svg` |
| Service | camelCase | `authExample` | `src/services/authExample/` |
| Context | PascalCase, `Context` suffix | `AuthContext.tsx` | `src/contexts/AuthContext.tsx` |
| Layout | kebab-case, `_` prefix, `-layout` suffix | `_protected-layout` | `src/routes/_protected-layout/` |

## File Templates

### Module Template

```typescript
// src/modules/<ModuleName>/index.tsx
import s from './style.module.css';

const <ModuleName>: React.FC = () => {
    return (
        <main className={s.wrap}>
            {/* Module content */}
        </main>
    );
};

export default <ModuleName>;
```

### Component Template

```typescript
// src/components/<ComponentName>/index.tsx
import React from 'react';
import s from './style.module.css';

const <ComponentName>: React.FC = () => {
    return (
        <div className={s.wrap}>
            {/* Component content */}
        </div>
    );
};

export default React.memo(<ComponentName>);
```

### Service Query Keys Template

```typescript
// src/services/<serviceName>/queryKeys.ts
export const <serviceName>Keys = {
    root() {
        return ['<serviceName>'] as const;
    },
    listAll() {
        return [...<serviceName>Keys.root(), 'list'] as const;
    },
    list(searchParams?: Record<string, unknown>) {
        return [...<serviceName>Keys.listAll(), searchParams || {}] as const;
    },
    item(id: string) {
        return [...<serviceName>Keys.root(), 'item', id] as const;
    },
};
```

### Service API Template

```typescript
// src/services/<serviceName>/api.ts
import type { OptionsWithTypedJson } from '@/lib/@http';
import { http, httpPrivate } from '@/lib/@http';
import type { <RequestType>, <ResponseType> } from './types';

export const <apiFunction> = async (options: OptionsWithTypedJson<<RequestType>>) => {
    const res = await httpPrivate.post<<ResponseType>>('api/endpoint', options);
    return res.json();
};
```

### Service Queries Template

```typescript
// src/services/<serviceName>/queries.ts
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { <apiFunction> } from './api';
import { <serviceName>Keys } from './queryKeys';

export const <queryName>QueryOptions = () => {
    return queryOptions({
        queryKey: <serviceName>Keys.<keyMethod>(),
        queryFn: <apiFunction>,
    });
};

export const <mutationName>MutationOptions = () => {
    return mutationOptions({
        mutationKey: <serviceName>Keys.<keyMethod>(),
        mutationFn: <apiFunction>,
        onSuccess(data, _variables, _onMutateResult, { client }) {
            // Handle success
        },
    });
};
```

### Service Types Template

```typescript
// src/services/<serviceName>/types.ts
export type <RequestType> = {
    // Request fields
};

export type <ResponseType> = {
    // Response fields
};
```

### Lazy Route Template

```typescript
// src/routes/<route-name>/index.lazy.tsx
import { createLazyFileRoute } from '@tanstack/react-router';
import <ModuleName> from '@/modules/<ModuleName>';

export const Route = createLazyFileRoute('/<route-name>')({
    component: <ModuleName>,
});
```

### Regular Route Template

```typescript
// src/routes/<route-name>/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import <ModuleName> from '@/modules/<ModuleName>';

export const Route = createFileRoute('/<route-name>')({
    component: <ModuleName>,
    validateSearch(search) {
        // Validate search params
        return search;
    },
    loader({ search }) {
        // Prefetch data
    },
});
```

### Route API Hook Template

```typescript
// src/modules/<ModuleName>/hooks/use<ModuleName>RouteApi.ts
import { getRouteApi } from '@tanstack/react-router';

const <moduleName>RouteApi = getRouteApi('/<route-name>');

export const use<ModuleName>RouteApi = () => {
    const search = <moduleName>RouteApi.useSearch();
    const navigate = <moduleName>RouteApi.useNavigate();
    return { search, navigate };
};
```

### Schema Template

```typescript
// src/schemas/<schemaName>Schema.ts
import { z } from 'zod';

export const <schemaName>Schema = z.object({
    // Schema fields
});

export type <SchemaName>Schema = z.infer<typeof <schemaName>Schema>;
```

### Hook Template

```typescript
// src/hooks/use<HookName>.ts
export const use<HookName> = () => {
    // Hook logic
    return {};
};
```

### Util Template

```typescript
// src/lib/utils/<utilName>.ts
export const <utilName> = () => {
    // Util logic
};
```

## Common Import Patterns

### Module Imports

```typescript
import Home from '@/modules/Home';
import Counter from '@/modules/Home/components/Counter';
```

### Component Imports

```typescript
import Counter from '@/components/Counter';
import Button from '@/components/ui/Button';
```

### Service Imports

```typescript
import { useQuery } from '@tanstack/react-query';
import { meQueryOptions } from '@/services/authExample/queries';
import { authExampleKeys } from '@/services/authExample/queryKeys';
```

### Lib Imports

```typescript
import { http, httpPrivate } from '@/lib/@http';
import { queryClient } from '@/lib/@queryClient';
import { ONE_SECOND } from '@/lib/constants';
import { envSchema } from '@/lib/schemas';
```

### Hook Imports

```typescript
import { useOptimisticMutation } from '@/hooks/useOptimisticMutation';
import { useExampleHook } from '@/modules/Home/hooks/useExampleHook';
```

### Icon Imports

```typescript
import { Component as ArrowLeftIcon } from '@/icons/arrow-left.svg?svgUse';
```

### Route Imports

```typescript
import { createLazyFileRoute } from '@tanstack/react-router';
import { getRouteApi } from '@tanstack/react-router';
```

## Path Alias Reference

| Alias | Maps To | Example |
|-------|---------|---------|
| `@/` | `src/` | `@/modules/Home` → `src/modules/Home` |
| `@/components` | `src/components` | `@/components/Counter` |
| `@/modules` | `src/modules` | `@/modules/Home` |
| `@/services` | `src/services` | `@/services/authExample` |
| `@/lib` | `src/lib` | `@/lib/@http` |
| `@/hooks` | `src/hooks` | `@/hooks/useOptimisticMutation` |
| `@/icons` | `src/icons` | `@/icons/arrow-left.svg` |
| `@/styles` | `src/styles` | `@/styles/index.css` |

## Common Code Snippets

### Query Hook Usage

```typescript
import { useQuery } from '@tanstack/react-query';
import { meQueryOptions } from '@/services/authExample/queries';

const { data, isLoading, error } = useQuery(meQueryOptions());
```

### Mutation Hook Usage

```typescript
import { useMutation } from '@tanstack/react-query';
import { loginMutationOptions } from '@/services/authExample/queries';

const { mutate: login, isPending } = useMutation(loginMutationOptions());

login({ json: { email: 'user@example.com', password: 'password' } });
```

### Query Invalidation

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { authExampleKeys } from '@/services/authExample/queryKeys';

const queryClient = useQueryClient();

queryClient.invalidateQueries({
    queryKey: authExampleKeys.list(),
});
```

### Query Prefetch

```typescript
import { queryClient } from '@/lib/@queryClient';
import { meQueryOptions } from '@/services/authExample/queries';

await queryClient.prefetchQuery(meQueryOptions());
```

### Icon Usage

```typescript
import { Component as IconName } from '@/icons/icon-name.svg?svgUse';

<IconName className={s.icon} />
```

### Schema Validation

```typescript
import { exampleSchema } from './schemas/exampleSchema';

try {
    const data = exampleSchema.parse(rawData);
} catch (error) {
    // Handle validation error
}
```

### HTTP Request (JSON)

```typescript
import { httpPrivate } from '@/lib/@http';
import type { OptionsWithTypedJson } from '@/lib/@http';

const res = await httpPrivate.post<ResponseType>('api/endpoint', {
    json: requestData,
});
const data = await res.json();
```

### HTTP Request (FormData)

```typescript
import { httpPrivate } from '@/lib/@http';
import type { OptionsWithTypedBody } from '@/lib/@http';

const formData = new FormData();
formData.append('file', file);

const res = await httpPrivate.post<ResponseType>('api/endpoint', {
    body: formData,
});
const data = await res.json();
```

## Quick Decision Tree

### Creating a New Entity

1. **Is it a page/route?** → Create Module in `src/modules/`
2. **Is it reusable UI?** → Create Component in `src/components/ui/`
3. **Is it reusable with business logic?** → Create Component in `src/components/`
4. **Is it API-related?** → Create Service in `src/services/`
5. **Is it a route definition?** → Create Route in `src/routes/`
6. **Is it used everywhere?** → Create in `src/lib/`, `src/hooks/`, etc.
7. **Is it used in one place?** → Create in that entity's folder

### Choosing Route Type

- **Need search validation, loader, or actions?** → Regular route (`index.tsx`)
- **Just rendering a module?** → Lazy route (`index.lazy.tsx`)

### Choosing Hook Location

- **Used in multiple modules/components?** → `src/hooks/`
- **Used only in one module/component?** → That entity's `hooks/` folder

### Choosing Util Location

- **Used in multiple modules/components?** → `src/lib/utils/`
- **Used only in one module/component?** → That entity's `utils/` folder

## Critical Rules Reminder

- ❌ **Modules NEVER have props**
- ❌ **Routes render modules only** (not components directly)
- ❌ **Services must have 4 files** (api.ts, queries.ts, queryKeys.ts, types.ts)
- ❌ **Query keys must be hierarchical**
- ❌ **Icons require `?svgUse` parameter**
- ❌ **Schemas must export inferred types**
- ✅ **Always check existing code examples first**
- ✅ **Use `@/` alias for all src/ imports**
- ✅ **Default export for modules and components**

## References

- **README.md** - Complete documentation
- **.ai/CONTEXT.md** - Detailed architecture patterns
- **.ai/EXAMPLES.md** - Real code examples
