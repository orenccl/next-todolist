import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'src/generated/**', // 忽略 Prisma 自動生成的檔案
    ],
  },
  {
    rules: {
      // 放寬一些過於嚴格的規則
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/no-this-alias': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      // 允許 console.log（開發時很有用）
      'no-console': 'off',
      // 允許 any 類型（有時是必要的）
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];

export default eslintConfig;
