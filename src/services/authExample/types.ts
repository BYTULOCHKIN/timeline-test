export type ResfreshAccessTokenData = { refreshToken: string; accessToken: string };

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
