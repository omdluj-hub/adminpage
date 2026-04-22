import NextAuth, { Session, TokenSet } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

interface ExtendedToken extends TokenSet {
  accessToken?: string;
}

interface ExtendedSession extends Session {
  accessToken?: string;
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/gmail.readonly',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      const extendedSession = session as ExtendedSession;
      extendedSession.accessToken = (token as ExtendedToken).accessToken;
      return extendedSession;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
