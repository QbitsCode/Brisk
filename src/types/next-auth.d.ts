import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's database ID */
      id: string;
      /** The user's name */
      name?: string;
      /** The user's email address */
      email?: string;
      /** The user's profile image */
      image?: string;
      /** The OAuth provider used for authentication */
      provider?: string;
      /** The OAuth access token */
      accessToken?: string;
    };
  }

  interface Profile {
    name?: string;
    email?: string;
    image?: string;
    picture?: string;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    idToken?: string;
    /** OAuth access token */
    accessToken?: string;
    /** OAuth provider used */
    provider?: string;
    /** User's name */
    name?: string;
    /** User's email */
    email?: string;
    /** User's profile image */
    image?: string;
  }
}
