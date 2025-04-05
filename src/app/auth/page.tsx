'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui';
import { useAuth } from '@/components/auth';
import { SocialAuth } from '@/components/auth/SocialAuth';
import { signIn, useSession } from 'next-auth/react';
import { Loader2, X, ArrowRight, Mail, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type AuthView = 'email' | 'login' | 'signup';

export default function AuthPage() {
  const [view, setView] = useState<AuthView>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationNeeded, setVerificationNeeded] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, signup, user, resendVerification } = useAuth();
  const { data: session } = useSession();
  
  // Redirect to home if already logged in
  useEffect(() => {
    // Check if user is logged in through Brisk auth or NextAuth session
    if (user || session?.user) {
      router.push('/');
    }
    
    // Check if we're coming back from verification or need to verify
    const viewParam = searchParams.get('view');
    const emailParam = searchParams.get('email');
    const verifyParam = searchParams.get('verify');
    
    if (viewParam && (viewParam === 'login' || viewParam === 'signup' || viewParam === 'email')) {
      setView(viewParam as AuthView);
    }
    
    if (emailParam) {
      setEmail(emailParam);
    }
    
    if (verifyParam === 'true') {
      setVerificationNeeded(true);
    }
  }, [user, session, router, searchParams]);

  const handleSocialAuthSuccess = () => {
    // This function will be called after successful social authentication
    router.push('/');
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
    
    try {
      const success = await login(email, password);
      if (success) {
        router.push('/');
      } else {
        // Check if verification is needed (this is a simplified check, in a real app
        // we would get this info from the login response)
        const storedUsers = JSON.parse(localStorage.getItem('brisk_users') || '[]');
        const matchedUser = storedUsers.find((u: any) => u.email === email);
        
        if (matchedUser && !matchedUser.isVerified) {
          setVerificationNeeded(true);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await signup(name, email, password);
      if (success) {
        setVerificationSent(true);
      }
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResendVerification = async () => {
    if (!email || isLoading) return;
    
    setIsLoading(true);
    try {
      await resendVerification(email);
      setVerificationSent(true);
    } catch (error) {
      console.error('Resend verification error:', error);
    } finally {
      setIsLoading(false);
    }
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
                <SocialAuth onSuccess={handleSocialAuthSuccess} />
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

          {view === 'signup' && !verificationSent && (
            <form onSubmit={handleSignupSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
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
          )
          }
          
          {/* Verification sent message */}
          {verificationSent && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
              <Mail className="h-12 w-12 mx-auto text-blue-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Verification Email Sent</h2>
              <p className="text-gray-400 mb-6">
                We've sent a verification email to <strong>{email}</strong>. Please check your inbox and follow the instructions to verify your account.
              </p>
              <div className="space-y-3">
                <Button 
                  className="w-full"
                  variant="outline"
                  onClick={() => router.push(`/verify-email?email=${encodeURIComponent(email)}`)}
                >
                  Go to Verification Page
                </Button>
                <Button 
                  className="w-full"
                  variant="link"
                  onClick={() => {
                    setVerificationSent(false);
                    setView('login');
                  }}
                >
                  Back to Login
                </Button>
              </div>
            </div>
          )}

          {view === 'login' && !verificationNeeded && (
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
          
          {/* Verification needed message */}
          {verificationNeeded && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto text-amber-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Email Verification Required</h2>
              <p className="text-gray-400 mb-6">
                Your account requires email verification before you can log in. Please check your inbox for the verification link or request a new one.
              </p>
              <div className="space-y-3">
                <Button 
                  className="w-full"
                  variant="outline"
                  onClick={handleResendVerification}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Resend Verification Email
                </Button>
                <Button 
                  className="w-full"
                  variant="link"
                  onClick={() => {
                    setVerificationNeeded(false);
                    setView('login');
                  }}
                >
                  Back to Login
                </Button>
              </div>
            </div>
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
