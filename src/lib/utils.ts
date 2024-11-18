import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ActionError = { error: string };
export type ServerActionResponse<T = {}> = ActionError | T;

export function isActionError(error: any): error is ActionError {
  return error && "error" in error && error.error;
}
