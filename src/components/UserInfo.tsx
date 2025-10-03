'use client';

import { useState } from 'react';
import { UserInfoProps } from '@/types/components';

export default function UserInfo({ user, onLogout }: UserInfoProps) {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        onLogout();
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">👋</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {user.name ? `歡迎回來，${user.name}！` : '歡迎回來！'}
        </h2>
        <p className="text-gray-600">準備好管理您的待辦事項了嗎？</p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <span className="text-gray-500 w-16">📧</span>
            <span className="text-gray-700">{user.email}</span>
          </div>
          {user.name && (
            <div className="flex items-center">
              <span className="text-gray-500 w-16">👤</span>
              <span className="text-gray-700">{user.name}</span>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleLogout}
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
      >
        {loading ? '🔄 登出中...' : '🚪 登出'}
      </button>
    </div>
  );
}
