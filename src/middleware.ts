import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only apply this middleware to GDSFactory API requests
  if (request.nextUrl.pathname.startsWith('/api/quantum/gdsfactory')) {
    const url = request.nextUrl.clone();
    
    // Replace the hostname and port to redirect to the backend
    url.protocol = 'http';
    url.hostname = 'localhost';
    url.port = '8000';
    
    // Keep the pathname and search params
    // No need to change these as they already match our backend API

    return NextResponse.rewrite(url);
  }
  
  // Continue normal processing for all other requests
  return NextResponse.next();
}

// Only run middleware on API routes
export const config = {
  matcher: '/api/quantum/gdsfactory/:path*',
};
