import { toZonedTime, format } from 'date-fns-tz';

export function getBrazilDate(date?: Date | string): Date {
    const d = date ? new Date(date) : new Date();
    return toZonedTime(d, 'America/Sao_Paulo');
}

export function getBrazilTodayStr(): string {
    const brazilDate = getBrazilDate();
    // format YYYY-MM-DD
    return format(brazilDate, 'yyyy-MM-dd', { timeZone: 'America/Sao_Paulo' });
}
