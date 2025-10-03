'use client';

import { TodoFiltersProps, Priority } from '@/types/frontend';

const priorityOptions: { value: Priority | 'ALL'; label: string }[] = [
  { value: 'ALL', label: '全部' },
  { value: 'LOW', label: '低' },
  { value: 'MEDIUM', label: '中' },
  { value: 'HIGH', label: '高' },
];

const statusOptions: {
  value: 'ALL' | 'PENDING' | 'COMPLETED';
  label: string;
}[] = [
  { value: 'ALL', label: '全部' },
  { value: 'PENDING', label: '未完成' },
  { value: 'COMPLETED', label: '已完成' },
];

const sortOptions: { value: string; label: string }[] = [
  { value: 'createdAt', label: '建立時間' },
  { value: 'updatedAt', label: '更新時間' },
  { value: 'deadline', label: '截止日期' },
  { value: 'priority', label: '優先級' },
  { value: 'title', label: '標題' },
];

export default function TodoFilters({
  filters,
  onFiltersChange,
  onReset,
}: TodoFiltersProps) {
  const handleChange = (field: keyof typeof filters, value: string) => {
    onFiltersChange({ [field]: value });
  };

  const hasActiveFilters =
    filters.search !== '' ||
    filters.priority !== 'ALL' ||
    filters.isDone !== 'ALL' ||
    filters.sortBy !== 'createdAt' ||
    filters.sortOrder !== 'desc';

  return (
    <div className="bg-white rounded-lg shadow-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-1">🔍 篩選與排序</h3>
          <p className="text-sm text-gray-600">使用篩選器快速找到您需要的任務</p>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm"
          >
            🔄 重置篩選
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 搜尋 */}
        <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
          <label
            htmlFor="search"
            className="block text-sm font-semibold text-blue-800 mb-2"
          >
            🔍 搜尋任務
          </label>
          <input
            type="text"
            id="search"
            value={filters.search}
            onChange={e => handleChange('search', e.target.value)}
            placeholder="搜尋任務標題或描述內容..."
            className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
          />
        </div>

        {/* 優先級 */}
        <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
          <label
            htmlFor="priority"
            className="block text-sm font-semibold text-yellow-800 mb-2"
          >
            ⚡ 優先級
          </label>
          <select
            id="priority"
            value={filters.priority}
            onChange={e => handleChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white text-gray-900"
          >
            {priorityOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 狀態 */}
        <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
          <label
            htmlFor="status"
            className="block text-sm font-semibold text-green-800 mb-2"
          >
            📊 狀態
          </label>
          <select
            id="status"
            value={filters.isDone}
            onChange={e => handleChange('isDone', e.target.value)}
            className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 排序 */}
        <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
          <label
            htmlFor="sortBy"
            className="block text-sm font-semibold text-purple-800 mb-2"
          >
            🔄 排序方式
          </label>
          <div className="flex space-x-2">
            <select
              id="sortBy"
              value={filters.sortBy}
              onChange={e => handleChange('sortBy', e.target.value)}
              className="flex-1 px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() =>
                handleChange(
                  'sortOrder',
                  filters.sortOrder === 'asc' ? 'desc' : 'asc'
                )
              }
              className="px-3 py-2 border border-purple-300 rounded-md hover:bg-purple-100 transition-colors bg-white"
              title={`目前為 ${filters.sortOrder === 'asc' ? '升序' : '降序'}，點擊切換排序方向`}
            >
              {filters.sortOrder === 'asc' ? (
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
                    d="M5 15l7-7 7 7"
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
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 活躍篩選標籤 */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.search && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              搜尋: {filters.search}
            </span>
          )}
          {filters.priority !== 'ALL' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              優先級:{' '}
              {
                priorityOptions.find(opt => opt.value === filters.priority)
                  ?.label
              }
            </span>
          )}
          {filters.isDone !== 'ALL' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              狀態:{' '}
              {statusOptions.find(opt => opt.value === filters.isDone)?.label}
            </span>
          )}
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            排序: {sortOptions.find(opt => opt.value === filters.sortBy)?.label}{' '}
            ({filters.sortOrder === 'asc' ? '升序' : '降序'})
          </span>
        </div>
      )}
    </div>
  );
}
