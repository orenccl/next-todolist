import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { TodoResponse, UpdateTodoInput } from '@/types/todo';
import { Prisma } from '@prisma/client';

/**
 * 獲取單個 todo
 * @param request 請求
 * @param params 參數
 * @returns 單個 todo
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const todo = await prisma.todo.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    return NextResponse.json(todo);
  } catch (error) {
    console.error('Error fetching todo:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * 更新 todo
 * @param request 請求
 * @param params 參數
 * @returns 更新後的 todo
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body: UpdateTodoInput = await request.json();
    const { title, description, priority, deadline, isDone } = body;

    // 檢查 todo 是否存在且屬於當前用戶
    const existingTodo = await prisma.todo.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!existingTodo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    // 驗證字段
    if (title !== undefined && (!title || title.trim() === '')) {
      return NextResponse.json(
        { error: 'Title cannot be empty' },
        { status: 400 }
      );
    }

    if (priority && !['LOW', 'MEDIUM', 'HIGH'].includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid priority. Must be LOW, MEDIUM, or HIGH' },
        { status: 400 }
      );
    }

    // 驗證截止日期
    let deadlineDate = undefined;
    if (deadline !== undefined) {
      if (deadline === null) {
        deadlineDate = null;
      } else {
        deadlineDate = new Date(deadline);
        if (isNaN(deadlineDate.getTime())) {
          return NextResponse.json(
            { error: 'Invalid deadline format' },
            { status: 400 }
          );
        }
      }
    }

    // 構建更新數據
    const updateData: Prisma.TodoUpdateInput = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined)
      updateData.description = description?.trim() || null;
    if (priority !== undefined) updateData.priority = priority;
    if (deadline !== undefined) updateData.deadline = deadlineDate;
    if (isDone !== undefined) updateData.isDone = isDone;

    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: updateData,
    });

    const todoResponse: TodoResponse = {
      id: updatedTodo.id,
      title: updatedTodo.title,
      description: updatedTodo.description,
      priority: updatedTodo.priority,
      deadline: updatedTodo.deadline,
      isDone: updatedTodo.isDone,
      createdAt: updatedTodo.createdAt,
      updatedAt: updatedTodo.updatedAt,
      userId: updatedTodo.userId,
    };

    return NextResponse.json(todoResponse);
  } catch (error) {
    console.error('Error updating todo:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * 刪除 todo
 * @param request 請求
 * @param params 參數
 * @returns 刪除成功或失敗
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    // 檢查 todo 是否存在且屬於當前用戶
    const existingTodo = await prisma.todo.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!existingTodo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    await prisma.todo.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
