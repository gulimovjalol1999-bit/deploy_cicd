export declare const authApi: {
    login: (email: string, password: string) => any;
    logout: () => any;
    getMe: () => any;
    refresh: (refreshToken: string) => any;
};
