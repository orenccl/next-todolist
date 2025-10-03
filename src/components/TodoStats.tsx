'use client';

import { useState, useEffect, useCallback } from 'react';

interface TodoStatsData {
  period: string;
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
  priorityBreakdown: {
    low: number;
    medium: number;
    high: number;
  };
  recentTodos: Array<{
    id: string;
    title: string;
    priority: string;
    isDone: boolean;
    createdAt: string;
  }>;
}

interface TodoStatsProps {
  className?: string;
}

export default function TodoStats({ className = '' }: TodoStatsProps) {
  const [stats, setStats] = useState<TodoStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('all');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 檢查認證狀態
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsAuthenticated(true);
          return true;
        }
      }
      setIsAuthenticated(false);
      return false;
    } catch {
      setIsAuthenticated(false);
      return false;
    }
  };

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/todos/stats?period=${period}`);
      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
          return;
        }
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    const initialize = async () => {
      const auth = await checkAuth();
      if (auth) {
        fetchStats();
      } else {
        setLoading(false);
      }
    };
    initialize();
  }, [fetchStats]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated, fetchStats]);

  // 監聽認證狀態變化
  useEffect(() => {
    const handleAuthChange = async () => {
      const auth = await checkAuth();
      if (auth && !isAuthenticated) {
        fetchStats();
      }
    };

    window.addEventListener('authStateChanged', handleAuthChange);

    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, [isAuthenticated, fetchStats]);

  if (!isAuthenticated) {
    return null; // 未登入時不顯示統計
  }

  if (loading) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-gray-600">載入統計中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
        <div className="text-center text-red-600">
          <p>載入統計失敗: {error}</p>
          <button
            onClick={fetchStats}
            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            重試
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const periodLabels = {
    all: '全部時間',
    week: '最近一週',
    month: '最近一個月',
  };

  return (
    <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
      {/* 標題和時間選擇 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">📊 統計概覽</h2>
        <div className="flex space-x-2">
          {(['all', 'week', 'month'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {/* 主要統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* 總數 */}
        <div className="bg-blue-100 p-4 rounded-lg border-2 border-blue-200">
          <div className="flex items-center">
            <div className="text-3xl mr-3">📝</div>
            <div>
              <p className="text-sm text-blue-700 font-semibold">總任務</p>
              <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
            </div>
          </div>
        </div>

        {/* 已完成 */}
        <div className="bg-green-100 p-4 rounded-lg border-2 border-green-200">
          <div className="flex items-center">
            <div className="text-3xl mr-3">✅</div>
            <div>
              <p className="text-sm text-green-700 font-semibold">已完成</p>
              <p className="text-3xl font-bold text-green-900">
                {stats.completed}
              </p>
            </div>
          </div>
        </div>

        {/* 待完成 */}
        <div className="bg-yellow-100 p-4 rounded-lg border-2 border-yellow-200">
          <div className="flex items-center">
            <div className="text-3xl mr-3">⏳</div>
            <div>
              <p className="text-sm text-yellow-700 font-semibold">待完成</p>
              <p className="text-3xl font-bold text-yellow-900">
                {stats.pending}
              </p>
            </div>
          </div>
        </div>

        {/* 逾期 */}
        <div className="bg-red-100 p-4 rounded-lg border-2 border-red-200">
          <div className="flex items-center">
            <div className="text-3xl mr-3">⚠️</div>
            <div>
              <p className="text-sm text-red-700 font-semibold">逾期</p>
              <p className="text-3xl font-bold text-red-900">{stats.overdue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 完成率和優先級分佈 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 完成率 */}
        <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            🎯 完成率
          </h3>
          <div className="flex items-center">
            <div className="flex-1">
              <div className="w-full bg-gray-300 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${stats.completionRate}%` }}
                ></div>
              </div>
            </div>
            <span className="ml-3 text-xl font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full">
              {stats.completionRate}%
            </span>
          </div>
        </div>

        {/* 優先級分佈 */}
        <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            ⚡ 優先級分佈
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-600 font-medium">
                🔴 高優先級
              </span>
              <span className="font-bold text-xl text-red-700 bg-red-50 px-3 py-1 rounded-full">
                {stats.priorityBreakdown?.high || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-yellow-600 font-medium">
                🟡 中優先級
              </span>
              <span className="font-bold text-xl text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full">
                {stats.priorityBreakdown?.medium || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-600 font-medium">
                🟢 低優先級
              </span>
              <span className="font-bold text-xl text-green-700 bg-green-50 px-3 py-1 rounded-full">
                {stats.priorityBreakdown?.low || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 最近任務 */}
      {stats.recentTodos.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            🕒 最近任務
          </h3>
          <div className="space-y-2">
            {stats.recentTodos.map(todo => (
              <div
                key={todo.id}
                className="flex items-center justify-between p-2 bg-white rounded-md"
              >
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      todo.priority === 'HIGH'
                        ? 'bg-red-500'
                        : todo.priority === 'MEDIUM'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                    }`}
                  ></span>
                  <span
                    className={`text-sm ${
                      todo.isDone
                        ? 'line-through text-gray-500'
                        : 'text-gray-900'
                    }`}
                  >
                    {todo.title}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(todo.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
