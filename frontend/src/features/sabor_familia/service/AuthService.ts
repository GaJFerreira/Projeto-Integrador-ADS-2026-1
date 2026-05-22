import authApi from "../lib/Auth";
import type { LoginRequest } from "../dto/auth/request/LoginRequest";
import type { SignupRequest } from "../dto/auth/request/SignupRequest";
import type { LoginResponse } from "../dto/auth/response/LoginResponse";

export const authService = {
  login: async (request: LoginRequest): Promise<LoginResponse> => {
    const { data } = await authApi.post<LoginResponse>("/login", request);
    return data;
  },

  signup: async (request: SignupRequest): Promise<void> => {
    await authApi.post("/signup", request);
  },
};
