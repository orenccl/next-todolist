import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

/**
 * 批量操作
 * @param request 請求
 * @returns 批量操作成功或失敗
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, todoIds } = body;

    if (!action || !Array.isArray(todoIds) || todoIds.length === 0) {
      return NextResponse.json({ error: 'Action and todoIds are required' }, { status: 400 });
    }

    // 驗證所有 todo 都屬於當前用戶
    const todos = await prisma.todo.findMany({
      where: {
        id: { in: todoIds },
        userId: session.userId,
      },
      select: { id: true },
    });

    if (todos.length !== todoIds.length) {
      return NextResponse.json({ error: 'Some todos not found or not accessible' }, { status: 400 });
    }

    let result;
    switch (action) {
      case 'markComplete':
        result = await prisma.todo.updateMany({
          where: { id: { in: todoIds } },
          data: { isDone: true },
        });
        break;

      case 'markIncomplete':
        result = await prisma.todo.updateMany({
          where: { id: { in: todoIds } },
          data: { isDone: false },
        });
        break;

      case 'delete':
        result = await prisma.todo.deleteMany({
          where: { id: { in: todoIds } },
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: markComplete, markIncomplete, delete' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      message: `Bulk ${action} completed`,
      affectedCount: result.count,
    });
  } catch (error) {
    console.error('Error in bulk operation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
