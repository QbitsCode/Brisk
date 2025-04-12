"use client";

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the client component with SSR disabled
// This ensures useSearchParams() only runs on the client
const AuthClient = dynamic(() => import('./client-page'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center min-h-screen">
      <Loader2 className="animate-spin h-8 w-8 text-white" />
    </div>
  )
});

// Server component
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
