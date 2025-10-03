import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { AuthResponse } from '@/types/auth';

/**
 * 獲取用戶信息
 * @returns 用戶信息
 */
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const response: AuthResponse = {
      success: true,
      user: {
        id: session.userId,
        email: session.email,
        name: session.name,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
