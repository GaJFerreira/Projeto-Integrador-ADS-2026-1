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

export function getUserId(): number | null {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return typeof user.userId === 'number' ? user.userId : null;
  } catch {
    return null;
  }
}

export function isAdmin(): boolean {
  return getRoleCode() === 'ADMIN';
}
