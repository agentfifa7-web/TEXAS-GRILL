import type { AuthOptions } from 'next-auth'
import { getServerSession as nextAuthGetServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

// next-auth v4's OWN internal config validation (used by its built-in
// /api/auth/error page and a few other internal code paths) specifically
// looks for `NEXTAUTH_SECRET` — independent of whatever `secret` value is
// passed into `authOptions` below. Passing only `AUTH_SECRET` (the newer
// Auth.js v5 convention) satisfies session signing but still trips
// next-auth v4's internal "NO_SECRET" check. Accept both names so either
// env var works.
const SECRET = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET

// Email/password auth wired to our own User table (bcrypt-hashed passwords,
// JWT session strategy — no adapter/session table needed). OAuth is left as
// a documented extension point: add providers here (Google, Facebook...)
// once client id/secret are available; the User model and callbacks below
// already carry everything a provider needs (role, id).
export const authOptions: AuthOptions = {
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'Email & mot de passe',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({ where: { email: credentials.email.toLowerCase() } })
        if (!user || !user.passwordHash || !user.isActive) return null

        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) return null

        return { id: user.id, name: user.name, email: user.email, role: user.role, image: user.image ?? undefined }
      },
    }),
    // TODO(auth): add OAuth providers once credentials are available, e.g.
    // GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role ?? 'CUSTOMER'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = (token.role as string) ?? 'CUSTOMER'
      }
      return session
    },
  },
  secret: SECRET,
}

/**
 * Drop-in replacement for `getServerSession(authOptions)` that never
 * throws — a NextAuth configuration issue (missing secret, etc.) must not
 * crash the page calling it. Use this everywhere instead of importing
 * `getServerSession` + `authOptions` separately.
 */
export async function getServerSession() {
  try {
    return await nextAuthGetServerSession(authOptions)
  } catch (error) {
    console.error('[texas-grill] getServerSession failed — continuing as signed out:', error)
    return null
  }
}
