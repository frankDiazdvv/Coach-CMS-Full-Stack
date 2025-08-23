import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import {NextRequest, NextResponse} from 'next/server';

export default createMiddleware(routing);

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};

// Optional: Add custom logic to speed up
export async function middleware(request: NextRequest) {
  const response = await createMiddleware(routing)(request);
  if (response.headers.get('location')) {
    response.headers.set('cache-control', 'public, max-age=3600');
  }
  return response;
}