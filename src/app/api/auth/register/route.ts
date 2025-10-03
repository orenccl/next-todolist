import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setSession } from '@/lib/session';
import { hashPassword } from '@/lib/password';
import { createInitialTodos } from '@/lib/initial-todos';
import { RegisterInput, AuthResponse } from '@/types/auth';

/**
 * 註冊
 * @param request 請求
 * @returns 註冊成功或失敗
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password, name }: RegisterInput = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // 檢查用戶是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // 加密密碼
    const hashedPassword = await hashPassword(password);

    // 創建新用戶
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name,
      },
    });

    // 設置 session
    await setSession({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    // 創建初始待辦事項
    const initialTodosCount = await createInitialTodos(user.id);

    const response: AuthResponse = {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };

    return NextResponse.json({
      ...response,
      initialTodosCount,
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
