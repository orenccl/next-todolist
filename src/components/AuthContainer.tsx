'use client';

import { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import UserInfo from './UserInfo';
import { UserPublic } from '@/types/auth';

export default function AuthContainer() {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
        }
      }
    } catch (err) {
      console.error('Auth check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData: UserPublic) => {
    setUser(userData);
    // 觸發認證狀態變化事件
    window.dispatchEvent(new CustomEvent('authStateChanged'));
  };

  const handleLogout = () => {
    setUser(null);
    // 觸發認證狀態變化事件
    window.dispatchEvent(new CustomEvent('authStateChanged'));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
          <span className="text-lg text-gray-600">載入中...</span>
        </div>
      </div>
    );
  }

  if (user) {
    return <UserInfo user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-lg border">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {showRegister ? '🎉 加入我們' : '👋 歡迎回來'}
          </h2>
          <p className="text-gray-600">
            {showRegister
              ? '建立帳戶，開始管理您的待辦事項'
              : '登入您的帳戶，繼續管理任務'}
          </p>
        </div>

        <div className="mb-6">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setShowRegister(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !showRegister
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              登入
            </button>
            <button
              onClick={() => setShowRegister(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
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
