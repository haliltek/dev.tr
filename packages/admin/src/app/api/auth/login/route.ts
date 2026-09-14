import { NextRequest, NextResponse } from 'next/server';
import { validateAdminCredentials, createSessionToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Kullanıcı adı ve şifre zorunludur.' },
        { status: 400 }
      );
    }

    const isValid = validateAdminCredentials(username, password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Geçersiz kullanıcı adı veya şifre!' },
        { status: 401 }
      );
    }

    const token = await createSessionToken(username);
    const response = NextResponse.json({
      success: true,
      message: 'Giriş başarılı.',
      user: { username, role: 'admin' },
    });

    response.cookies.set({
      name: 'devcore_admin_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
    return NextResponse.json({ error: 'Giriş sırasında hata oluştu.', details: message }, { status: 500 });
  }
}
