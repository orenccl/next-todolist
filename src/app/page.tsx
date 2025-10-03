'use client';

import { useState, useEffect } from 'react';
import AuthContainer from '@/components/AuthContainer';
import TodoList from '@/components/TodoList';
import UserPanel from '@/components/UserPanel';
import { UserPublic } from '@/types/auth';

export default function Home() {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<'todos' | 'profile'>('todos');

  // 檢查認證狀態
  useEffect(() => {
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
    checkAuth();
  }, []);

  const handleLogin = (userData: UserPublic) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (response.ok) {
        setUser(null);
        setCurrentPage('todos'); // 登出後回到待辦事項頁面
      }
    } catch (err) {
      console.error('Logout error:', err);
      // 即使 API 調用失敗，也清除本地狀態
      setUser(null);
      setCurrentPage('todos');
    }
  };

  const handlePageChange = (page: 'todos' | 'profile') => {
    setCurrentPage(page);
  };

  const handleTitleClick = () => {
    setCurrentPage('todos');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="text-lg text-gray-600">載入中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 導航欄 */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* 左側 - 標題和導航 */}
            <div className="flex items-center space-x-8">
              {/* 網站標題 */}
              <button
                onClick={handleTitleClick}
                className="text-2xl font-bold text-gray-900 hover:text-indigo-600 transition-colors"
              >
                待辦事項管理
              </button>

              {/* 導航選單 */}
              {user && (
                <div className="flex space-x-1">
                  <button
                    onClick={() => handlePageChange('todos')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentPage === 'todos'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    📝 待辦事項
                  </button>
                  <button
                    onClick={() => handlePageChange('profile')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentPage === 'profile'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    👤 個人面板
                  </button>
                </div>
              )}
            </div>

            {/* 右側 - 用戶區域 */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  {/* 用戶頭像和信息 */}
                  <div className="flex items-center space-x-3 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2 rounded-full border border-indigo-200">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                      {user.name
                        ? user.name.charAt(0).toUpperCase()
                        : user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        歡迎，{user.name || '用戶'} 👋
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-32">
                        {user.email}
                      </div>
                    </div>
                  </div>

                  {/* 登出按鈕 */}
                  <button
                    onClick={handleLogout}
                    className="group flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 border border-transparent hover:border-red-200"
                  >
                    <svg
                      className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span className="font-medium">登出</span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </nav>

      {/* 內容區域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user ? (
          <div className="flex justify-center items-center min-h-[60vh]">
            <AuthContainer onLogin={handleLogin} />
          </div>
        ) : currentPage === 'todos' ? (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                📝 我的待辦事項
              </h1>
              <p className="text-lg text-gray-600">
                管理您的任務，追蹤進度，提高生產力
              </p>
            </div>
            <TodoList />
          </div>
        ) : (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                👤 個人面板
              </h1>
              <p className="text-lg text-gray-600">
                查看您的統計數據和個人信息
              </p>
            </div>
            <UserPanel />
          </div>
        )}
      </div>
    </div>
  );
}
