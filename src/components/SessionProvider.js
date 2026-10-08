'use client';

/**
 * @file SessionProvider.js
 * @description React Component / Page for SessionProvider.js. Handles UI rendering and local state.
 * @module SessionProvider
 * 
 * @notes
 * - Ensure all imports are correctly resolved.
 * - Follows standard React and Next.js conventions.
 * - Requires proper authentication context for protected routes.
 */
import { SessionProvider } from "next-auth/react"

export default function NextAuthSessionProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>
}
