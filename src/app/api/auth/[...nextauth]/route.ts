import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/components/prisma-client';
import { demoGoogleCredentials, demoGithubCredentials } from '@/components/auth/demo-oauth';

// This is where you would add your actual OAuth credentials
// For production, these should be environment variables
const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || demoGoogleCredentials.clientId,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || demoGoogleCredentials.clientSecret,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID || demoGithubCredentials.clientId,
      clientSecret: process.env.GITHUB_SECRET || demoGithubCredentials.clientSecret,
    }),
  ],
  callbacks: {
    async session({ session, user, token }) {
      // Send properties to the client
      if (session.user) {
        // If we have a user from the adapter, use that ID
        if (user) {
          session.user.id = user.id;
        } 
        // Otherwise use the token subject (for JWT strategy)
        else if (token) {
          session.user.id = token.sub as string || (token.id as string) || session.user.email;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      // Add user ID to the token when it's first created
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth',
    signOut: '/',
    error: '/auth', // Error code passed in query string as ?error=
    verifyRequest: '/verify-email', // (used for check email message)
    newUser: '/auth' // New users will be directed here on first sign in
  },
  // For security in production
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Debug mode for development - enable to see detailed logs
  debug: true,
});

export { handler as GET, handler as POST };
