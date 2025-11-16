import { NextAuthOptions, User } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { JWT } from 'next-auth/jwt'
import bcrypt from 'bcryptjs'
import { firestore } from './firestore'

// Extend NextAuth types to include custom properties
declare module 'next-auth' {
  interface User {
    role?: string
  }
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      image?: string
      profilePicture?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email.toLowerCase()
        const SUPER_ADMIN_EMAIL = 'brandonkatjitundu@gmail.com'
        const SUPER_ADMIN_PASSWORD_HASH = '$2a$10$t/y/H828yjOYBezXBHnS2umn.aT4aYKFR22JpVBRFskJF8sLFpJw6'
        
        // Check if it's the super admin
        if (email === SUPER_ADMIN_EMAIL.toLowerCase()) {
          const isValidPassword = await bcrypt.compare(credentials.password, SUPER_ADMIN_PASSWORD_HASH)
          if (!isValidPassword) {
            return null
          }
          
          // Check if super admin exists in Firestore, create if not
          let user: any = await firestore.user.findUnique(SUPER_ADMIN_EMAIL)
          if (!user) {
            // Create super admin in Firestore
            user = await firestore.user.create({
              email: SUPER_ADMIN_EMAIL,
              name: 'Super Admin',
              passwordHash: SUPER_ADMIN_PASSWORD_HASH,
              role: 'SUPER_ADMIN',
            })
          } else if (user.role !== 'SUPER_ADMIN') {
            // Update existing user to SUPER_ADMIN if needed
            await firestore.user.update(user.id, { role: 'SUPER_ADMIN' })
            user = { ...user, role: 'SUPER_ADMIN' }
          }
          
          return {
            id: user.id,
            email: SUPER_ADMIN_EMAIL,
            name: (user.name as string) || 'Super Admin',
            role: 'SUPER_ADMIN',
            profilePicture: user.profilePicture,
          }
        }

        // Check Firestore for other users
        const user: any = await firestore.user.findUnique(email)
        if (!user) {
          return null
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash as string)
        if (!isValidPassword) {
          return null
        }

        // Authentication successful
        return {
          id: user.id,
          email: user.email as string,
          name: (user.name as string) || 'User',
          role: (user.role as string) || 'EDITOR',
          profilePicture: user.profilePicture,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        token.profilePicture = (user as any).profilePicture
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role || 'USER'
        session.user.id = (token.id as string) || token.sub || ''
        session.user.profilePicture = (token.profilePicture as string) || undefined
      }
      return session
    },
  },
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

