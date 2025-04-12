"use client";

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Modified for Next.js 15 compatibility
// Dynamic import without ssr: false as we're already in a client component
const AuthClient = dynamic(() => import('./client-page'), {
  loading: () => (
    <div className="flex justify-center items-center min-h-screen">
      <Loader2 className="animate-spin h-8 w-8 text-white" />
    </div>
  )
});

// Client component
export default function AuthPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="animate-spin h-8 w-8 text-white" />
        </div>
      }
    >
      <AuthClient />
    </Suspense>
  );
}
