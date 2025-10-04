'use client';

import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { UserPublic } from '@/types/auth';

interface AuthContainerProps {
  onLogin?: (user: UserPublic) => void;
}

export default function AuthContainer({ onLogin }: AuthContainerProps) {
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = (userData: UserPublic) => {
    // 觸發認證狀態變化事件
    window.dispatchEvent(new CustomEvent('authStateChanged'));
    // 調用父組件的登入回調
    if (onLogin) {
      onLogin(userData);
    }
  };

  return (
    <div className="w-80">
      <div className="bg-white p-4 rounded-lg shadow-lg border">
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            {showRegister ? '🎉 加入我們' : '👋 歡迎回來'}
          </h2>
          <p className="text-sm text-gray-600">
            {showRegister
              ? '建立帳戶，開始管理您的待辦事項'
              : '登入您的帳戶，繼續管理任務'}
          </p>
        </div>

        <div className="mb-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setShowRegister(false)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                !showRegister
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              登入
            </button>
            <button
              onClick={() => setShowRegister(true)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                showRegister
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              註冊
            </button>
          </div>
        </div>

        {showRegister ? (
          <RegisterForm onRegister={handleLogin} />
        ) : (
          <LoginForm onLogin={handleLogin} />
        )}
      </div>
    </div>
  );
}
