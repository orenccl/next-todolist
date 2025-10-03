import { User } from '@prisma/client';

// 重新導出 Prisma 型別
export type { User };

// 用戶基礎型別（不包含敏感資訊）
export interface UserPublic {
  id: string;
  email: string;
  name?: string;
}

// 會話數據型別
export interface SessionData {
  userId: string;
  email: string;
  name?: string;
}

// 註冊輸入型別
export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

// 登入輸入型別
export interface LoginInput {
  email: string;
  password: string;
}

// Auth API 回應型別
export interface AuthResponse {
  success: boolean;
  user?: UserPublic;
  message?: string;
  error?: string;
}
