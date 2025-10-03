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
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        {/* 篩選器 */}
        <TodoFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleResetFilters}
        />

        {/* 新增按鈕 */}
        <div className="mt-4">
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-md hover:shadow-lg"
          >
            ➕ 新增待辦事項
          </button>
        </div>
      </div>

      {/* 錯誤訊息 */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
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
            initialData={editingTodo}
            isEditing={true}
          />
        </div>
      )}

      {/* Todo 列表 */}
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
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
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

      {/* 分頁 */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center space-x-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="px-3 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            上一頁
          </button>

          <span className="px-3 py-2">
            第 {pagination.page} 頁，共 {pagination.totalPages} 頁
          </span>

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="px-3 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            下一頁
          </button>
        </div>
      )}
    </div>
  );
}
