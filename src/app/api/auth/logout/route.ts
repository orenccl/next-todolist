import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/session';

/**
 * 登出
 * @returns 登出成功或失敗
 */
export async function POST() {
  try {
    await clearSession();

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
