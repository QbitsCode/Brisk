# Environment Variables Setup

Create a `.env.local` file in the root of your project with the following variables:

```
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# OAuth Providers - Replace with your actual credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret

APPLE_CLIENT_ID=your-apple-client-id
APPLE_CLIENT_SECRET=your-apple-client-secret
```

## Getting OAuth Credentials

### Google

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Set up an OAuth consent screen if prompted
6. Select "Web application" as the application type
7. Add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI
8. Copy the generated client ID and client secret

### Twitter/X

1. Go to the [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a project and app
3. In the app settings, navigate to "User authentication settings"
4. Enable OAuth 2.0
5. Add `http://localhost:3000/api/auth/callback/twitter` as a callback URL
6. Copy the client ID and client secret

### Apple

1. Go to the [Apple Developer Portal](https://developer.apple.com/)
2. Navigate to "Certificates, Identifiers & Profiles"
3. Create a Services ID
4. Enable "Sign In with Apple"
5. Add your domain and return URL (http://localhost:3000/api/auth/callback/apple)
6. Create the necessary private key
7. Copy the client ID and client secret

## Setting a Secure NEXTAUTH_SECRET

For security, generate a random string for your NEXTAUTH_SECRET. You can use this command:

```bash
openssl rand -base64 32
```

Copy the output and use it as your NEXTAUTH_SECRET value.
