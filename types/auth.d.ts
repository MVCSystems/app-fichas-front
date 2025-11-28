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

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
};

export type AuthTokens = {
  accessToken: string | null;
  refreshToken: string | null;
};
