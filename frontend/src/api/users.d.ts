export declare const usersApi: {
    create: (data: {
        fullName: string;
        email: string;
        password: string;
        role: string;
    }) => any;
    findAll: () => any;
    findOne: (id: string) => any;
    update: (id: string, data: Partial<{
        fullName: string;
        email: string;
        role: string;
    }>) => any;
    deactivate: (id: string) => any;
    remove: (id: string) => any;
};
