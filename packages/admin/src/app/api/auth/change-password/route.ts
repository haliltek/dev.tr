import { NextRequest, NextResponse } from 'next/server';
import { validateAdminCredentials, updateAdminPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Mevcut şifre ve yeni şifre zorunludur.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Yeni şifre en az 6 karakter olmalıdır.' },
        { status: 400 }
      );
    }

    const isValid = validateAdminCredentials(username || 'admin', currentPassword);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Mevcut şifreniz hatalı!' },
        { status: 401 }
      );
    }

    updateAdminPassword(newPassword);
    return NextResponse.json({ success: true, message: 'Şifreniz başarıyla güncellendi.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
    return NextResponse.json({ error: 'İşlem başarısız', details: message }, { status: 500 });
  }
}
