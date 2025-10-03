import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

// GET /api/todos/stats - 獲取 todo 統計信息
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all'; // all, week, month

    // 構建日期篩選條件
    let dateFilter: any = {};
    if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter.gte = weekAgo;
    } else if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter.gte = monthAgo;
    }

    const baseWhere = {
      userId: session.userId,
      ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
    };

    // 並行執行多個統計查詢
    const [totalTodos, completedTodos, pendingTodos, overdueTodos, priorityStats, recentTodos] = await Promise.all([
      // 總數
      prisma.todo.count({ where: baseWhere }),

      // 已完成
      prisma.todo.count({
        where: { ...baseWhere, isDone: true },
      }),

      // 待完成
      prisma.todo.count({
        where: { ...baseWhere, isDone: false },
      }),

      // 逾期
      prisma.todo.count({
        where: {
          ...baseWhere,
          isDone: false,
          deadline: { lt: new Date() },
        },
      }),

      // 按優先級統計
      prisma.todo.groupBy({
        by: ['priority'],
        where: baseWhere,
        _count: true,
      }),

      // 最近創建的 todos
      prisma.todo.findMany({
        where: baseWhere,
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          priority: true,
          isDone: true,
          createdAt: true,
        },
      }),
    ]);

    // 計算完成率
    const completionRate = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

    // 格式化優先級統計
    const priorityBreakdown = priorityStats.reduce((acc, stat) => {
      acc[stat.priority.toLowerCase()] = stat._count;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      period,
      total: totalTodos,
      completed: completedTodos,
      pending: pendingTodos,
      overdue: overdueTodos,
      completionRate: Math.round(completionRate * 100) / 100,
      priorityBreakdown: {
        low: priorityBreakdown.low || 0,
        medium: priorityBreakdown.medium || 0,
        high: priorityBreakdown.high || 0,
      },
      recentTodos,
    });
  } catch (error) {
    console.error('Error fetching todo stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
