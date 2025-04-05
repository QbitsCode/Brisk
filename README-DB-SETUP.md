# Database Setup for NextAuth and Prisma

## Step 1: Configure Database URL

Create a `.env.local` file in the root of your project with the following content:

```
# PostgreSQL Database Connection
DATABASE_URL="postgresql://postgres:password@localhost:5432/brisk_db?schema=public"

# NextAuth Secret
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
TWITTER_CLIENT_ID="your-twitter-client-id"
TWITTER_CLIENT_SECRET="your-twitter-client-secret"
APPLE_CLIENT_ID="your-apple-client-id"
APPLE_CLIENT_SECRET="your-apple-client-secret"
```

Replace the values with your actual PostgreSQL connection details and OAuth provider credentials.

## Step 2: Create Database

Create a new PostgreSQL database named `brisk_db`:

```bash
createdb brisk_db
# Or use pgAdmin or another PostgreSQL management tool
```

## Step 3: Migrate the Database

Run the following command to create the database tables based on your Prisma schema:

```bash
npx prisma migrate dev --name init
```

This will:
1. Create a new migration based on your schema changes
2. Apply the migration to your database
3. Generate the Prisma client based on your new schema

## Step 4: Verify Database Tables

Run the following command to open Prisma Studio and verify your database tables:

```bash
npx prisma studio
```

This will open a browser window where you can view and manage your database records.

## Integration with Existing Application

The database integration is now set up with the following features:

1. **User Authentication**: NextAuth and Prisma will handle user authentication, including accounts, sessions, and verification tokens.

2. **Projects Management**: The database includes a Project model that stores user projects with their components and connections.

3. **Meeting Scheduler**: The Meeting model stores information about scheduled meetings for the QuantumTalk feature.

4. **User Status Tracking**: The User model includes status and lastActive fields for tracking online status.

## Advanced Configuration

For production deployment, consider these additional steps:

1. Use environment variables for all sensitive information
2. Set up a production database with proper security measures
3. Configure database connection pooling for better performance
4. Set up database backups and monitoring

Remember to never commit your `.env.local` file to version control!
