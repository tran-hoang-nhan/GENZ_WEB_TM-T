import { useState } from 'react'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { Button } from '../ui/button'
import { AdminStats } from './AdminStats'
import { AdminProducts } from './AdminProducts'
import { AdminOrders } from './AdminOrders'
import { useAuth } from '../../contexts/AuthContext'
import logo from 'figma:asset/f78e3c35da8a6df43c6fe4dc2c4c28f2a6e85644.png'

interface AdminDashboardProps {
  onLogout: () => void
}

type AdminView = 'stats' | 'products' | 'orders'

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const { user, logout } = useAuth()
  const [currentView, setCurrentView] = useState<AdminView>('stats')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    onLogout()
  }

  const menuItems = [
    { id: 'stats' as AdminView, label: 'Thống Kê', icon: LayoutDashboard },
    { id: 'products' as AdminView, label: 'Sản Phẩm', icon: Package },
    { id: 'orders' as AdminView, label: 'Đơn Hàng', icon: ShoppingBag }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-64 bg-black text-white z-50
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={logo} alt="GENZ" className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <h1 className="text-lg">GENZ Admin</h1>
                  <p className="text-xs text-gray-400">{user?.name}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id)
                    setSidebarOpen(false)
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${currentView === item.id 
                      ? 'bg-pink-500 text-white' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-800">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Đăng Xuất
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="text-xl">
              {menuItems.find(item => item.id === currentView)?.label}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 hidden sm:block">
                {user?.email}
              </span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 lg:p-8">
          {currentView === 'stats' && <AdminStats />}
          {currentView === 'products' && <AdminProducts />}
          {currentView === 'orders' && <AdminOrders />}
        </main>
      </div>
    </div>
  )
}
