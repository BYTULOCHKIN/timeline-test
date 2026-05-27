import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { createUserStory, deleteUserStory, getUserStoriesByYear } from './api';
import { userStoriesKeys } from './queryKeys';

export const userStoriesByYearQueryOptions = (year: string) => {
    return queryOptions({
        queryKey: userStoriesKeys.byYear(year),
        queryFn: () => {
            return getUserStoriesByYear(year);
        },
        enabled: Boolean(year),
    });
};

export const createUserStoryMutationOptions = () => {
    return mutationOptions({
        mutationFn: createUserStory,
    });
};

export const deleteUserStoryMutationOptions = () => {
    return mutationOptions({
        mutationFn: deleteUserStory,
    });
};
