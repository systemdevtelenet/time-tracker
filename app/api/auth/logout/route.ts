import { NextRequest, NextResponse } from 'next/server';
import { isHttpsRequest } from '@/lib/authSession';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  // Clear session cookie (secure flag must match how it was set at login)
  response.cookies.set('ctnp_session', '', {
    httpOnly: true,
    secure: isHttpsRequest(request),
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
