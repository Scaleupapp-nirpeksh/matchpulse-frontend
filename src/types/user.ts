export interface User {
  id: string;
  _id?: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  preferredSports?: string[];
  role: string;
  orgMemberships?: { orgId: string; role: string }[];
  privacySettings?: { showPhoto: boolean; showStats: boolean };
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
