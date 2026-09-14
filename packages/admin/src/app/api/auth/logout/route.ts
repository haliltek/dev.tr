import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Çıkış yapıldı.' });
  response.cookies.set({
    name: 'devcore_admin_session',
    value: '',
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  return response;
}
