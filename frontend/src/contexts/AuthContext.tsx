import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { User, Order } from '../lib/auth-types'
import { auth as apiAuth } from '../lib/api'
import { CartItem } from '../lib/types'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  isAdmin: () => boolean
  orders: Order[]
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void
  updateOrderStatus: (orderId: string, status: Order['status']) => void
  getUserOrders: () => Order[]
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock admin account
const ADMIN_ACCOUNT = {
  email: 'admin@genz.vn',
  password: 'admin123',
  id: 'admin-001',
  name: 'Admin GENZ',
  role: 'admin' as const,
  createdAt: new Date().toISOString()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])

  // Load user and orders from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('genz_user')
    const savedOrders = localStorage.getItem('genz_orders')
    
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders))
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Try admin account first (local demo)
    if (email === ADMIN_ACCOUNT.email && password === ADMIN_ACCOUNT.password) {
      const adminUser = {
        id: ADMIN_ACCOUNT.id,
        email: ADMIN_ACCOUNT.email,
        name: ADMIN_ACCOUNT.name,
        role: ADMIN_ACCOUNT.role,
        createdAt: ADMIN_ACCOUNT.createdAt
      }
      setUser(adminUser)
      localStorage.setItem('genz_user', JSON.stringify(adminUser))
      toast.success('Đăng nhập thành công!')
      return true
    }

    try {
      const res = await apiAuth.login({ email, password })
      // Expect response { token, user }
      if (res.token) {
        localStorage.setItem('genz_token', res.token)
        localStorage.setItem('genz_user', JSON.stringify(res.user))
        setUser(res.user)
        toast.success('Đăng nhập thành công!')
        return true
      }
      toast.error('Đăng nhập thất bại')
      return false
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi khi đăng nhập')
      return false
    }
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const res = await apiAuth.register({ email, password, name })
      if (res.token) {
        localStorage.setItem('genz_token', res.token)
        localStorage.setItem('genz_user', JSON.stringify(res.user))
        setUser(res.user)
        toast.success('Đăng ký thành công!')
        return true
      }
      toast.error('Đăng ký thất bại')
      return false
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi khi đăng ký')
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('genz_user')
    localStorage.removeItem('genz_token')
    toast.success('Đăng xuất thành công!')
  }

  const isAdmin = (): boolean => {
    return user?.role === 'admin'
  }

  const addOrder = (orderData: Omit<Order, 'id' | 'createdAt'>) => {
    const newOrder: Order = {
      ...orderData,
      id: `order-${Date.now()}`,
      createdAt: new Date().toISOString()
    }
    
    const updatedOrders = [...orders, newOrder]
    setOrders(updatedOrders)
    localStorage.setItem('genz_orders', JSON.stringify(updatedOrders))
  }

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status } : order
    )
    setOrders(updatedOrders)
    localStorage.setItem('genz_orders', JSON.stringify(updatedOrders))
    toast.success('Cập nhật trạng thái đơn hàng thành công!')
  }

  const getUserOrders = (): Order[] => {
    if (!user) return []
    return orders.filter(order => order.userId === user.id)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAdmin,
        orders,
        addOrder,
        updateOrderStatus,
        getUserOrders
      }}
    >
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
