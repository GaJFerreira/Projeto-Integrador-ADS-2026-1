export function getRoleCode(): string {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.roleCode || '';
  } catch {
    return '';
  }
}

export function isIdoso(): boolean {
  return getRoleCode() === 'IDOSO';
}

export function isAdmin(): boolean {
  return getRoleCode() === 'ADMIN';
}
