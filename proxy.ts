import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from './lib/auth';

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('session')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');

  if (!token) {
    if (!isAuthPage) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  try {
    await decrypt(token);
    if (isAuthPage) {
      return NextResponse.redirect(new URL('/projects', request.url));
    }
    return NextResponse.next();
  } catch (error) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('session');
    return response;
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
