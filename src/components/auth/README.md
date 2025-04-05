# Social Authentication Setup Guide

This guide explains how to configure real social authentication for Google, X (Twitter), and Apple in the Brisk quantum framework.

## Environment Variables

Create a `.env.local` file in the root of the project with the following variables:

```
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Twitter OAuth
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

# Apple OAuth
APPLE_CLIENT_ID=your_apple_client_id
APPLE_CLIENT_SECRET=your_apple_client_secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key
```

## Setting Up OAuth Providers

### Google OAuth

1. Go to the [Google Developer Console](https://console.developers.google.com/)
2. Create a new project
3. Navigate to "Credentials" > "Create Credentials" > "OAuth client ID"
4. Select "Web application" as the application type
5. Add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI
6. Copy the Client ID and Client Secret to your `.env.local` file

### X (Twitter) OAuth

1. Go to the [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new app/project
3. Navigate to "Settings" > "User authentication settings"
4. Enable OAuth 2.0 and add `http://localhost:3000/api/auth/callback/twitter` as a callback URL
5. Select appropriate scopes (email, profile)
6. Copy the Client ID and Client Secret to your `.env.local` file

### Apple OAuth

1. Go to the [Apple Developer Portal](https://developer.apple.com/)
2. Navigate to "Certificates, Identifiers & Profiles" > "Identifiers"
3. Add a new identifier > "App IDs" > Register an App ID
4. Enable "Sign In with Apple" capability
5. Create a Services ID and configure the domain and return URL
6. Add `http://localhost:3000/api/auth/callback/apple` as a return URL
7. Create a private key for client authentication
8. Copy the Client ID and Client Secret to your `.env.local` file

## Implementation Notes

- The social authentication is implemented using NextAuth.js
- Users who sign in with social providers are automatically verified
- Social login information is synced with the application's user management system
- For development purposes, you can use the following command to generate a strong NEXTAUTH_SECRET:
  ```
  openssl rand -base64 32
  ```
