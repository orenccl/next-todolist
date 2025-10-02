import { cookies } from 'next/headers';

export interface SessionData {
    userId: string;
    email: string;
    name?: string;
}

export async function getSession(): Promise<SessionData | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
        return null;
    }

    try {
        const sessionData = JSON.parse(sessionCookie.value);
        return sessionData;
    } catch {
        return null;
    }
}

export async function setSession(sessionData: SessionData) {
    const cookieStore = await cookies();
    cookieStore.set('session', JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });
}

export async function clearSession() {
    const cookieStore = await cookies();
    cookieStore.delete('session');
}
