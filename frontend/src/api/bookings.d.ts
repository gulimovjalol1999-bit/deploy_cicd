import type { BookingQuery } from '../types';
export declare const bookingsApi: {
    create: (data: {
        customerFullName: string;
        customerPhone: string;
        date: string;
        startTime: string;
        endTime: string;
    }) => any;
    findAll: (query?: BookingQuery) => any;
    findOne: (id: string) => any;
    findHistory: (id: string) => any;
    getSchedule: (date: string) => any;
    update: (id: string, data: Partial<{
        customerFullName: string;
        customerPhone: string;
        date: string;
        startTime: string;
        endTime: string;
        status: string;
    }>) => any;
    cancel: (id: string, data: {
        cancellationReason: string;
        cancellationNote?: string;
    }) => any;
};
