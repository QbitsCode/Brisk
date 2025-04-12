"use client";

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Complete replacement that works with Next.js 15 and React 19
const AuthClient = dynamic(() => import('./client-page'), {
  loading: () => (
    <div className="flex justify-center items-center min-h-screen">
      <Loader2 className="animate-spin h-8 w-8 text-white" />
    </div>
  )
});

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
