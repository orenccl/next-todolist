import { prisma } from './prisma';
import { InitialTodoData } from '@/types/todo';

/**
 * 初始待辦事項數據
 */
const initialTodosData: InitialTodoData[] = [
  {
    title: 'Buy groceries',
    description: null,
    priority: 'HIGH',
    deadline: new Date('2024-05-05'),
    isDone: true,
  },
  {
    title: 'Finish report',
    description: null,
    priority: 'MEDIUM',
    deadline: new Date('2024-05-10'),
    isDone: false,
  },
  {
    title: 'Call mom',
    description: null,
    priority: 'LOW',
    deadline: new Date('2024-05-07'),
    isDone: false,
  },
  {
    title: 'Complete project proposal',
    description: null,
    priority: 'HIGH',
    deadline: new Date('2024-05-15'),
    isDone: false,
  },
  {
    title: 'Pay bills',
    description: null,
    priority: 'HIGH',
    deadline: new Date('2024-05-08'),
    isDone: true,
  },
  {
    title: 'Study for exam',
    description: null,
    priority: 'HIGH',
    deadline: new Date('2024-05-20'),
    isDone: false,
  },
  {
    title: 'Schedule dentist appointment',
    description: null,
    priority: 'MEDIUM',
    deadline: new Date('2024-05-10'),
    isDone: false,
  },
  {
    title: 'Exercise',
    description: null,
    priority: 'MEDIUM',
    deadline: new Date('2024-05-12'),
    isDone: false,
  },
  {
    title: 'Read book',
    description: null,
    priority: 'MEDIUM',
    deadline: new Date('2024-05-18'),
    isDone: false,
  },
  {
    title: 'Write blog post',
    description: null,
    priority: 'MEDIUM',
    deadline: new Date('2024-05-14'),
    isDone: true,
  },
  {
    title: 'Prepare presentation',
    description: null,
    priority: 'MEDIUM',
    deadline: new Date('2024-05-17'),
    isDone: false,
  },
  {
    title: 'Call friend',
    description: null,
    priority: 'LOW',
    deadline: new Date('2024-05-09'),
    isDone: false,
  },
  {
    title: 'Clean house',
    description: null,
    priority: 'LOW',
    deadline: new Date('2024-05-11'),
    isDone: true,
  },
  {
    title: 'Go for a walk',
    description: null,
    priority: 'LOW',
    deadline: new Date('2024-05-16'),
    isDone: false,
  },
  {
    title: 'Watch movie',
    description: null,
    priority: 'LOW',
    deadline: new Date('2024-05-13'),
    isDone: false,
  },
  {
    title: 'Cook dinner',
    description: null,
    priority: 'LOW',
    deadline: new Date('2024-05-19'),
    isDone: false,
  },
  {
    title: 'Water plants',
    description: null,
    priority: 'LOW',
    deadline: new Date('2024-05-07'),
    isDone: false,
  },
  {
    title: 'Check emails',
    description: null,
    priority: 'LOW',
    deadline: new Date('2024-05-06'),
    isDone: false,
  },
  {
    title: 'Organize files',
    description: null,
    priority: 'LOW',
    deadline: new Date('2024-05-21'),
    isDone: true,
  },
  {
    title: 'Plan weekend activities',
    description: null,
    priority: 'LOW',
    deadline: new Date('2024-05-22'),
    isDone: true,
  },
];

/**
 * 創建初始待辦事項
 * @param userId 用戶 ID
 * @returns 創建的待辦事項數量
 */
export async function createInitialTodos(userId: string): Promise<number> {
  try {
    // 使用預處理的靜態數據，避免每次讀取和解析 CSV 文件
    const todoData = initialTodosData.map(todo => ({
      ...todo,
      userId,
    }));

    // 批量創建待辦事項
    const result = await prisma.todo.createMany({
      data: todoData,
      skipDuplicates: true,
    });

    return result.count;
  } catch (error) {
    console.error('Error creating initial todos:', error);
    // 如果創建初始待辦事項失敗，不應該阻止用戶註冊
    return 0;
  }
}
