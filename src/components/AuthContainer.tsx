'use client';

import { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import UserInfo from './UserInfo';

interface User {
  id: string;
  email: string;
  name?: string;
}

export default function AuthContainer() {
  const [user, setUser] = useState<User | null>(null);
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

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">載入中...</div>
      </div>
    );
  }

  if (user) {
    return <UserInfo user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <button
            onClick={() => setShowRegister(false)}
            className={`px-4 py-2 mr-2 rounded-md ${
              !showRegister
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            登入
          </button>
          <button
            onClick={() => setShowRegister(true)}
            className={`px-4 py-2 rounded-md ${
              showRegister
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            註冊
          </button>
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
