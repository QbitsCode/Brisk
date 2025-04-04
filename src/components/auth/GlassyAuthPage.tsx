'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from './AuthContext';
import { Loader2, X, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type AuthView = 'login' | 'signup' | 'email';

interface GlassyAuthPageProps {
  onClose: () => void;
}

export function GlassyAuthPage({ onClose }: GlassyAuthPageProps) {
  const [view, setView] = useState<AuthView>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();

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
      onClose();
    }
    
    setIsLoading(false);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const success = await signup(name, email, password);
    if (success) {
      onClose();
    }
    
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
      <div className="relative w-full max-w-md p-6 rounded-xl bg-black/60 backdrop-blur-lg border border-gray-800 shadow-2xl text-white">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Logo and title */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-28 h-28 flex items-center justify-center mb-2">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">B</div>
              </div>
              <div className="absolute inset-0 border-4 border-transparent rounded-full animate-spin-slow [border-image:linear-gradient(45deg,blue,purple,pink,blue)_1]"></div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center">Brisk</h1>
        </div>

        {view === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-transparent text-white border-gray-700 hover:bg-gray-800 flex items-center justify-center gap-2 h-12"
                  onClick={() => handleSocialAuth('X')}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
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
                    <path d="M17.03 12.178c.011 1.214.551 2.33 1.42 3.067-.514.843-1.18 1.58-1.91 2.12-.53.363-1.09.668-1.67.906-.68.274-1.36.513-2.06.472-.69-.044-1.32-.269-1.92-.5-.6-.233-1.17-.455-1.85-.455s-1.25.222-1.85.455c-.6.231-1.23.456-1.92.5-.7.041-1.38-.198-2.06-.472-.58-.238-1.14-.543-1.67-.906-.73-.54-1.4-1.277-1.92-2.12.87-.737 1.41-1.853 1.42-3.067.02-1.11-.37-2.2-1.09-3.037-.72-.837-1.76-1.4-2.89-1.568.27-.906.75-1.747 1.38-2.456.59-.65 1.27-1.19 2.02-1.614.63-.357 1.31-.64 2.2-.81.67-.128 1.37-.108 2.06-.022.5.062 1 .242 1.44.428.44.186.9.42 1.42.42.52 0 .98-.234 1.42-.42.44-.186.94-.366 1.44-.428.69-.086 1.39-.106 2.06.022.89.17 1.57.453 2.2.81.75.424 1.43.964 2.02 1.614.63.71 1.11 1.55 1.38 2.456-1.3.225-2.46.878-3.22 1.851-.76.973-1.17 2.197-1.11 3.447v-.001Zm-5-11.178c-.835 0-2.29.826-3.77 2.243-1.19 1.14-2.3 2.78-2.23 4.538.43.038.845.19 1.205.43.36.241.661.563.878.941.217.378.341.806.36 1.242.018.437-.07.872-.256 1.266-.187.394-.46.738-.8 1.002-.339.264-.738.44-1.155.513-.417.073-.847.04-1.253-.094.17.941.573 1.95 1.38 2.823 1.2 1.29 2.83 2.273 4.64 2.273.91 0 1.59-.287 2.26-.574.67-.287 1.31-.563 2.09-.563.78 0 1.42.276 2.09.563.67.287 1.35.574 2.26.574 1.81 0 3.44-.983 4.64-2.273.81-.873 1.21-1.882 1.38-2.823-.406.134-.836.167-1.253.094-.417-.073-.816-.249-1.155-.513-.34-.264-.613-.608-.8-1.002-.186-.394-.274-.829-.256-1.266.019-.436.143-.864.36-1.242.217-.378.518-.7.878-.941.36-.24.775-.392 1.205-.43.07-1.758-1.04-3.398-2.23-4.538-1.48-1.417-2.93-2.243-3.77-2.243-1.02 0-1.58.322-2.08.608-.43.245-.83.472-1.5.472s-1.07-.227-1.5-.472c-.5-.286-1.06-.608-2.08-.608Z" />
                  </svg>
                  Sign up with Apple
                </Button>
              </div>

              <div className="flex items-center gap-3 my-6">
                <div className="h-px bg-gray-700 flex-1"></div>
                <span className="text-sm text-gray-400">or</span>
                <div className="h-px bg-gray-700 flex-1"></div>
              </div>

              <div>
                <label className="sr-only" htmlFor="email">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="bg-transparent text-white border-gray-700 h-12"
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
                <label className="sr-only" htmlFor="name">Name</label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  className="bg-transparent text-white border-gray-700 h-12"
                />
              </div>
              
              <div>
                <label className="sr-only" htmlFor="signup-email">Email</label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="bg-transparent text-white border-gray-700 h-12"
                />
              </div>
              
              <div>
                <label className="sr-only" htmlFor="signup-password">Password</label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-transparent text-white border-gray-700 h-12"
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
            
            <div className="text-center">
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
                <label className="sr-only" htmlFor="login-email">Email</label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="bg-transparent text-white border-gray-700 h-12"
                />
              </div>
              
              <div>
                <label className="sr-only" htmlFor="login-password">Password</label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-transparent text-white border-gray-700 h-12"
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
            
            <div className="flex justify-between text-sm">
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

        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Already have an account? <button onClick={() => setView('login')} className="text-blue-400 hover:underline">Sign in</button></p>
        </div>
      </div>
    </div>
  );
}
