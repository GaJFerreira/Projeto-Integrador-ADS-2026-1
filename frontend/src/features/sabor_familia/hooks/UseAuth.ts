import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import type { AuthContextData } from "../context/AuthContext";

export function useAuth(): AuthContextData {
  return useContext(AuthContext);
}
