-- 首先更新所有現有的 NULL name 值為預設值
UPDATE "User" SET "name" = 'User' WHERE "name" IS NULL;

-- 然後將 name 欄位改為 NOT NULL
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;
