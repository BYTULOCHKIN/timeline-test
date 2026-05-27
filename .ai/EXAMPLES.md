# Code Examples - Phenomenon React TypeScript Template

This file contains real code examples from the project demonstrating all patterns and conventions.

## Module Example

### Home Module Structure

```
src/modules/Home/
├── index.tsx
├── style.module.css
├── types.ts
├── constants.ts
├── hooks/
│   └── useExampleHook.ts
├── utils/
│   └── exampleUtil.ts
├── schemas/
│   └── exampleSchema.ts
└── components/
    └── Counter/
        ├── index.tsx
        └── style.module.css
```

### Home Module Component

```typescript
// src/modules/Home/index.tsx
import type { HomeExampleProps } from './types';
import { Component as PhenomenonMarkIcon } from '@/icons/phenomenon-mark.svg?svgUse';
import clsx from 'clsx';
import Counter from './components/Counter';
import s from './style.module.css';

const Home: React.FC<HomeExampleProps> = () => {
    return (
        <main className={clsx(s.wrap, 'full-height')}>
            <div className={s.inner}>
                <header className={s.header}>
                    <PhenomenonMarkIcon className={s.icon} />
                    <h1 className={s.title}>
                        <strong className={s.company}>Phenomenon</strong>
                    </h1>
                </header>
                <section className={s.content}>
                    <Counter />
                </section>
            </div>
        </main>
    );
};

export default Home;
```

### Module Types

```typescript
// src/modules/Home/types.ts
export type HomeExampleProps = {
    id?: number;
    name?: string;
};
```

### Module Constants

```typescript
// src/modules/Home/constants.ts
export const EXAMPLE = 'Example';
```

### Module Hook

```typescript
// src/modules/Home/hooks/useExampleHook.ts
export const useExampleHook = () => {};
```

### Module Util

```typescript
// src/modules/Home/utils/exampleUtil.ts
export const exampleUtil = () => {};
```

### Module Schema

```typescript
// src/modules/Home/schemas/exampleSchema.ts
import { z } from 'zod';

export type ExampleSchema = z.infer<typeof exampleSchema>;

export const exampleSchema = z.object({
    name: z.string(),
    type: z.string(),
});
```

## Component Example

### Counter Component

```typescript
// src/modules/Home/components/Counter/index.tsx
import React from 'react';
import clsx from 'clsx';
import s from './style.module.css';

const Counter: React.FC = () => {
    const [count, setCount] = React.useState(0);

    const increment = () => {
        setCount((prev) => {
            return prev + 1;
        });
    };

    const decrement = () => {
        setCount((prev) => {
            return prev - 1;
        });
    };

    return (
        <article className={s.wrap}>
            <div className={s['counter-wrap']}>
                Count:&nbsp;<strong>{count}</strong>
            </div>
            <footer className={s.footer}>
                <button className={clsx(s.cta, 'focus-primary')} onClick={decrement}>
                    -
                </button>
                <button className={clsx(s.cta, 'focus-primary')} onClick={increment}>
                    +
                </button>
            </footer>
        </article>
    );
};

export default Counter;
```

## Service Example

### Auth Example Service Structure

```
src/services/authExample/
├── api.ts
├── queries.ts
├── queryKeys.ts
└── types.ts
```

### Query Keys

```typescript
// src/services/authExample/queryKeys.ts
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
    login() {
        return [...authExampleKeys.root(), 'login'] as const;
    },
};
```

### API Functions

```typescript
// src/services/authExample/api.ts
import type { Options } from 'ky';
import type { OptionsWithTypedJson } from '@/lib/@http';
import type { LoginData, LoginRequestData, MeData } from './types';
import { http, httpPrivate } from '@/lib/@http';

export const login = async (options: OptionsWithTypedJson<LoginRequestData>) => {
    const res = await http.post<LoginData>('api/login', options);
    return res.json();
};

export const me = async (options?: Options) => {
    const res = await httpPrivate.get<MeData>('users/1', options);
    return res.json();
};

export const logout = () => {
    return Promise.resolve(true);
};
```

### Query Options

```typescript
// src/services/authExample/queries.ts
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { removeAuthToken, removeRefreshToken, setAuthToken, setRefreshToken } from '@/lib/utils/auth/tokens';
import { login, logout, me } from './api';
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
            if (data.accessToken) {
                setAuthToken(data.accessToken);
                setRefreshToken(data.refreshToken);
                return client.ensureQueryData(meQueryOptions());
            }
        },
    });
};

export const logoutMutationOptions = () => {
    return mutationOptions({
        mutationFn: logout,
        onSuccess(_data, _variables, _onMutateResult, { client }) {
            removeAuthToken();
            removeRefreshToken();
            client.clear();
        },
    });
};
```

### Service Types

```typescript
// src/services/authExample/types.ts
export type ResfreshAccessTokenData = { 
    refreshToken: string; 
    accessToken: string 
};

export type MeData = {
    id: number;
    email: string;
    name: string;
};

export type LoginRequestData = {
    email: string;
    password: string;
};

export type LoginData = ResfreshAccessTokenData & {
    user: MeData;
};
```

## Route Examples

### Root Route

```typescript
// src/routes/__root.tsx
import React from 'react';
import { createRootRoute, Outlet } from '@tanstack/react-router';

const TanStackDevtools = import.meta.env.DEV
    ? React.lazy(async () => {
          const res = await import('@tanstack/react-devtools');
          return {
              default: res.TanStackDevtools,
          };
      })
    : () => {
          return null;
      };

export const Route = createRootRoute({
    component() {
        return (
            <>
                <Outlet />
                <React.Suspense>
                    <TanStackDevtools
                        config={{
                            position: 'bottom-right',
                        }}
                    />
                </React.Suspense>
            </>
        );
    },
});
```

### Lazy Route

```typescript
// src/routes/index.lazy.tsx
import { createLazyFileRoute } from '@tanstack/react-router';
import Home from '@/modules/Home';

export const Route = createLazyFileRoute('/')({
    component: Home,
});
```

## Global Examples

### Global Constants

```typescript
// src/lib/constants.ts
export const LS_AUTH_TOKEN_KEY = '<appName>_AuthToken';
export const LS_REFRESH_TOKEN_KEY = '<appName>_RefreshToken';
export const ONE_SECOND = 1_000;
export const ONE_MINUTE = 60 * ONE_SECOND;
export const COMMON_ERROR_MESSAGE = 'Uh-oh, something went wrong.';
```

### Global Schema

```typescript
// src/lib/schemas.ts
import { z } from 'zod';

export type EnvSchema = z.infer<typeof envSchema>;
export const envSchema = z.object({
    VITE_API_URL: z.string(),
});
```

### Global Hook

```typescript
// src/hooks/useOptimisticMutation.ts
import type { DataTag, MutationFunction, QueryKey } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type Updater<TQueryFnData, TVariables> = (
    _oldData: TQueryFnData | undefined,
    _variables: TVariables
) => TQueryFnData | undefined;

type OptimisticProps<
    TData = unknown,
    TVariables = unknown,
    TQueryKey extends QueryKey = QueryKey,
    TQueryFnData = unknown,
> = {
    mutationFn: MutationFunction<TData, TVariables>;
    queryKey: TQueryKey;
    updater: Updater<TQueryFnData, TVariables>;
    invalidate: () => Promise<void>;
};

export const useOptimisticMutation = <
    TData = unknown,
    TVariables = unknown,
    TQueryFnData = unknown,
    TQueryKey extends QueryKey = QueryKey,
    TInferredQueryFnData = TQueryKey extends DataTag<unknown, infer TaggedValue> ? TaggedValue : TQueryFnData,
>({
    mutationFn,
    queryKey,
    updater,
    invalidate,
}: OptimisticProps<TData, TVariables, TQueryKey, TInferredQueryFnData>) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn,
        async onMutate(variables) {
            await queryClient.cancelQueries({
                queryKey,
            });

            const snapshot = queryClient.getQueryData(queryKey);

            queryClient.setQueryData<TInferredQueryFnData>(queryKey, (old) => {
                return updater(old, variables);
            });

            return () => {
                queryClient.setQueryData(queryKey, snapshot);
            };
        },
        onError(_error, _variables, rollback) {
            rollback?.();
        },
        onSettled() {
            return invalidate();
        },
    });
};
```

## HTTP Client Example

```typescript
// src/lib/@http.ts
import type { Options } from 'ky';
import ky from 'ky';
import { refreshAccessTokenAndRetry } from './utils/auth/errorHandler';
import { getAuthToken } from './utils/auth/tokens';

export interface OptionsWithTypedJson<TJson> extends Options {
    json: TJson;
}

export interface OptionsWithTypedBody<TBody extends BodyInit | null | undefined> extends Options {
    body: TBody;
}

export const http = ky.create({
    prefixUrl: import.meta.env.VITE_API_URL,
    timeout: false,
    retry: 0,
});

export let httpPrivate = http.extend({
    hooks: {
        beforeRequest: [
            (request) => {
                const token = getAuthToken();
                if (token) {
                    request.headers.set('Authorization', `Bearer ${token}`);
                }
            },
        ],
    },
    credentials: 'include',
});

httpPrivate = httpPrivate.extend({
    hooks: {
        afterResponse: [refreshAccessTokenAndRetry(httpPrivate)],
    },
});
```

## Query Client Example

```typescript
// src/lib/@queryClient.ts
import type { BaseErrorData } from '@/lib/@http';
import { QueryCache, QueryClient } from '@tanstack/react-query';
import { HTTPError } from 'ky';
import { toast } from 'sonner';
import { COMMON_ERROR_MESSAGE } from '@/lib/constants';

declare module '@tanstack/react-query' {
    interface Register {
        defaultError: HTTPError<BaseErrorData>;
    }
}

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            refetchOnWindowFocus: false,
            throwOnError: true,
        },
        mutations: {
            retry: false,
        },
    },
    queryCache: new QueryCache({
        async onError(error, query) {
            const hasQueryData = query.state.data !== undefined;

            if (hasQueryData && error instanceof HTTPError) {
                const parsedErrorData = await error.response.json();
                toast.error(parsedErrorData.message || error.message);
            } else if (hasQueryData && error instanceof Error) {
                toast.error(error?.message || COMMON_ERROR_MESSAGE);
            }
        },
    }),
});
```

## Usage Examples

### Using Query Hooks

```typescript
import { useQuery } from '@tanstack/react-query';
import { meQueryOptions } from '@/services/authExample/queries';

const { data, isLoading } = useQuery(meQueryOptions());
```

### Using Mutation Hooks

```typescript
import { useMutation } from '@tanstack/react-query';
import { loginMutationOptions } from '@/services/authExample/queries';

const { mutate: login, isPending } = useMutation(loginMutationOptions());

// Usage
login({ json: { email: 'user@example.com', password: 'password' } });
```

### Using Route API Hooks

```typescript
// src/modules/About/hooks/useAboutRouteApi.ts
import { getRouteApi } from '@tanstack/react-router';

const aboutRouteApi = getRouteApi('/about');

export const useAboutRouteApi = () => {
    const search = aboutRouteApi.useSearch();
    const navigate = aboutRouteApi.useNavigate();
    return { search, navigate };
};

// Usage in component
const About: React.FC = () => {
    const { search, navigate } = useAboutRouteApi();
    // ...
};
```

### Using Icons

```typescript
import { Component as PhenomenonMarkIcon } from '@/icons/phenomenon-mark.svg?svgUse';

<PhenomenonMarkIcon className={s.icon} />
```

### Using Schemas

```typescript
import { exampleSchema } from './schemas/exampleSchema';
import type { ExampleSchema } from './schemas/exampleSchema';

const data: ExampleSchema = exampleSchema.parse({
    name: 'Example',
    type: 'Type',
});
```
