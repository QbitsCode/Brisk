"use client";

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// NextJS 15 compatible version - without ssr:false
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
