import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { STORAGE_KEY, ADMIN_SESSION_KEY } from './utils'

interface AdminContextType {
  isAdmin: boolean
  setIsAdmin: (isAdmin: boolean) => void
  login: (username: string, password: string) => boolean
  logout: () => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const adminSession = sessionStorage.getItem(ADMIN_SESSION_KEY)
    if (adminSession === 'true') {
      setIsAdmin(true)
    }
  }, [])

  const login = (username: string, password: string): boolean => {
    if (username.toLowerCase() === 'admin' && password === 'FBLSeason3!') {
      setIsAdmin(true)
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true')
      return true
    }
    return false
  }

  const logout = () => {
    setIsAdmin(false)
    sessionStorage.removeItem(ADMIN_SESSION_KEY)
  }

  return (
    <AdminContext.Provider value={{ isAdmin, setIsAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}