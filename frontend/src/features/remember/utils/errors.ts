type ApiErrorResponse = {
    message?: string;
    detail?: string;
    error?: string;
    errors?: Array<{ message?: string; defaultMessage?: string; field?: string } | string>;
};

export function getMensagemErroRemember(error: unknown, fallback: string) {
    const responseData = (error as { response?: { data?: ApiErrorResponse | string } })?.response?.data;

    if (!responseData) {
        return fallback;
    }

    if (typeof responseData === 'string') {
        return responseData || fallback;
    }

    if (responseData.message) return responseData.message;
    if (responseData.detail) return responseData.detail;
    if (responseData.error) return responseData.error;

    const primeiroErro = responseData.errors?.[0];
    if (typeof primeiroErro === 'string') {
        return primeiroErro;
    }

    return primeiroErro?.message ?? primeiroErro?.defaultMessage ?? fallback;
}
