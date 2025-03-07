import { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin, register as apiRegister, getCurrentUser } from '../services/auth'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    
    if (token) {
      getCurrentUser()
        .then(userData => {
          setUser(userData)
        })
        .catch(() => {
          localStorage.removeItem('token')
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    try {
      const { user, token } = await apiLogin(email, password)
      localStorage.setItem('token', token)
      setUser(user)
      return true
    } catch (error) {
      console.error("Login failed:", error)
      return false
    }
  }

  const register = async (email, password) => {
    try {
      const response = await apiRegister(email, password)
      return response.success
    } catch (error) {
      console.error("Registration failed:", error)
      throw error  // We're throwing the error so the Register component can handle specific error messages
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const isAdmin = () => {
    return user?.role === 'admin'
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isAdmin, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)