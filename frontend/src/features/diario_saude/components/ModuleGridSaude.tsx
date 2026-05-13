import { ModuleGridIdoso } from './ModuleGridIdoso';
import { ModuleGridMedicoSaude } from './ModuleGridMedicoSaude';
import { ModuleGridAdmin } from './ModuleGridAdmin';

export function ModuleGridSaude() {
    const usuario = (() => {
        try {
            return (
                JSON.parse(localStorage.getItem("usuario") || "null") ||
                JSON.parse(localStorage.getItem("user") || "null")
            );
        } catch {
            return null;
        }
    })();

    const role = usuario?.roleName ?? usuario?.role ?? "";

    if (role === "ROLE_ADMIN") return <ModuleGridAdmin />;
    if (role === "ROLE_MEDICO") return <ModuleGridMedicoSaude />;
    return <ModuleGridIdoso />;
}