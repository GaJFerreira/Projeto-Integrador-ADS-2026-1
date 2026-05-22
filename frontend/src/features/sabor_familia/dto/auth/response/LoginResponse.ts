export interface Permission {
  id: number;
  name: string;
  module_id: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  userId: number;
  username: string;
  email: string;
  name: string;
  roleName: string;
  roleCode: string;
  permissions: Permission[];
}
