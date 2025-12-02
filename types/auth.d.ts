import { UserRole, UserStatus } from "./usuarios";

export type JwtPayload = {
  sub: number;
  name?: string | null;
  email: string;
  dni: string;
  role: UserRole;
  status: UserStatus;
  emailVerified?: boolean;
  avatarUrl?: string | null;
};

// Respuesta de login en flujo "cookie-first" (el token se envía en cookie HttpOnly)
export type LoginResponse = {
  success: boolean;
  message?: string;
  data?: {
    user?: unknown;
    perfil?: unknown;
    empleado?: unknown;
    // En caso de MFA
    requiere_mfa?: boolean;
    user_id?: number;
  };
};

// Para compatibilidad, representación opcional de tokens (no usada en cookie-first)
export type AuthTokens = {
  accessToken?: string | null;
  refreshToken?: string | null;
};
