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
  onDelete,
  onToggle,
  onEdit,
  isOptimistic = false,
  optimisticType,
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

  // 樂觀更新狀態的視覺指示器
  const getOptimisticIndicator = () => {
    if (!isOptimistic) return null;

    const indicators = {
      toggle: {
        icon: '🔄',
        text: '更新中...',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
      },
      delete: {
        icon: '🗑️',
        text: '刪除中...',
        color: 'bg-red-100 text-red-800 border-red-200',
      },
      create: {
        icon: '➕',
        text: '建立中...',
        color: 'bg-green-100 text-green-800 border-green-200',
      },
      update: {
        icon: '✏️',
        text: '編輯中...',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      },
    };

    const indicator = indicators[optimisticType || 'toggle'];
    return (
      <div
        className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm border-2 ${indicator.color} animate-pulse`}
      >
        <span className="mr-1">{indicator.icon}</span>
        {indicator.text}
      </div>
    );
  };

  return (
    <div
      className={`p-6 border-2 rounded-lg shadow-lg transition-all duration-200 ${
        todo.isDone
          ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300 opacity-75'
          : todo.priority === 'HIGH'
            ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200 hover:border-red-300 hover:shadow-xl'
            : todo.priority === 'MEDIUM'
              ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 hover:border-yellow-300 hover:shadow-xl'
              : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:border-green-300 hover:shadow-xl'
      } ${isDeleting ? 'opacity-50' : ''} ${isOptimistic ? 'ring-2 ring-blue-300 ring-opacity-50' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* 完成狀態切換 */}
          <button
            onClick={handleToggle}
            className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg ${
              todo.isDone
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-500 text-white'
                : 'border-gray-400 hover:border-green-500 hover:bg-green-50'
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
              className={`text-xl font-semibold ${
                todo.isDone ? 'line-through text-gray-500' : 'text-gray-900'
              }`}
            >
              {todo.title}
            </h3>

            {/* 描述 */}
            {todo.description && (
              <p
                className={`mt-2 text-sm leading-relaxed ${
                  todo.isDone ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {todo.description}
              </p>
            )}

            {/* 標籤和日期 */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {/* 優先級標籤 */}
              <span
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ${
                  priorityColors[todo.priority]
                }`}
              >
                {todo.priority === 'HIGH' && '🔴 '}
                {todo.priority === 'MEDIUM' && '🟡 '}
                {todo.priority === 'LOW' && '🟢 '}
                {priorityLabels[todo.priority]}
              </span>

              {/* 截止日期 */}
              {todo.deadline && (
                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ${
                    isOverdue
                      ? 'bg-red-100 text-red-800 border-2 border-red-200'
                      : todo.isDone
                        ? 'bg-gray-100 text-gray-600 border-2 border-gray-200'
                        : 'bg-blue-100 text-blue-800 border-2 border-blue-200'
                  }`}
                >
                  📅 {formatDate(todo.deadline)}
                  {isOverdue && ' (已逾期)'}
                </span>
              )}

              {/* 完成標籤 */}
              {todo.isDone && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-800 border-2 border-green-200 shadow-sm">
                  ✅ 已完成
                </span>
              )}

              {/* 樂觀更新指示器 */}
              {getOptimisticIndicator()}
            </div>
          </div>
        </div>

        {/* 操作按鈕 */}
        <div className="flex items-center space-x-3 ml-6">
          {/* 編輯按鈕 */}
          <button
            onClick={() => onEdit?.(todo)}
            className="p-3 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            title="編輯"
          >
            <svg
              className="w-5 h-5"
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
            className="p-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
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
