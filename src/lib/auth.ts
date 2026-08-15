import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        if (user.isBanned) {
          throw new Error("Your account has been suspended. Please contact support.");
        }

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) {
          throw new Error("Invalid email or password");
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data:  { lastLoginAt: new Date() },
        });

        return {
          id:    user.id,
          name:  user.name,
          email: user.email,
          image: user.image,
          role:  user.role,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // Handle Google sign-in: create user if doesn't exist
      if (account?.provider === "google") {
        const existing = await prisma.user.findUnique({ where: { email: user.email! } });
        if (!existing) {
          const refCode = "SB" + Math.random().toString(36).slice(2, 8).toUpperCase();
          await prisma.user.create({
            data: {
              email:         user.email!,
              name:          user.name,
              image:         user.image,
              emailVerified: new Date(),
              referralCode:  refCode,
            },
          });
        } else if (existing.isBanned) {
          return false; // Reject banned users
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        token.role = (user as any).role || "USER";
      }

      // Refresh role from DB on each token refresh
      if (token.id && !user) {
        const dbUser = await prisma.user.findUnique({
          where:  { id: token.id as string },
          select: { role: true, isBanned: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          if (dbUser.isBanned) {
            token.error = "AccountBanned";
          }
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id   = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },

  pages: {
    signIn:   "/auth/login",
    error:    "/auth/error",
    newUser:  "/dashboard",
  },

  session: {
    strategy: "jwt",
    maxAge:   30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === "development",
};
