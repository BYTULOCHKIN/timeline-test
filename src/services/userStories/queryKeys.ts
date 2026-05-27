export const userStoriesKeys = {
    all: ['userStories'] as const,
    list() {
        return [...userStoriesKeys.all, 'list'] as const;
    },
    byYear(year: string) {
        return [...userStoriesKeys.list(), { year }] as const;
    },
};
