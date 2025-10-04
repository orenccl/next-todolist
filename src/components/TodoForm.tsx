'use client';

import { useState, useEffect, useRef } from 'react';
import { TodoFormProps } from '@/types/frontend';
import { Priority } from '@/types/todo';

const priorityOptions: { value: Priority; label: string }[] = [
  { value: 'LOW', label: '低' },
  { value: 'MEDIUM', label: '中' },
  { value: 'HIGH', label: '高' },
];

export default function TodoForm({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
}: TodoFormProps) {
  // 獲取明天的日期
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as Priority,
    deadline: getTomorrowDate(),
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const titleInputRef = useRef<HTMLInputElement>(null);

  // 初始化表單數據
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        priority: initialData.priority || 'MEDIUM',
        deadline: initialData.deadline
          ? new Date(initialData.deadline).toISOString().split('T')[0]
          : getTomorrowDate(),
      });
    }
  }, [initialData]);

  // 自動聚焦到標題輸入框
  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '標題是必填的';
    }

    if (!formData.deadline.trim()) {
      newErrors.deadline = '截止日期是必填的';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim() || '',
        deadline: new Date(formData.deadline).toISOString(),
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除該欄位的錯誤
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-300">
      <h2 className="text-xl font-semibold mb-4">
        {isEditing ? '✏️ 編輯待辦事項' : '➕ 新增待辦事項'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 標題 */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            標題 *
          </label>
          <input
            ref={titleInputRef}
            type="text"
            id="title"
            value={formData.title}
            onChange={e => handleChange('title', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="例如：完成專案報告、購買生活用品..."
            disabled={loading}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* 描述 */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            描述
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={e => handleChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
            placeholder="添加詳細說明、注意事項或相關資訊..."
            disabled={loading}
          />
        </div>

        {/* 優先級和截止日期 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 優先級 */}
          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              優先級
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={e => handleChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              disabled={loading}
            >
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 截止日期 */}
          <div>
            <label
              htmlFor="deadline"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              截止日期
            </label>
            <input
              type="date"
              id="deadline"
              value={formData.deadline}
              onChange={e => handleChange('deadline', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 ${
                errors.deadline ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.deadline && (
              <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>
            )}
          </div>
        </div>

        {/* 按鈕 */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            取消
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                處理中...
              </div>
            ) : isEditing ? (
              '更新'
            ) : (
              '建立'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
