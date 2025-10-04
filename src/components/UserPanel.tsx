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

export default function UserPanel() {
  const [stats, setStats] = useState<TodoStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('all');

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/todos/stats?period=${period}`);
      if (!response.ok) {
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
    fetchStats();
  }, [fetchStats]);

  const periodLabels = {
    all: '全部時間',
    week: '最近一週',
    month: '最近一個月',
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 時間範圍選擇卡片 */}
      <div className="bg-white rounded-lg shadow-lg border mb-6 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            🔍 時間範圍選擇
          </h3>
          <p className="text-sm text-gray-600">選擇要查看統計數據的時間範圍</p>
        </div>
        <div className="flex space-x-2">
          {(['all', 'week', 'month'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
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

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-gray-600">載入統計中...</span>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">
          <p>載入統計失敗: {error}</p>
          <button
            onClick={fetchStats}
            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            重試
          </button>
        </div>
      ) : stats ? (
        <div>
          {/* 主要統計卡片 */}
          <div className="bg-white rounded-lg shadow-lg border mb-6 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                📊 統計概覽
              </h3>
              <p className="text-sm text-gray-600">
                查看您的任務統計數據和完成情況
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-100 p-4 rounded-lg border-2 border-blue-200">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">📝</div>
                  <div>
                    <p className="text-sm text-blue-700 font-semibold">
                      總任務
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {stats.total}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-100 p-4 rounded-lg border-2 border-green-200">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">✅</div>
                  <div>
                    <p className="text-sm text-green-700 font-semibold">
                      已完成
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {stats.completed}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-100 p-4 rounded-lg border-2 border-yellow-200">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">⏳</div>
                  <div>
                    <p className="text-sm text-yellow-700 font-semibold">
                      待完成
                    </p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {stats.pending}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-red-100 p-4 rounded-lg border-2 border-red-200">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">⚠️</div>
                  <div>
                    <p className="text-sm text-red-700 font-semibold">逾期</p>
                    <p className="text-2xl font-bold text-red-900">
                      {stats.overdue}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 完成率和優先級分佈卡片 */}
          <div className="bg-white rounded-lg shadow-lg border mb-6 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                📈 詳細分析
              </h3>
              <p className="text-sm text-gray-600">
                查看完成率和優先級分佈情況
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          </div>

          {/* 最近任務卡片 */}
          {stats.recentTodos.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg border mb-6 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  🕒 最近任務
                </h3>
                <p className="text-sm text-gray-600">
                  查看您最近的任務活動記錄
                </p>
              </div>
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
      ) : null}
    </div>
  );
}
