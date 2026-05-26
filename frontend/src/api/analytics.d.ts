export declare const analyticsApi: {
    getDateStats: (date: string) => any;
    getDailyRevenue: (date: string) => any;
    getWeeklyRevenue: (year: number, week: number) => any;
    getMonthlyRevenue: (year: number, month: number) => any;
    getYearlyRevenue: (year: number) => any;
    getBusiestHours: (dateFrom?: string, dateTo?: string) => any;
    getBusiestDays: (year: number, month?: number) => any;
    getOccupancy: (dateFrom: string, dateTo: string) => any;
    getAdminStats: (dateFrom?: string, dateTo?: string) => any;
};
