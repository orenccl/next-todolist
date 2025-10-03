'use client';

import { useState, useEffect, useCallback } from 'react';
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';
import TodoFilters from './TodoFilters';
import {
  TodoItem as TodoItemType,
  FilterState,
  PaginationState,
  TodoFormState,
} from '@/types/frontend';
// import { Priority } from '@/types/todo';

export default function TodoList() {
  const [todos, setTodos] = useState<TodoItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItemType | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 篩選和分頁狀態
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    priority: 'ALL',
    isDone: 'ALL',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

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

  // 載入 todos
  const loadTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      if (filters.search) params.append('search', filters.search);
      if (filters.priority !== 'ALL')
        params.append('priority', filters.priority);
      if (filters.isDone !== 'ALL') {
        params.append(
          'isDone',
          filters.isDone === 'COMPLETED' ? 'true' : 'false'
        );
      }

      const response = await fetch(`/api/todos?${params}`);
      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
          return;
        }
        throw new Error('Failed to fetch todos');
      }

      const data = await response.json();
      setTodos(data.data);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  // 初始載入
  useEffect(() => {
    const initialize = async () => {
      const auth = await checkAuth();
      if (auth) {
        loadTodos();
      } else {
        setLoading(false);
      }
    };
    initialize();
  }, [loadTodos]);

  // 當篩選或分頁變更時重新載入
  useEffect(() => {
    if (isAuthenticated) {
      loadTodos();
    }
  }, [isAuthenticated, loadTodos]);

  // 監聽認證狀態變化
  useEffect(() => {
    const handleAuthChange = async () => {
      const auth = await checkAuth();
      if (auth && !isAuthenticated) {
        // 用戶剛剛登入，重新載入 todos
        loadTodos();
      }
    };

    // 監聽自定義事件
    window.addEventListener('authStateChanged', handleAuthChange);

    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, [isAuthenticated, loadTodos]);

  // 建立新 todo
  const handleCreateTodo = async (formData: Omit<TodoFormState, 'isDone'>) => {
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create todo');
      }

      setShowForm(false);
      loadTodos(); // 重新載入列表
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create todo');
    }
  };

  // 更新 todo
  const handleUpdateTodo = async (
    id: string,
    updates: Partial<TodoFormState>
  ) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update todo');
      }

      setEditingTodo(null);
      loadTodos(); // 重新載入列表
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo');
    }
  };

  // 切換完成狀態
  const handleToggleTodo = async (id: string, isDone: boolean) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isDone }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle todo');
      }

      loadTodos(); // 重新載入列表
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle todo');
    }
  };

  // 刪除 todo
  const handleDeleteTodo = async (id: string) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete todo');
      }

      loadTodos(); // 重新載入列表
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete todo');
    }
  };

  // 篩選變更
  const handleFiltersChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // 重置到第一頁
  };

  // 重置篩選
  const handleResetFilters = () => {
    setFilters({
      search: '',
      priority: 'ALL',
      isDone: 'ALL',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // 分頁變更
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  if (loading && todos.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">載入中...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔐</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">請先登入</h3>
        <p className="text-gray-500">登入後即可開始管理您的待辦事項</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 篩選器卡片 */}
      <div className="mb-6">
        <TodoFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleResetFilters}
        />
      </div>

      {/* 操作區域卡片 */}
      <div className="bg-white rounded-lg shadow-lg border mb-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              📝 待辦事項管理
            </h2>
            <p className="text-sm text-gray-600">
              管理您的任務，追蹤進度，提高生產力
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            ➕ 新增待辦事項
          </button>
        </div>
      </div>

      {/* 錯誤訊息 */}
      {error && (
        <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-2xl mr-3">⚠️</div>
            <div>
              <h3 className="text-sm font-semibold text-red-800">發生錯誤</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Todo 表單 */}
      {showForm && (
        <div className="mb-6">
          <TodoForm
            onSubmit={handleCreateTodo}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* 編輯表單 */}
      {editingTodo && (
        <div className="mb-6">
          <TodoForm
            onSubmit={data => handleUpdateTodo(editingTodo.id, data)}
            onCancel={() => setEditingTodo(null)}
            initialData={{
              ...editingTodo,
              description: editingTodo.description || undefined
            }}
            isEditing={true}
          />
        </div>
      )}

      {/* Todo 列表容器 */}
      <div className="bg-white rounded-lg shadow-lg border p-6">
        <div className="space-y-4">
          {todos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                還沒有待辦事項
              </h3>
              <p className="text-gray-500 mb-4">開始建立您的第一個任務吧！</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                ➕ 立即新增
              </button>
            </div>
          ) : (
            todos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onUpdate={handleUpdateTodo}
                onDelete={handleDeleteTodo}
                onToggle={handleToggleTodo}
              />
            ))
          )}
        </div>
      </div>

      {/* 分頁 */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 bg-white rounded-lg shadow-lg border p-4">
          <div className="flex justify-center items-center space-x-4">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors font-medium"
            >
              ← 上一頁
            </button>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">第</span>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-semibold">
                {pagination.page}
              </span>
              <span className="text-sm text-gray-600">頁，共</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-semibold">
                {pagination.totalPages}
              </span>
              <span className="text-sm text-gray-600">頁</span>
            </div>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors font-medium"
            >
              下一頁 →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
