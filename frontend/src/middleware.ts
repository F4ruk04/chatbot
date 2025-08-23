import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Rotas que requerem autenticação
  const protectedRoutes = ['/dashboard', '/companies'];
  
  // Verificar se a rota atual requer autenticação
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute) {
    // Verificar se o token existe nos cookies
    const token = request.cookies.get('access_token');
    
    if (!token) {
      // Redirecionar para login se não houver token
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // Se estiver na página de login e já tiver token, redirecionar para dashboard
  if (pathname === '/login') {
    const token = request.cookies.get('access_token');
    
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - / (landing page)
     * - register (registration page)
     * - pricing (pricing page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|register|pricing|/).*)',
  ],
};
