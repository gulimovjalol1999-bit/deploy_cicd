export declare const paymentsApi: {
    create: (data: {
        bookingId: string;
        amount: number;
        method: string;
        note?: string;
    }) => any;
    findByBooking: (bookingId: string) => any;
    remove: (id: string) => any;
};
