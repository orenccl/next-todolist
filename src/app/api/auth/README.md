# 身份驗證 API

此目錄包含 Next.js Todo List 應用程式的身份驗證 API 端點。

## 端點

### POST `/api/auth/register`

註冊新用戶帳戶。

**請求主體：**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe" // 可選
}
```

**回應：**

- **200 OK**: 註冊成功
  ```json
  {
    "success": true,
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
  ```
- **400 Bad Request**: 缺少必要欄位
- **409 Conflict**: 用戶已存在
- **500 Internal Server Error**: 伺服器錯誤

### POST `/api/auth/login`

驗證用戶並建立會話。

**請求主體：**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**回應：**

- **200 OK**: 登入成功
  ```json
  {
    "success": true,
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
  ```
- **400 Bad Request**: 缺少必要欄位
- **401 Unauthorized**: 憑證無效
- **500 Internal Server Error**: 伺服器錯誤

### GET `/api/auth/me`

從會話中獲取當前用戶資訊。

**回應：**

- **200 OK**: 用戶資訊
  ```json
  {
    "success": true,
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
  ```
- **401 Unauthorized**: 未驗證
- **500 Internal Server Error**: 伺服器錯誤

### POST `/api/auth/logout`

登出用戶並清除會話。

**回應：**

- **200 OK**: 登出成功
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```
- **500 Internal Server Error**: 伺服器錯誤

## 功能特色

- **密碼雜湊**: 使用 bcrypt 安全地雜湊密碼
- **會話管理**: 使用安全 cookie 管理用戶會話
- **輸入驗證**: 所有端點都驗證必要欄位
- **錯誤處理**: 全面的錯誤處理與適當的 HTTP 狀態碼
- **TypeScript**: 完全使用 TypeScript 類型化，提供更好的開發體驗

## 安全性

- 密碼在儲存前使用 bcrypt 進行雜湊
- 會話資料安全地儲存在 HTTP-only cookie 中
- 輸入驗證防止注入攻擊
- 適當的錯誤訊息，不暴露敏感資訊

## 依賴項目

- `@/lib/prisma`: 資料庫連接
- `@/lib/session`: 會話管理工具
- `@/lib/password`: 密碼雜湊工具
- `next/server`: Next.js 伺服器工具

## 使用範例

```typescript
// 註冊新用戶
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    name: 'John Doe',
  }),
});

// 登入
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
  }),
});

// 獲取當前用戶
const userResponse = await fetch('/api/auth/me');

// 登出
const logoutResponse = await fetch('/api/auth/logout', {
  method: 'POST',
});
```
