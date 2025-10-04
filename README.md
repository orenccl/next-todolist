# Next.js Todo List 應用程式

一個功能完整的待辦事項管理應用程式，使用 Next.js 15、TypeScript、Prisma 和 PostgreSQL 建構。

🌐 **線上預覽**: [https://next-todolist-zeta.vercel.app/](https://next-todolist-zeta.vercel.app/)

## 🚀 功能特色

### 身份驗證系統

- 用戶註冊和登入
- 安全的密碼雜湊（bcrypt）
- 會話管理
- 身份驗證保護

### 待辦事項管理

- 創建、讀取、更新、刪除待辦事項
- 優先級設定（低、中、高）
- 截止日期管理
- 完成狀態追蹤
- 搜尋和篩選功能
- 分頁支援

### 統計分析

- 完成率統計
- 優先級分布分析
- 逾期項目追蹤
- 時間範圍統計（週、月、全部）

## 🛠️ 技術堆疊

- **前端框架**: Next.js 15 (App Router)
- **程式語言**: TypeScript
- **資料庫**: PostgreSQL + Prisma ORM
- **身份驗證**: 自訂會話管理
- **密碼安全**: bcrypt
- **樣式**: Tailwind CSS v4
- **部署**: Vercel

## 📁 專案結構

```
src/
├── app/
│   ├── api/
│   │   ├── auth/           # 身份驗證 API
│   │   │   ├── login/
│   │   │   ├── logout/
│   │   │   ├── register/
│   │   │   └── me/
│   │   └── todos/          # 待辦事項 API
│   │       ├── [id]/
│   │       └── stats/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/             # React 組件
├── lib/                    # 工具函數
│   ├── prisma.ts          # 資料庫連接
│   ├── session.ts         # 會話管理
│   └── password.ts        # 密碼處理
├── types/                 # TypeScript 類型定義
└── shared/               # 共享資源
```

## 🚀 快速開始

### 環境需求

- Node.js 18+
- npm/yarn/pnpm

### 安裝依賴

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 資料庫設定

1. 初始化 Prisma：

```bash
npx prisma generate
npx prisma db push
```

2. （可選）查看資料庫：

```bash
npx prisma studio
```

### 啟動開發伺服器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

開啟 [http://localhost:3000](http://localhost:3000) 查看應用程式。

## 📚 API 文檔

### 身份驗證 API

- `POST /api/auth/register` - 用戶註冊
- `POST /api/auth/login` - 用戶登入
- `GET /api/auth/me` - 獲取當前用戶資訊
- `POST /api/auth/logout` - 用戶登出

詳細文檔請參考：[身份驗證 API 文檔](./src/app/api/auth/README.md)

### 待辦事項 API

- `GET /api/todos` - 獲取待辦事項列表
- `POST /api/todos` - 創建新待辦事項
- `GET /api/todos/[id]` - 獲取單個待辦事項
- `PUT /api/todos/[id]` - 更新待辦事項
- `DELETE /api/todos/[id]` - 刪除待辦事項
- `GET /api/todos/stats` - 獲取統計資訊

詳細文檔請參考：[待辦事項 API 文檔](./src/app/api/todos/README.md)

## 🔧 開發

### 資料庫遷移

```bash
# 創建新的遷移
npx prisma migrate dev --name migration_name

# 重置資料庫
npx prisma migrate reset
```

### 程式碼檢查

```bash
npm run lint
```

### 建構生產版本

```bash
npm run build
```

## 🚀 部署

### Vercel 部署

1. 將專案推送到 GitHub
2. 在 [Vercel](https://vercel.com) 連接 GitHub 倉庫
3. 設定環境變數（如需要）
4. 自動部署完成

### 環境變數

創建 `.env.local` 檔案：

```env
DATABASE_URL="postgresql://username:password@localhost:5432/todolist"
```

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 授權

MIT License

## 🔗 相關連結

- [Next.js 文檔](https://nextjs.org/docs)
- [Prisma 文檔](https://www.prisma.io/docs)
- [TypeScript 文檔](https://www.typescriptlang.org/docs)
