type ApiDateObject = {
    year?: number;
    month?: number | string;
    monthValue?: number;
    day?: number;
    dayOfMonth?: number;
    hour?: number;
    minute?: number;
};

type ApiDate = string | number | number[] | Date | ApiDateObject | null | undefined;

export function formatarDataRemember(value: ApiDate, fallback = 'Data nao informada') {
    if (!value) {
        return fallback;
    }

    if (value instanceof Date) {
        return formatarDate(value, fallback);
    }

    if (Array.isArray(value)) {
        const [year, month, day, hour = 0, minute = 0] = value;
        if (!year || !month || !day) {
            return fallback;
        }
        return formatarDate(new Date(year, month - 1, day, hour, minute), fallback);
    }

    if (typeof value === 'number') {
        return formatarDate(new Date(value), fallback);
    }

    if (typeof value === 'string') {
        const brDateMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
        if (brDateMatch) {
            const [, day, month, year, hour = '0', minute = '0', second = '0'] = brDateMatch;
            return formatarDate(
                new Date(
                    Number(year),
                    Number(month) - 1,
                    Number(day),
                    Number(hour),
                    Number(minute),
                    Number(second)
                ),
                fallback
            );
        }

        const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (dateOnlyMatch) {
            const [, year, month, day] = dateOnlyMatch;
            return formatarDate(new Date(Number(year), Number(month) - 1, Number(day)), fallback);
        }

        return formatarDate(new Date(value), fallback);
    }

    const objectDate = criarDataPorObjeto(value);
    if (objectDate) {
        return formatarDate(objectDate, fallback);
    }

    return fallback;
}

export function formatarDataInputRemember(value: ApiDate) {
    if (!value) {
        return '';
    }

    if (Array.isArray(value)) {
        const [year, month, day] = value;
        if (!year || !month || !day) {
            return '';
        }
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    if (value instanceof Date) {
        return toInputDate(value);
    }

    if (typeof value === 'string') {
        const brDateMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
        if (brDateMatch) {
            return `${brDateMatch[3]}-${brDateMatch[2]}-${brDateMatch[1]}`;
        }

        const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (dateOnlyMatch) {
            return `${dateOnlyMatch[1]}-${dateOnlyMatch[2]}-${dateOnlyMatch[3]}`;
        }
    }

    const objectDate = typeof value === 'object' ? criarDataPorObjeto(value) : null;
    if (objectDate) {
        return toInputDate(objectDate);
    }

    return '';
}

export function getHojeLocalRemember() {
    return toInputDate(new Date());
}

function formatarDate(date: Date, fallback: string) {
    if (Number.isNaN(date.getTime())) {
        return fallback;
    }

    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function toInputDate(date: Date) {
    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function criarDataPorObjeto(value: ApiDateObject) {
    const year = value.year;
    const month = value.monthValue ?? normalizarMes(value.month);
    const day = value.dayOfMonth ?? value.day;

    if (!year || !month || !day) {
        return null;
    }

    return new Date(year, month - 1, day, value.hour ?? 0, value.minute ?? 0);
}

function normalizarMes(month: number | string | undefined) {
    if (typeof month === 'number') {
        return month;
    }

    if (!month) {
        return undefined;
    }

    const nomesMeses = [
        'JANUARY',
        'FEBRUARY',
        'MARCH',
        'APRIL',
        'MAY',
        'JUNE',
        'JULY',
        'AUGUST',
        'SEPTEMBER',
        'OCTOBER',
        'NOVEMBER',
        'DECEMBER',
    ];

    const index = nomesMeses.indexOf(month.toUpperCase());
    return index >= 0 ? index + 1 : undefined;
}
