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
