'use client';

import { useState } from 'react';
import { TodoItemProps } from '@/types/frontend';

const priorityColors = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-red-100 text-red-800',
};

const priorityLabels = {
  LOW: '低',
  MEDIUM: '中',
  HIGH: '高',
};

export default function TodoItem({
  todo,
  onUpdate,
  onDelete,
  onToggle,
}: TodoItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggle = async () => {
    await onToggle(todo.id, !todo.isDone);
  };

  const handleDelete = async () => {
    if (window.confirm('確定要刪除這個待辦事項嗎？')) {
      setIsDeleting(true);
      try {
        await onDelete(todo.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue =
    todo.deadline && new Date(todo.deadline) < new Date() && !todo.isDone;

  return (
    <div
      className={`p-4 border rounded-lg transition-all ${
        todo.isDone
          ? 'bg-gray-50 border-gray-200 opacity-75'
          : 'bg-white border-gray-300 hover:border-gray-400'
      } ${isDeleting ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* 完成狀態切換 */}
          <button
            onClick={handleToggle}
            className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              todo.isDone
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'border-gray-300 hover:border-indigo-500'
            }`}
          >
            {todo.isDone && (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          <div className="flex-1 min-w-0">
            {/* 標題 */}
            <h3
              className={`text-lg font-medium ${
                todo.isDone ? 'line-through text-gray-500' : 'text-gray-900'
              }`}
            >
              {todo.title}
            </h3>

            {/* 描述 */}
            {todo.description && (
              <p
                className={`mt-1 text-sm ${
                  todo.isDone ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {todo.description}
              </p>
            )}

            {/* 標籤和日期 */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {/* 優先級標籤 */}
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  priorityColors[todo.priority]
                }`}
              >
                {priorityLabels[todo.priority]}
              </span>

              {/* 截止日期 */}
              {todo.deadline && (
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isOverdue
                      ? 'bg-red-100 text-red-800'
                      : todo.isDone
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  📅 {formatDate(todo.deadline)}
                  {isOverdue && ' (已逾期)'}
                </span>
              )}

              {/* 完成標籤 */}
              {todo.isDone && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✅ 已完成
                </span>
              )}
            </div>

            {/* 建立時間 */}
            <p className="mt-2 text-xs text-gray-400">
              建立於 {formatDate(todo.createdAt)}
              {new Date(todo.updatedAt).getTime() !==
                new Date(todo.createdAt).getTime() && (
                <span> • 更新於 {formatDate(todo.updatedAt)}</span>
              )}
            </p>
          </div>
        </div>

        {/* 操作按鈕 */}
        <div className="flex items-center space-x-2 ml-4">
          {/* 編輯按鈕 */}
          <button
            onClick={() => onUpdate(todo.id, {})}
            className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
            title="編輯"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>

          {/* 刪除按鈕 */}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
            title="刪除"
          >
            {isDeleting ? (
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
