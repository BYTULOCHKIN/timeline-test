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
    // NOTE: We can also assign mutation keys if needed.
    // It's important to have mutation keys for comprehensive optimistic updates https://tkdodo.eu/blog/concurrent-optimistic-updates-in-react-query
    login() {
        return [...authExampleKeys.root(), 'login'] as const;
    },
};
