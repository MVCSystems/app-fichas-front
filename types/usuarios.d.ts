type UserRole = "ADMIN" | "USUARIO" | "TECNICO";
type UserStatus = "ACTIVO" | "INACTIVO";
type AuthProvider = "CREDENCIALES" | "GOOGLE" | "GITHUB" | "FACEBOOK";

interface Usuario {
  id: number;
  name?: string;
  email: string;
  dni: string;
  password?: string;
  provider?: AuthProvider;
  providerId?: string;
  role: UserRole;
  status: UserStatus;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  lastLogin?: string | Date | null;
  emailVerified?: boolean;
  avatarUrl?: string | null;
}

interface UsuariosResponse {
  count: number;
  next: string;
  previous: string;
  results: Usuario[];
}

export { Usuario, UsuariosResponse, UserRole, UserStatus, AuthProvider };