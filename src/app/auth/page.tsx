'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { useAuth } from '@/components/auth';
import { Loader2, X, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type AuthView = 'email' | 'login' | 'signup';

export default function AuthPage() {
  const [view, setView] = useState<AuthView>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, signup, user } = useAuth();
  
  // Redirect to home if already logged in
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSocialAuth = (provider: string) => {
    // In a real implementation, this would redirect to OAuth flow
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Show a message that this is just a demo
      alert(`${provider} authentication is a demo feature only.`);
    }, 1000);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      return;
    }
    // Check if user exists to determine if we should show login or signup
    setView('login');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const success = await login(email, password);
    if (success) {
      router.push('/');
    }
    
    setIsLoading(false);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const success = await signup(name, email, password);
    if (success) {
      router.push('/');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      {/* Cosmic dawn gradient effect - with larger radius */}
      <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-amber-600/60 via-amber-800/25 to-transparent z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-600/30 via-amber-900/20 to-transparent blur-xl"></div>
      </div>
      {/* Header */}
      <header className="border-b border-gray-800 p-4 relative z-10">
        <div className="container mx-auto flex justify-end items-center">
          <Link href="/" className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </Link>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-1 flex items-center justify-center py-10 px-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo and title */}
          <div className="flex flex-col items-center mb-10">
            <h1 className="text-5xl font-bold text-white mb-2">Brisk</h1>
            <p className="text-gray-400 text-center">Quantum Framework</p>
          </div>

          {view === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="space-y-6">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-transparent text-white border-gray-700 hover:bg-gray-800 flex items-center justify-center gap-2 h-12"
                  onClick={() => handleSocialAuth('X')}
                  disabled={isLoading}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Sign up with X
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-transparent text-white border-gray-700 hover:bg-gray-800 flex items-center justify-center gap-2 h-12"
                  onClick={() => handleSocialAuth('Google')}
                  disabled={isLoading}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Sign up with Google
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-transparent text-white border-gray-700 hover:bg-gray-800 flex items-center justify-center gap-2 h-12"
                  onClick={() => handleSocialAuth('Apple')}
                  disabled={isLoading}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.152 6.896c-.948 0-2.415-1.04-3.96-1.01-2.04.02-3.913 1.181-4.962 3.002-2.115 3.651-.54 9.058 1.514 12.03 1.011 1.447 2.216 3.082 3.792 3.022 1.524-.054 2.096-1.012 3.932-1.012 1.837 0 2.357 1.012 3.96.981 1.634-.03 2.668-1.486 3.673-2.94 1.159-1.676 1.634-3.308 1.664-3.387-.036-.011-3.193-1.234-3.224-4.883-.03-3.033 2.481-4.503 2.597-4.582-1.447-2.098-3.662-2.335-4.44-2.376-2.026-.174-3.692 1.135-4.546 1.135z" />
                    <path d="M14.642 4.095c.83-1.006 1.395-2.419 1.24-3.827-1.193.05-2.641.8-3.501 1.819-.768.895-1.438 2.334-1.262 3.7 1.336.105 2.694-.699 3.523-1.692z" />
                  </svg>
                  Sign up with Apple
                </Button>
              </div>

              <div className="flex items-center gap-3 my-6">
                <div className="h-px bg-gray-700 flex-1"></div>
                <span className="text-sm text-gray-400">or</span>
                <div className="h-px bg-gray-700 flex-1"></div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-transparent border border-gray-700 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-white hover:bg-gray-200 text-black flex items-center justify-center gap-2"
                disabled={isLoading || !email.trim()}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
              
              <p className="text-xs text-center text-gray-400 mt-6">
                By continuing, you agree to Brisk's Terms of Service and Privacy Policy
              </p>
            </form>
          )}

          {view === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-transparent border border-gray-700 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-transparent border border-gray-700 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-transparent border border-gray-700 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-white hover:bg-gray-200 text-black"
                disabled={isLoading || !email.trim() || !password.trim() || !name.trim()}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Create Account'
                )}
              </Button>
              
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="text-sm text-blue-400 hover:underline"
                >
                  Already have an account? Sign in
                </button>
              </div>
            </form>
          )}

          {view === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-transparent border border-gray-700 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-transparent border border-gray-700 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-white hover:bg-gray-200 text-black"
                disabled={isLoading || !email.trim() || !password.trim()}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Sign In'
                )}
              </Button>
              
              <div className="flex justify-between text-sm mt-4">
                <button
                  type="button"
                  onClick={() => setView('signup')}
                  className="text-blue-400 hover:underline"
                >
                  Need an account? Sign up
                </button>
                <button
                  type="button"
                  className="text-blue-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            </form>
          )}

          {view !== 'email' && (
            <button
              onClick={() => setView('email')}
              className="mt-6 text-sm text-gray-400 hover:text-white flex items-center justify-center w-full"
            >
              ← Back
            </button>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="border-t border-gray-800 p-4 relative z-10">
        <div className="container mx-auto text-center text-sm text-gray-500">
          <p>Already have an account? <Link href="/auth?view=login" className="text-blue-400 hover:underline">Sign in</Link></p>
        </div>
      </footer>
    </div>
  );
}
