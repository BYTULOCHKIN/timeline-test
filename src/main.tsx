import type { Config } from '@svg-use/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { configContext as SvgUseConfigContext } from '@svg-use/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { queryClient } from '@/lib/@queryClient';
import { envSchema } from '@/lib/schemas';
import { checkEnv } from '@/lib/utils/checkEnv';
import { routeTree } from './routeTree.gen';

import '@/styles/index.css';
import '@fontsource/poppins/300.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';

const router = createRouter({
    routeTree,
    basepath: import.meta.env.BASE_URL,
    context: {
        queryClient,
    },
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
    defaultPendingMs: 100,
    defaultPendingMinMs: 500,
    // TODO: Add when UI designs are ready
    // defaultNotFoundComponent: NotFound,
    // defaultErrorComponent: ErrorComponent,
    // defaultPendingComponent() {
    //     return <Loader className="size-16 m-auto" />;
    // },
});
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

const svgUseConfig: Config = {
    rewritePath: (pathOrHref) => {
        return pathOrHref;
    },
    runtimeChecksEnabled: import.meta.env.DEV,
};

checkEnv(envSchema);
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <SvgUseConfigContext.Provider value={svgUseConfig}>
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
            </QueryClientProvider>
        </SvgUseConfigContext.Provider>
    </React.StrictMode>
);
