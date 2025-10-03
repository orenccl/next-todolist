import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { Priority, Prisma } from '@prisma/client';

/**
 * 獲取 todos
 * @param request 請求
 * @returns 獲取 todos
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // 分頁參數
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // 排序參數
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // 篩選參數
    const priority = searchParams.get('priority') as Priority | null;
    const isDone = searchParams.get('isDone');
    const search = searchParams.get('search');
    const deadlineFrom = searchParams.get('deadlineFrom');
    const deadlineTo = searchParams.get('deadlineTo');

    // 構建查詢條件
    const where: Prisma.TodoWhereInput = {
      userId: session.userId,
    };

    if (priority) {
      where.priority = priority;
    }

    if (isDone !== null && isDone !== undefined) {
      where.isDone = isDone === 'true';
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (deadlineFrom || deadlineTo) {
      where.deadline = {};
      if (deadlineFrom) {
        where.deadline.gte = new Date(deadlineFrom);
      }
      if (deadlineTo) {
        where.deadline.lte = new Date(deadlineTo);
      }
    }

    // 構建排序條件
    const validSortFields = [
      'createdAt',
      'title',
      'priority',
      'deadline',
      'isDone',
    ];
    const orderBy: Prisma.TodoOrderByWithRelationInput = {};

    if (validSortFields.includes(sortBy)) {
      orderBy[sortBy as keyof Prisma.TodoOrderByWithRelationInput] =
        sortOrder as 'asc' | 'desc';
    }

    // 執行查詢
    const [todos, total] = await Promise.all([
      prisma.todo.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.todo.count({ where }),
    ]);

    // 計算分頁信息
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      data: todos,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * 創建新的 todo
 * @param request 請求
 * @returns 創建新的 todo
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, priority, deadline } = body;

    // 驗證必填字段
    if (!title || title.trim() === '') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // 驗證優先級
    if (priority && !['LOW', 'MEDIUM', 'HIGH'].includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid priority. Must be LOW, MEDIUM, or HIGH' },
        { status: 400 }
      );
    }

    // 驗證截止日期
    let deadlineDate = null;
    if (deadline) {
      deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid deadline format' },
          { status: 400 }
        );
      }
    }

    const todo = await prisma.todo.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        priority: priority || 'MEDIUM',
        deadline: deadlineDate,
        userId: session.userId,
      },
    });

    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
