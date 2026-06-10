export function usuarioPodeGerenciarConquistas() {
    try {
        const raw = localStorage.getItem('user');
        if (!raw) return false;

        const user = JSON.parse(raw);
        const role = String(user?.roleName ?? user?.roleCode ?? user?.role ?? '').toUpperCase();

        return ['ROLE_ADMIN', 'ADMIN', 'ROLE_CUIDADOR', 'CUIDADOR'].includes(role);
    } catch {
        return false;
    }
}
