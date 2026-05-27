import type { Options } from 'ky';
import type { OptionsWithTypedJson } from '@/lib/@http';
import type { LoginData, LoginRequestData, MeData, ResfreshAccessTokenData } from './types';
import { http, httpPrivate } from '@/lib/@http';
import { ONE_SECOND } from '@/lib/constants';
import { sleep } from '@/lib/utils/sleep';

// Example with JSON:
// export const doSomethingWithJSON = async (options: OptionsWithTypedJson<SomeData>) => {
//     const res = await httpPrivate.post<SomeResultData>('api/do', options);
//     return res.json();
// };

// Example with FormData:
// export const doSomethingWithFormData = async (options: OptionsWithTypedBody<SomeData>) => {
//     const res = await httpPrivate.post<SomeResultData>('api/do', options);
//     return res.json();
// };

export const login = async (options: OptionsWithTypedJson<LoginRequestData>) => {
    // const res = await http.post<LoginData>('api/login', options);
    // return res.json();
    // Example:
    await sleep(ONE_SECOND);
    return {
        user: {
            id: 1,
            email: options.json.email,
            name: 'Name',
        },
        accessToken: '1234567890',
        refreshToken: '1234567890',
    } as LoginData;
};

export const logout = () => {
    return Promise.resolve(true);
};

export const refreshAccessToken = async (options?: Options) => {
    const res = await http.post<ResfreshAccessTokenData>('api/refresh', options);
    return res.json();
};

export const me = async (options?: Options) => {
    const res = await httpPrivate.get<MeData>('users/1', options);
    return res.json();
};
