import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { User, Order } from '../lib/auth-types'
import { auth as apiAuth, orders as apiOrders } from '../lib/api'
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
  userId: 'admin-001',
  name: 'Admin GENZ',
  role: 'admin' as const,
  createdAt: new Date().toISOString()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])

  // Load user and orders from localStorage and API
  useEffect(() => {
    const savedUser = localStorage.getItem('genz_user')
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        // Ensure createdAt exists
        if (!parsedUser.createdAt) {
          parsedUser.createdAt = new Date().toISOString()
        }
        setUser(parsedUser)
      } catch (err) {
        console.error('Failed to parse user from localStorage:', err)
      }
    }

    // Load orders from MongoDB API instead of localStorage
    const loadOrders = async () => {
      try {
        console.log('🔄 Loading orders from API...')
        const response = await apiOrders.list()
        console.log('📦 Orders API response:', response)
        if (response && response.data && Array.isArray(response.data)) {
          console.log('✅ Setting orders:', response.data)
          setOrders(response.data)
        } else {
          console.warn('⚠️ Response format unexpected:', response)
        }
      } catch (err) {
        console.error('❌ Failed to load orders from API:', err)
        // Try localStorage as fallback
        const savedOrders = localStorage.getItem('genz_orders')
        if (savedOrders) {
          console.log('📚 Using localStorage fallback:', savedOrders)
          setOrders(JSON.parse(savedOrders))
        }
      }
    }

    loadOrders()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Try admin account first (local demo)
    if (email === ADMIN_ACCOUNT.email && password === ADMIN_ACCOUNT.password) {
      const adminUser = {
        id: ADMIN_ACCOUNT.id,
        userId: ADMIN_ACCOUNT.userId,
        email: ADMIN_ACCOUNT.email,
        name: ADMIN_ACCOUNT.name,
        role: ADMIN_ACCOUNT.role,
        createdAt: ADMIN_ACCOUNT.createdAt
      }
      console.log('✅ Admin login, saving:', adminUser)
      setUser(adminUser)
      localStorage.setItem('genz_user', JSON.stringify(adminUser))
      localStorage.setItem('genz_user_id', adminUser.userId)
      console.log('💾 genz_user_id saved:', localStorage.getItem('genz_user_id'))
      toast.success('Đăng nhập thành công!')
      return true
    }

    try {
      const res = await apiAuth.login({ email, password })
      console.log('🔐 Login response:', res)
      // Expect response { token, user }
      if (res.token) {
        console.log('✅ User logged in, saving to localStorage:', res.user)
        localStorage.setItem('genz_token', res.token)
        localStorage.setItem('genz_user', JSON.stringify(res.user))
        localStorage.setItem('genz_user_id', res.user.userId)
        console.log('💾 genz_user_id saved:', localStorage.getItem('genz_user_id'))
        setUser(res.user)
        toast.success('Đăng nhập thành công!')
        return true
      }
      toast.error('Đăng nhập thất bại')
      return false
    } catch (err: any) {
      console.error('❌ Login error:', err)
      toast.error(err?.message || 'Lỗi khi đăng nhập')
      return false
    }
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const res = await apiAuth.register({ email, password, name })
      console.log('📝 Register response:', res)
      if (res.token) {
        console.log('✅ User registered, saving to localStorage:', res.user)
        localStorage.setItem('genz_token', res.token)
        localStorage.setItem('genz_user', JSON.stringify(res.user))
        localStorage.setItem('genz_user_id', res.user.userId)
        console.log('💾 genz_user_id saved:', localStorage.getItem('genz_user_id'))
        setUser(res.user)
        toast.success('Đăng ký thành công!')
        return true
      }
      toast.error('Đăng ký thất bại')
      return false
    } catch (err: any) {
      console.error('❌ Register error:', err)
      toast.error(err?.message || 'Lỗi khi đăng ký')
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('genz_user')
    localStorage.removeItem('genz_user_id')
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
    // Filter by userEmail to match what backend API returns
    console.log('👤 Current user email:', user.email)
    console.log('📋 All orders:', orders)
    const filtered = orders.filter(order => order.userEmail === user.email)
    console.log(`✅ Filtered ${filtered.length} orders for`, user.email)
    return filtered
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
