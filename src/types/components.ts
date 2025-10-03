import { UserPublic } from './auth';

// 登入表單 Props
export interface LoginFormProps {
  onLogin: (user: UserPublic) => void;
}

// 註冊表單 Props
export interface RegisterFormProps {
  onRegister: (user: UserPublic) => void;
}

// 用戶資訊 Props
export interface UserInfoProps {
  user: UserPublic;
  onLogout: () => void;
}
