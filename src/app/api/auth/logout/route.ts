import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/session';
import { AuthResponse } from '@/types/auth';

/**
 * 登出
 * @returns 登出成功或失敗
 */
export async function POST() {
  try {
    await clearSession();

    const response: AuthResponse = {
      success: true,
      message: 'Logged out successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
