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
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">歡迎回來！</h2>
      <div className="space-y-2">
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        {user.name && (
          <p>
            <strong>Name:</strong> {user.name}
          </p>
        )}
      </div>
      <button
        onClick={handleLogout}
        disabled={loading}
        className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
      >
        {loading ? '登出中...' : '登出'}
      </button>
    </div>
  );
}
