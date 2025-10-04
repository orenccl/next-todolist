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

export default function TodoList() {
  const [todos, setTodos] = useState<TodoItemType[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItemType | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  /**
   * 樂觀更新狀態管理
   * 追蹤正在進行的樂觀更新操作
   */
  const [optimisticUpdates, setOptimisticUpdates] = useState<{
    [key: string]: {
      type: 'toggle' | 'delete' | 'create' | 'update';
      originalData?: TodoItemType;
      pendingData?: Partial<TodoItemType>;
    };
  }>({});

  /**
   * 篩選和分頁狀態
   */
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    priority: 'ALL',
    isDone: 'ALL',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0,
  });

  /**
   * 檢查認證狀態
   * @returns {Promise<boolean>} 是否已認證
   */
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsAuthenticated(true);
          setCurrentUserId(data.user.id);
          return true;
        }
      }
      setIsAuthenticated(false);
      setCurrentUserId(null);
      return false;
    } catch {
      setIsAuthenticated(false);
      setCurrentUserId(null);
      return false;
    }
  };

  /**
   * 載入待辦事項
   * 根據當前篩選條件和分頁設定載入待辦事項列表
   */
  const loadTodos = useCallback(async () => {
    try {
      setDataLoading(true);
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
      setDataLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  // 初始載入
  useEffect(() => {
    const initialize = async () => {
      const auth = await checkAuth();
      if (auth) {
        // 認證成功，開始載入資料
        loadTodos();
      } else {
        // 未認證，停止資料載入
        setDataLoading(false);
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
        // 用戶剛剛登入，重新載入待辦事項
        setDataLoading(true);
        loadTodos();
      }
    };

    window.addEventListener('authStateChanged', handleAuthChange);

    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, [isAuthenticated, loadTodos]);

  /**
   * 建立新待辦事項 - 樂觀更新版本
   * @param {Omit<TodoFormState, 'isDone'>} formData - 表單數據
   */
  const handleCreateTodo = async (formData: Omit<TodoFormState, 'isDone'>) => {
    // 1. 立即在 UI 中顯示新待辦事項（樂觀更新）
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const optimisticTodo: TodoItemType = {
      id: tempId,
      title: formData.title,
      description: formData.description || '',
      priority: formData.priority,
      deadline: formData.deadline ? new Date(formData.deadline) : null,
      isDone: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: currentUserId || 'temp-user', // 使用當前用戶 ID
    };

    // 保存樂觀更新狀態
    setOptimisticUpdates(prev => ({
      ...prev,
      [tempId]: {
        type: 'create',
        pendingData: optimisticTodo,
      },
    }));

    // 立即添加到本地狀態
    setTodos(prevTodos => [optimisticTodo, ...prevTodos]);

    // 更新分頁總數
    setPagination(prev => ({
      ...prev,
      total: prev.total + 1,
    }));

    // 關閉表單
    setShowForm(false);

    try {
      // 2. 發送請求到服務器
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

      await response.json();

      // 3. 成功後重新載入數據以確保分頁正確
      loadTodos();

      // 清除樂觀更新狀態
      setOptimisticUpdates(prev => {
        const newState = { ...prev };
        delete newState[tempId];
        return newState;
      });
    } catch (err) {
      // 4. 失敗時移除臨時待辦事項
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== tempId));

      // 恢復分頁總數
      setPagination(prev => ({
        ...prev,
        total: prev.total - 1,
      }));

      // 清除樂觀更新狀態
      setOptimisticUpdates(prev => {
        const newState = { ...prev };
        delete newState[tempId];
        return newState;
      });

      setError(err instanceof Error ? err.message : 'Failed to create todo');

      // 重新顯示表單讓用戶重試
      setShowForm(true);
    }
  };

  /**
   * 更新待辦事項
   * @param {string} id - 待辦事項 ID
   * @param {Partial<TodoFormState>} updates - 更新數據
   */
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update todo');
      }

      // 等待伺服器回應後重新載入資料
      await loadTodos();
      setEditingTodo(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo');
      console.error('Update todo failed:', err);
    }
  };

  /**
   * 切換完成狀態 - 樂觀更新版本
   * @param {string} id - 待辦事項 ID
   * @param {boolean} isDone - 是否完成
   */
  const handleToggleTodo = async (id: string, isDone: boolean) => {
    // 1. 立即更新 UI（樂觀更新）
    const originalTodo = todos.find(todo => todo.id === id);
    if (!originalTodo) return;

    // 保存原始數據用於回滾
    setOptimisticUpdates(prev => ({
      ...prev,
      [id]: {
        type: 'toggle',
        originalData: originalTodo,
        pendingData: { isDone },
      },
    }));

    // 立即更新本地狀態
    setTodos(prevTodos =>
      prevTodos.map(todo => (todo.id === id ? { ...todo, isDone } : todo))
    );

    try {
      // 2. 發送請求到服務器
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isDone }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to toggle todo');
      }

      // 3. 成功後清除樂觀更新狀態並重新載入數據
      setOptimisticUpdates(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });

      // 重新載入數據以確保統計數據同步
      loadTodos();
    } catch (err) {
      // 4. 失敗時回滾到原始狀態
      setTodos(prevTodos =>
        prevTodos.map(todo => (todo.id === id ? originalTodo : todo))
      );

      // 清除樂觀更新狀態
      setOptimisticUpdates(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });

      setError(err instanceof Error ? err.message : 'Failed to toggle todo');
      console.error('Toggle todo failed:', err);
    }
  };

  /**
   * 刪除待辦事項 - 樂觀更新版本
   * @param {string} id - 待辦事項 ID
   */
  const handleDeleteTodo = async (id: string) => {
    // 1. 立即從 UI 中移除（樂觀更新）
    const originalTodo = todos.find(todo => todo.id === id);
    if (!originalTodo) return;

    // 保存原始數據用於回滾
    setOptimisticUpdates(prev => ({
      ...prev,
      [id]: {
        type: 'delete',
        originalData: originalTodo,
      },
    }));

    // 立即從本地狀態中移除
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));

    // 更新分頁總數
    setPagination(prev => ({
      ...prev,
      total: prev.total - 1,
    }));

    try {
      // 2. 發送請求到服務器
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete todo');
      }

      // 3. 成功後清除樂觀更新狀態
      setOptimisticUpdates(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });

      // 刪除成功後，立即重新載入數據以確保狀態一致
      loadTodos();
    } catch (err) {
      // 4. 失敗時恢復原始狀態
      setTodos(prevTodos => {
        // 將原始待辦事項重新插入到正確位置
        const newTodos = [...prevTodos];
        const insertIndex = newTodos.findIndex(
          todo => new Date(todo.createdAt) > new Date(originalTodo.createdAt)
        );

        if (insertIndex === -1) {
          newTodos.push(originalTodo);
        } else {
          newTodos.splice(insertIndex, 0, originalTodo);
        }

        return newTodos;
      });

      // 恢復分頁總數
      setPagination(prev => ({
        ...prev,
        total: prev.total + 1,
      }));

      // 清除樂觀更新狀態
      setOptimisticUpdates(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });

      setError(err instanceof Error ? err.message : 'Failed to delete todo');
      console.error('Delete todo failed:', err);
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
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            ⚡ 快速操作
          </h3>
          <p className="text-sm text-gray-600">快速新增和管理您的待辦事項</p>
        </div>
        <div className="flex items-center justify-end">
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
              description: editingTodo.description || undefined,
              deadline: editingTodo.deadline
                ? new Date(editingTodo.deadline).toISOString().split('T')[0]
                : undefined,
            }}
            isEditing={true}
          />
        </div>
      )}

      {/* Todo 列表容器 */}
      <div className="bg-white rounded-lg shadow-lg border p-6">
        {dataLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="text-lg text-gray-600">載入資料中...</span>
            </div>
          </div>
        ) : (
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
                  onEdit={setEditingTodo}
                  isOptimistic={!!optimisticUpdates[todo.id]}
                  optimisticType={optimisticUpdates[todo.id]?.type}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* 分頁 */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 bg-white rounded-lg shadow-lg border p-6">
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
