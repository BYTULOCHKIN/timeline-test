export const EXAMPLE = 'Example';

export const STACK = [
    { name: 'Vite 6', role: 'Build tool — instant HMR, optimized prod bundles', color: '#646cff' },
    { name: 'React 19', role: 'UI library — concurrent rendering, actions', color: '#61dafb' },
    { name: 'TypeScript 5', role: 'Strict mode, path aliases, project refs', color: '#3178c6' },
    { name: 'TanStack Router', role: 'Type-safe routing, lazy routes, code-gen', color: '#ff4154' },
    { name: 'TanStack Query', role: 'Server state, caching, optimistic updates', color: '#f97316' },
    { name: 'Base UI + CSS Modules', role: 'Headless primitives, scoped styles, SCSS', color: '#a855f7' },
];

export const ARCH = [
    { depth: 1, name: 'modules/', desc: 'page-level feature slices' },
    { depth: 2, name: 'Home/', desc: 'components · hooks · utils · schemas' },
    { depth: 1, name: 'components/', desc: 'shared UI (Button, Typography…)' },
    { depth: 1, name: 'services/', desc: 'API layer — queries · keys · types' },
    { depth: 1, name: 'hooks/', desc: 'global reusable hooks' },
    { depth: 1, name: 'lib/', desc: 'http · queryClient · utils · schemas' },
    { depth: 1, name: 'routes/', desc: 'TanStack Router file-based routes' },
    { depth: 1, name: 'styles/', desc: 'index.css · reset · breakpoints' },
];
