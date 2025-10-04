import { Priority, Todo } from '@prisma/client';

/**
 * 重新導出 Prisma 型別
 */
export type { Priority, Todo };

/**
 * 基礎 Todo 型別（不包含關聯）
 */
export type TodoBase = Omit<Todo, 'user'>;

/**
 * 建立 Todo 時的輸入型別
 */
export interface CreateTodoInput {
  title: string;
  description?: string | null;
  priority?: Priority;
  deadline?: Date | string | null;
  isDone?: boolean;
}

/**
 * 更新 Todo 時的輸入型別
 */
export interface UpdateTodoInput {
  title?: string;
  description?: string | null;
  priority?: Priority;
  deadline?: Date | string | null;
  isDone?: boolean;
}

/**
 * 初始 Todo 數據型別（用於建立初始數據）
 */
export interface InitialTodoData {
  title: string;
  description: string | null;
  priority: Priority;
  deadline: Date | null;
  isDone: boolean;
}

/**
 * API 回應型別
 */
export interface TodoResponse {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  deadline: Date | null;
  isDone: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

/**
 * 分頁回應型別
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 統計數據型別
 */
export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
  priorityDistribution: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
  };
  overdueCount: number;
}

/**
 * 批量操作型別
 */
export interface BulkActionInput {
  action: 'markComplete' | 'markIncomplete' | 'delete';
  todoIds: string[];
}

/**
 * 排序選項
 */
export type SortBy =
  | 'createdAt'
  | 'updatedAt'
  | 'deadline'
  | 'priority'
  | 'title';
export type SortOrder = 'asc' | 'desc';

/**
 * 篩選選項
 */
export interface TodoFilters {
  priority?: Priority;
  isDone?: boolean;
  deadline?: {
    from?: Date;
    to?: Date;
  };
}
