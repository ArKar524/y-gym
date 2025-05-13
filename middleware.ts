import { NextRequest, NextResponse } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/register', '/forgot-password'];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));
  
  // Get auth cookie/token (in a real app, you'd verify this token)
  const authCookie = request.cookies.get('auth')?.value;
  const userRole = request.cookies.get('role')?.value;
  
  // If user is on a public route but already authenticated, redirect to appropriate dashboard
  if (isPublicRoute && authCookie) {
    if (userRole === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  // If user is not authenticated and trying to access protected routes
  if (!isPublicRoute && !authCookie) {
    // Redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Role-based access control
  if (authCookie) {
    // Prevent members from accessing admin routes
    if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // Redirect admin to admin panel if they try to access member dashboard
    if (pathname.startsWith('/dashboard') && userRole === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }
  
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all routes except for static files, api routes, and _next
    '/((?!api|_next|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|gif|ico|css|js)).*)',
  ],
};
