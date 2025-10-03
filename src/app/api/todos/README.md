# Todo API

此目錄包含 Next.js Todo List 應用程式的待辦事項 API 端點。

## 端點

### GET `/api/todos`

獲取用戶的待辦事項列表，支援分頁、排序和篩選。

**查詢參數：**

- `page` (可選): 頁碼，預設為 1
- `limit` (可選): 每頁項目數，預設為 10
- `sortBy` (可選): 排序欄位 (createdAt, title, priority, deadline, isDone)，預設為 createdAt
- `sortOrder` (可選): 排序順序 (asc, desc)，預設為 desc
- `priority` (可選): 優先級篩選 (LOW, MEDIUM, HIGH)
- `isDone` (可選): 完成狀態篩選 (true, false)
- `search` (可選): 搜尋關鍵字（標題或描述）
- `deadlineFrom` (可選): 截止日期開始範圍 (ISO 日期字串)
- `deadlineTo` (可選): 截止日期結束範圍 (ISO 日期字串)

**回應：**

- **200 OK**: 待辦事項列表
  ```json
  {
    "data": [
      {
        "id": "todo_id",
        "title": "待辦事項標題",
        "description": "描述",
        "priority": "MEDIUM",
        "deadline": "2024-01-01T00:00:00.000Z",
        "isDone": false,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
  ```
- **401 Unauthorized**: 未驗證
- **500 Internal Server Error**: 伺服器錯誤

### POST `/api/todos`

創建新的待辦事項。

**請求主體：**

```json
{
  "title": "待辦事項標題",
  "description": "描述（可選）",
  "priority": "MEDIUM", // LOW, MEDIUM, HIGH，預設為 MEDIUM
  "deadline": "2024-01-01T00:00:00.000Z" // 可選
}
```

**回應：**

- **201 Created**: 創建成功
  ```json
  {
    "id": "todo_id",
    "title": "待辦事項標題",
    "description": "描述",
    "priority": "MEDIUM",
    "deadline": "2024-01-01T00:00:00.000Z",
    "isDone": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
  ```
- **400 Bad Request**: 缺少必要欄位或格式錯誤
- **401 Unauthorized**: 未驗證
- **500 Internal Server Error**: 伺服器錯誤

### GET `/api/todos/[id]`

獲取單個待辦事項。

**回應：**

- **200 OK**: 待辦事項詳情
  ```json
  {
    "id": "todo_id",
    "title": "待辦事項標題",
    "description": "描述",
    "priority": "MEDIUM",
    "deadline": "2024-01-01T00:00:00.000Z",
    "isDone": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
  ```
- **401 Unauthorized**: 未驗證
- **404 Not Found**: 待辦事項不存在
- **500 Internal Server Error**: 伺服器錯誤

### PUT `/api/todos/[id]`

更新待辦事項。

**請求主體：**

```json
{
  "title": "更新的標題（可選）",
  "description": "更新的描述（可選）",
  "priority": "HIGH", // LOW, MEDIUM, HIGH（可選）
  "deadline": "2024-01-01T00:00:00.000Z", // 可選，設為 null 清除
  "isDone": true // 可選
}
```

**回應：**

- **200 OK**: 更新成功
  ```json
  {
    "id": "todo_id",
    "title": "更新的標題",
    "description": "更新的描述",
    "priority": "HIGH",
    "deadline": "2024-01-01T00:00:00.000Z",
    "isDone": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
  ```
- **400 Bad Request**: 欄位格式錯誤
- **401 Unauthorized**: 未驗證
- **404 Not Found**: 待辦事項不存在
- **500 Internal Server Error**: 伺服器錯誤

### DELETE `/api/todos/[id]`

刪除待辦事項。

**回應：**

- **200 OK**: 刪除成功
  ```json
  {
    "message": "Todo deleted successfully"
  }
  ```
- **401 Unauthorized**: 未驗證
- **404 Not Found**: 待辦事項不存在
- **500 Internal Server Error**: 伺服器錯誤

### POST `/api/todos/bulk`

批量操作待辦事項。

**請求主體：**

```json
{
  "action": "markComplete", // markComplete, markIncomplete, delete
  "todoIds": ["todo_id_1", "todo_id_2", "todo_id_3"]
}
```

**支援的操作：**

- `markComplete`: 標記為完成
- `markIncomplete`: 標記為未完成
- `delete`: 刪除

**回應：**

- **200 OK**: 批量操作成功
  ```json
  {
    "message": "Bulk markComplete completed",
    "affectedCount": 3
  }
  ```
- **400 Bad Request**: 無效的操作或待辦事項不存在
- **401 Unauthorized**: 未驗證
- **500 Internal Server Error**: 伺服器錯誤

### GET `/api/todos/stats`

獲取待辦事項統計資訊。

**查詢參數：**

- `period` (可選): 統計期間 (all, week, month)，預設為 all

**回應：**

- **200 OK**: 統計資訊
  ```json
  {
    "period": "all",
    "total": 25,
    "completed": 15,
    "pending": 10,
    "overdue": 3,
    "completionRate": 60.0,
    "priorityBreakdown": {
      "low": 5,
      "medium": 15,
      "high": 5
    },
    "recentTodos": [
      {
        "id": "todo_id",
        "title": "最近的待辦事項",
        "priority": "HIGH",
        "isDone": false,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
  ```
- **401 Unauthorized**: 未驗證
- **500 Internal Server Error**: 伺服器錯誤

## 功能特色

- **分頁支援**: 支援分頁查詢，可自訂每頁項目數
- **排序功能**: 支援多欄位排序（創建時間、標題、優先級、截止日期、完成狀態）
- **篩選功能**: 支援優先級、完成狀態、搜尋關鍵字、日期範圍篩選
- **批量操作**: 支援批量標記完成/未完成、批量刪除
- **統計分析**: 提供完成率、優先級分布、逾期統計等分析
- **權限控制**: 所有操作都需要身份驗證，用戶只能操作自己的待辦事項
- **輸入驗證**: 全面的輸入驗證和錯誤處理
- **TypeScript**: 完全使用 TypeScript 類型化

## 資料模型

### Todo 欄位

- `id`: 唯一識別碼
- `title`: 標題（必填）
- `description`: 描述（可選）
- `priority`: 優先級 (LOW, MEDIUM, HIGH)
- `deadline`: 截止日期（可選）
- `isDone`: 完成狀態 (boolean)
- `createdAt`: 創建時間
- `updatedAt`: 更新時間
- `userId`: 所屬用戶 ID

## 使用範例

```typescript
// 獲取待辦事項列表（分頁、排序、篩選）
const todosResponse = await fetch(
  '/api/todos?page=1&limit=10&sortBy=priority&sortOrder=asc&priority=HIGH&isDone=false'
);

// 創建新待辦事項
const createResponse = await fetch('/api/todos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: '完成專案報告',
    description: '撰寫本週專案進度報告',
    priority: 'HIGH',
    deadline: '2024-01-15T23:59:59.000Z',
  }),
});

// 更新待辦事項
const updateResponse = await fetch('/api/todos/todo_id', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    isDone: true,
    priority: 'LOW',
  }),
});

// 批量標記完成
const bulkResponse = await fetch('/api/todos/bulk', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    action: 'markComplete',
    todoIds: ['todo_id_1', 'todo_id_2'],
  }),
});

// 獲取統計資訊
const statsResponse = await fetch('/api/todos/stats?period=week');

// 刪除待辦事項
const deleteResponse = await fetch('/api/todos/todo_id', {
  method: 'DELETE',
});
```

## 安全性

- 所有端點都需要身份驗證
- 用戶只能存取和操作自己的待辦事項
- 輸入驗證防止注入攻擊
- 適當的錯誤訊息，不暴露敏感資訊
- 支援批量操作的安全驗證
