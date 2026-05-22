import type { ErrorIconType } from "../enums/ErrorIconType";

export interface ErrorInfo {
  title: string;
  description: string;
  icon: ErrorIconType;
}
