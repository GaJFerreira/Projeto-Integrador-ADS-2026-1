// Lightweight auth helpers for CareHub feature only.
// These read from localStorage and provide minimal fallback behavior so CareHub pages work.

function getStoredToken(): string | null {
  try {
    return (
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('jwtToken') ||
      localStorage.getItem('authToken')
    );
  } catch {
    return null;
  }
}

function cacheKey(suffix: 'cuidador' | 'cliente'): string {
  const uid = getUserId();
  return `carehub_is_${suffix}_${uid ?? 'anon'}`;
}

export function getUserId(): number | null {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.userId || null;
    }
  } catch {
    const v = localStorage.getItem('userId') || localStorage.getItem('userID');
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function getUserRole(): string | null {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.roleName || user.roleCode || null;
    }
  } catch {
    return localStorage.getItem('roles') || localStorage.getItem('userRole') || localStorage.getItem('role') || null;
  }
  return null;
}

export function getUser(): any {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

export function normalizeRole(role: any): string | null {
  if (!role) return null;
  if (Array.isArray(role)) {
    const first = role[0];
    if (!first) return null;
    if (typeof first === 'string') return first.toUpperCase();
    if (typeof first === 'object') return (first.roleName || first.name || first.code || String(first)).toString().toUpperCase();
  }
  if (typeof role === 'object') {
    return (role.roleName || role.name || role.code || role.authority || '').toString().toUpperCase() || null;
  }
  return String(role).toUpperCase();
}

export function isCuidador(role?: any): boolean {
  const cached = localStorage.getItem(cacheKey('cuidador'));
  if (cached === 'true') return true;
  if (cached === 'false') return false;

  const user = getUser();
  if (user) {
    if (Array.isArray(user.roles)) {
      const roles = user.roles.map((x: any) => String(x).toUpperCase());
      if (roles.some((s: string) => s.includes('CUIDADOR') || s.includes('CAREHUB_CUIDADOR'))) return true;
    }
    if (Array.isArray(user.permissions)) {
      if (user.permissions.some((p: any) => String(p).toUpperCase().includes('CUIDADOR'))) return true;
    }
    if (user.roleName && String(user.roleName).toUpperCase().includes('CUIDADOR')) return true;
    if (user.roleCode && String(user.roleCode).toUpperCase().includes('CUIDADOR')) return true;
  }

  const token = getStoredToken();
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const claims = JSON.stringify(payload).toUpperCase();
      if (claims.includes('CUIDADOR') || claims.includes('CAREHUB_CUIDADOR')) return true;
    } catch {
      // ignore parse errors
    }
  }

  const r = normalizeRole(role ?? getUserRole());
  if (!r) return false;
  return r.includes('CUIDADOR') || r.includes('ROLE_CUIDADOR') || r.includes('CAREHUB_CUIDADOR');
}

export function isCliente(role?: any): boolean {
  const cached = localStorage.getItem(cacheKey('cliente'));
  if (cached === 'true') return true;
  if (cached === 'false') return false;

  const user = getUser();
  if (user) {
    if (Array.isArray(user.roles)) {
      const roles = user.roles.map((x: any) => String(x).toUpperCase());
      if (roles.some((s: string) => s.includes('CLIENTE') || s.includes('CAREHUB_CLIENTE') || s.includes('IDOSO'))) return true;
    }
    if (Array.isArray(user.permissions)) {
      if (user.permissions.some((p: any) => String(p).toUpperCase().includes('CLIENTE'))) return true;
    }
    if (user.roleName && String(user.roleName).toUpperCase().includes('CLIENTE')) return true;
  }

  const token = getStoredToken();
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const claims = JSON.stringify(payload).toUpperCase();
      if (claims.includes('CLIENTE') || claims.includes('CAREHUB_CLIENTE') || claims.includes('IDOSO')) return true;
    } catch {
      // ignore
    }
  }

  const r = normalizeRole(role ?? getUserRole());
  if (!r) return false;
  return r.includes('CLIENTE') || r.includes('IDOSO') || r.includes('ROLE_CLIENTE') || r.includes('CAREHUB_CLIENTE');
}

export async function initializeAuthToken(): Promise<void> {
  try {
    const token = getStoredToken();
    if (token) {
      const { setAuthToken } = await import('../libHttp');
      setAuthToken(token);
    }
  } catch (error) {
    console.error('CareHub: Erro ao inicializar token:', error);
  }
}

export async function checkAndCacheUserType() {
  const userId = getUserId();
  if (!userId) return;

  try {
    await initializeAuthToken();

    try {
      const { default: http } = await import('../libHttp');
      await http.get('/api/carehub/perfil');
    } catch {
      // Nao bloqueia fluxo
    }

    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const roleName = (user.roleName || user.roleCode || '').toUpperCase();

      const isCuid = roleName.includes('CUIDADOR') || roleName.includes('CAREHUB_CUIDADOR');
      const isCli = roleName.includes('IDOSO') || roleName.includes('CLIENTE') || roleName.includes('FAMILIAR') || roleName.includes('CAREHUB_CLIENTE') || !isCuid;

      localStorage.setItem(cacheKey('cuidador'), isCuid ? 'true' : 'false');
      localStorage.setItem(cacheKey('cliente'), isCli ? 'true' : 'false');
    }
  } catch {
    localStorage.setItem(cacheKey('cuidador'), 'false');
    localStorage.setItem(cacheKey('cliente'), 'true');
  }
}

export function saveAuthToken(token: string) {
  try {
    localStorage.setItem('token', token);
    import('../libHttp').then(({ setAuthToken }) => {
      setAuthToken(token);
      checkAndCacheUserType();
    });
  } catch (error) {
    console.error('CareHub: Erro ao salvar token:', error);
  }
}

export function setTokenManually(token: string) {
  try {
    import('../libHttp').then(({ setAuthToken }) => {
      setAuthToken(token);
    });
  } catch (error) {
    console.error('CareHub: Erro ao configurar token manualmente:', error);
  }
}

export function debugAuthStorage() {
  const keys = ['token', 'accessToken', 'jwtToken', 'authToken', 'user', 'userId', 'roles', 'userRole'];
  const results: { [key: string]: any } = {};

  keys.forEach((key) => {
    const value = localStorage.getItem(key);
    if (value) {
      if (key === 'user') {
        try {
          results[key] = JSON.parse(value);
        } catch {
          results[key] = value;
        }
      } else {
        results[key] = value.length > 50 ? value.substring(0, 50) + '...' : value;
      }
    } else {
      results[key] = null;
    }
  });

  return results;
}
