'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Github } from "lucide-react";

interface SocialAuthProps {
  onSuccess?: () => void;
}

export function SocialAuth({ onSuccess }: SocialAuthProps) {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({
    google: false,
    github: false,
  });
  const router = useRouter();

  const handleSocialAuth = async (provider: 'google' | 'github') => {
    try {
      setIsLoading({ ...isLoading, [provider]: true });
      
      if (provider === 'github') {
        // For GitHub, use direct redirect approach
        signIn(provider, { 
          callbackUrl: `${window.location.origin}/auth`
        });
        return; // The above call will redirect, so we don't need further handling
      } else {
        // For other providers, use the existing approach
        const result = await signIn(provider, { 
          redirect: false,
          callbackUrl: window.location.origin 
        });
        
        if (result?.error) {
          throw new Error(result.error);
        }
        
        if (result?.url) {
          if (onSuccess) {
            onSuccess();
          }
          router.push(result.url);
        }
      }
    } catch (error) {
      console.error(`${provider} authentication error:`, error);
    } finally {
      setIsLoading({ ...isLoading, [provider]: false });
    }
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full bg-black text-white border-gray-800 hover:bg-gray-900 flex items-center justify-center gap-2 h-12"
        onClick={() => handleSocialAuth('google')}
        disabled={!!isLoading.google}
      >
        {isLoading.google ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        Sign {isLoading.google ? "ing" : ""} in with Google
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full bg-black text-white border-gray-800 hover:bg-gray-800 flex items-center justify-center gap-2 h-12"
        onClick={() => handleSocialAuth('github')}
        disabled={!!isLoading.github}
      >
        {isLoading.github ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <svg width="18" height="18" viewBox="0 0 98 96" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" fill="white" />
          </svg>
        )}
        Sign in with GitHub
      </Button>
    </div>
  );
}
