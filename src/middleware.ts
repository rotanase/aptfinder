import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_PATHS = [/^\/admin(\/.*)?$/, /^\/api\/admin(\/.*)?$/];

export function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;
  const isAdmin = ADMIN_PATHS.some((re) => re.test(url));
  if (!isAdmin) return NextResponse.next();

  const token = req.headers.get('x-admin-token') || req.nextUrl.searchParams.get('admin');
  if (token && token === process.env.ADMIN_TOKEN) return NextResponse.next();

  return new NextResponse('Unauthorized', { status: 401 });
}
