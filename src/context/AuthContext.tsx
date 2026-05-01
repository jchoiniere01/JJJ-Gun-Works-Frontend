import { createContext, useContext, useMemo, useState } from 'react'
import { authApi, setAuthToken } from '../api/client'
import type { AuthRequest, UserProfile } from '../types/domain'

interface AuthContextValue {
  user: UserProfile | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  authMessage: string
  login: (body: AuthRequest) => Promise<void>
  register: (body: AuthRequest) => Promise<void>
  updateProfile: (body: Partial<UserProfile>) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [authMessage, setAuthMessage] = useState('')

  const applySession = (profile: UserProfile, accessToken?: string) => {
    setUser(profile)
    setToken(accessToken || null)
    setAuthToken(accessToken || null)
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin' || user?.role === 'owner',
      authMessage,
      login: async (body) => {
        const response = await authApi.login(body)
        applySession(response.user, response.access_token)
        setAuthMessage(response.message || 'Signed in successfully.')
      },
      register: async (body) => {
        const response = await authApi.register(body)
        applySession(response.user, response.access_token)
        setAuthMessage(response.message || 'Account created successfully.')
      },
      updateProfile: async (body) => {
        const updated = await authApi.updateProfile({ ...body, email: body.email || user?.email })
        setUser(updated)
        setAuthMessage('Profile saved.')
      },
      logout: () => {
        setUser(null)
        setToken(null)
        setAuthToken(null)
        setAuthMessage('Signed out.')
      },
    }),
    [authMessage, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
