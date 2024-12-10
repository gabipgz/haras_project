'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AuthContextType {
  isLoggedIn: boolean
  accountId: string
  setLoginState: (accountId: string) => void
  clearLoginState: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [accountId, setAccountId] = useState('')

  useEffect(() => {
    const credentials = localStorage.getItem('hederaCredentials')
    if (credentials) {
      const { accountId } = JSON.parse(credentials)
      setAccountId(accountId)
      setIsLoggedIn(true)
    }
  }, [])

  const setLoginState = (accountId: string) => {
    setAccountId(accountId)
    setIsLoggedIn(true)
  }

  const clearLoginState = () => {
    setAccountId('')
    setIsLoggedIn(false)
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, accountId, setLoginState, clearLoginState }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 