import { Priority, TodoResponse } from './todo';

// 前端專用的 Todo 型別
export interface TodoItem extends TodoResponse {
  // 可以添加前端特有的屬性
  isEditing?: boolean;
  isDeleting?: boolean;
}

// Todo 表單狀態
export interface TodoFormState {
  title: string;
  description: string;
  priority: Priority;
  deadline: string;
  isDone: boolean;
}

// 篩選狀態
export interface FilterState {
  search: string;
  priority: Priority | 'ALL';
  isDone: 'ALL' | 'PENDING' | 'COMPLETED';
  sortBy: 'createdAt' | 'updatedAt' | 'deadline' | 'priority' | 'title';
  sortOrder: 'asc' | 'desc';
}

// 分頁狀態
export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// TodoList 組件 Props（目前不需要額外的 props）
// export interface TodoListProps {
//   // 可以根據需要擴展
// }

// TodoItem 組件 Props
export interface TodoItemProps {
  todo: TodoItem;
  onUpdate: (id: string, updates: Partial<TodoFormState>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggle: (id: string, isDone: boolean) => Promise<void>;
}

// TodoForm 組件 Props
export interface TodoFormProps {
  onSubmit: (data: Omit<TodoFormState, 'isDone'>) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<TodoFormState>;
  isEditing?: boolean;
}

// TodoFilters 組件 Props
export interface TodoFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  onReset: () => void;
}
