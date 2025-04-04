'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { useAuth } from './AuthContext';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';
import Link from 'next/link';

interface AuthModalProps {
  triggerClassName?: string;
  children?: React.ReactNode;
}

export function AuthModal({ triggerClassName, children }: AuthModalProps) {
  const { user } = useAuth();

  // Don't render the button if the user is already logged in
  if (user) {
    return children || null;
  }

  return (
    <Link href="/auth" className={cn("flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors", triggerClassName)}>
      {children || (
        <>
          <User className="h-4 w-4" />
          Login/Signup
        </>
      )}
    </Link>
  );
}
