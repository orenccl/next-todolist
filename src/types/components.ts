import { UserPublic } from './auth';

// 登入表單 Props
export interface LoginFormProps {
  onLogin: (user: UserPublic) => void;
}

// 註冊表單 Props
export interface RegisterFormProps {
  onRegister: (user: UserPublic) => void;
}
