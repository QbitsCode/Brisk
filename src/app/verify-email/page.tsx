'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, useToast } from '@/components/ui';
import { useAuth } from '@/components/auth';
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react';
import Link from 'next/link';

// Main component that wraps the content in a Suspense boundary
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

// Component that uses useSearchParams must be wrapped in Suspense
function VerifyEmailContent() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams(); // This needs to be wrapped in Suspense
  const { verifyEmail, resendVerification, isLoading } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    if (email) {
      setEmail(email);
    }
    
    if (token) {
      setToken(token);
      handleVerification(token);
    } else {
      setStatus('failed');
    }
  }, [searchParams]);

  const handleVerification = async (verificationToken: string) => {
    try {
      const success = await verifyEmail(verificationToken);
      setStatus(success ? 'success' : 'failed');
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('failed');
    }
  };

  const handleResendVerification = async () => {
    if (!email || isResending) return;
    
    setIsResending(true);
    try {
      await resendVerification(email);
      toast({
        title: "Verification Email Sent",
        description: "A new verification email has been sent. Please check your inbox.",
      });
    } catch (error) {
      console.error('Resend verification error:', error);
      toast({
        title: "Failed to Resend",
        description: "An error occurred while resending the verification email.",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleManualVerification = async () => {
    if (!token || isLoading) return;
    
    try {
      const success = await verifyEmail(token);
      setStatus(success ? 'success' : 'failed');
    } catch (error) {
      console.error('Manual verification error:', error);
      setStatus('failed');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      {/* Cosmic dawn gradient effect */}
      <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-amber-600/60 via-amber-800/25 to-transparent z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-600/30 via-amber-900/20 to-transparent blur-xl"></div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex items-center justify-center py-10 px-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo and title */}
          <div className="flex flex-col items-center mb-10">
            <h1 className="text-5xl font-bold text-white mb-2">Brisk</h1>
            <p className="text-gray-400 text-center">Email Verification</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-2xl">
            {status === 'verifying' && (
              <div className="text-center">
                <Loader2 className="h-16 w-16 animate-spin mx-auto text-blue-500 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Verifying Your Email</h2>
                <p className="text-gray-400 mb-6">Please wait while we verify your email address...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center">
                <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Email Verified!</h2>
                <p className="text-gray-400 mb-6">Your email has been successfully verified. You can now access all features of Brisk.</p>
                <Button 
                  className="w-full"
                  onClick={() => router.push('/auth')}
                >
                  Sign In to Your Account
                </Button>
              </div>
            )}

            {status === 'failed' && (
              <div className="text-center">
                <XCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Verification Failed</h2>
                <p className="text-gray-400 mb-6">We couldn't verify your email. The verification link may be expired or invalid.</p>
                
                {!token && (
                  <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-2">Enter Verification Token</label>
                    <input
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Paste your verification token here"
                      className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 text-white mb-3"
                    />
                    <Button 
                      className="w-full"
                      onClick={handleManualVerification}
                      disabled={!token || isLoading}
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Verify Email
                    </Button>
                  </div>
                )}
                
                <div className="mt-6 pt-6 border-t border-gray-800">
                  <h3 className="text-lg font-medium mb-2">Didn't receive a verification email?</h3>
                  <div className="mb-3">
                    <label className="block text-sm text-gray-400 mb-2">Your Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 text-white"
                    />
                  </div>
                  <Button 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleResendVerification}
                    disabled={!email || isResending}
                    variant="outline"
                  >
                    {isResending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                    Resend Verification Email
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="text-center mt-8">
            <Link href="/" className="text-blue-400 hover:underline">
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
