import { useState } from 'react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Features } from './components/Features'
import { FeaturedProducts } from './components/FeaturedProducts'
import { AllProducts } from './components/AllProducts'
import { Footer } from './components/Footer'
import { CartPage } from './components/CartPage'
import { ProductDetailPage } from './components/ProductDetailPage'
import { Checkout } from './components/Checkout'
import { Login } from './components/Login'
import { Register } from './components/Register'
import { UserProfile } from './components/UserProfile'
import { AdminDashboard } from './components/admin/AdminDashboard'
import { CartProvider } from './contexts/CartContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProductsProvider } from './contexts/ProductsContext'
import { Toaster } from './components/ui/sonner'
import { Product } from './lib/types'

type ViewType = 'home' | 'products' | 'product-detail' | 'cart' | 'checkout' | 'login' | 'register' | 'profile' | 'admin'

function AppContent() {
  const { user, isAdmin } = useAuth()
  const [currentView, setCurrentView] = useState<ViewType>('home')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setCurrentView('product-detail')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackFromProductDetail = () => {
    setCurrentView('products')
    setSelectedProduct(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCartClick = () => {
    setCurrentView('cart')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCheckoutClick = () => {
    setCurrentView('checkout')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNavigate = (section: string) => {
    if (section === 'home') {
      setCurrentView('home')
      setSearchQuery('')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (section === 'products') {
      setCurrentView('products')
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
    } else if (section === 'cart') {
      setCurrentView('cart')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (section === 'about') {
      setCurrentView('home')
      setTimeout(() => {
        const featuresSection = document.getElementById('features')
        featuresSection?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else if (section === 'contact') {
      setCurrentView('home')
      setTimeout(() => {
        const footer = document.getElementById('footer')
        footer?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentView('products')
  }

  const handleViewAllProducts = () => {
    setSearchQuery('')
    setCurrentView('products')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackToHome = () => {
    setCurrentView('home')
    setSearchQuery('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackFromCheckout = () => {
    setCurrentView('cart')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackFromCart = () => {
    setCurrentView('home')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLoginClick = () => {
    setCurrentView('login')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleRegisterClick = () => {
    setCurrentView('register')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleProfileClick = () => {
    if (!user) {
      handleLoginClick()
      return
    }
    setCurrentView('profile')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAdminClick = () => {
    if (!user || !isAdmin()) {
      handleLoginClick()
      return
    }
    setCurrentView('admin')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLoginSuccess = () => {
    if (user && isAdmin()) {
      setCurrentView('admin')
    } else {
      setCurrentView('home')
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Admin view - no header/footer
  if (currentView === 'admin' && user && isAdmin()) {
    return (
      <div className="min-h-screen">
        <AdminDashboard onLogout={handleBackToHome} />
        <Toaster position="top-right" />
      </div>
    )
  }

  // Auth views - no normal header/footer
  if (currentView === 'login') {
    return (
      <div className="min-h-screen">
        <Login 
          onBack={handleBackToHome}
          onSwitchToRegister={handleRegisterClick}
          onLoginSuccess={handleLoginSuccess}
        />
        <Toaster position="top-right" />
      </div>
    )
  }

  if (currentView === 'register') {
    return (
      <div className="min-h-screen">
        <Register 
          onBack={handleBackToHome}
          onSwitchToLogin={handleLoginClick}
          onRegisterSuccess={handleLoginSuccess}
        />
        <Toaster position="top-right" />
      </div>
    )
  }

  if (currentView === 'profile') {
    return (
      <div className="min-h-screen">
        <UserProfile onBack={handleBackToHome} />
        <Toaster position="top-right" />
      </div>
    )
  }

  // Product detail view
  if (currentView === 'product-detail' && selectedProduct) {
    return (
      <div className="min-h-screen">
        <Header 
          onCartClick={handleCartClick}
          onSearch={handleSearch}
          onNavigate={handleNavigate}
          onLoginClick={handleLoginClick}
          onProfileClick={handleProfileClick}
          onAdminClick={handleAdminClick}
        />
        <ProductDetailPage 
          product={selectedProduct}
          onBack={handleBackFromProductDetail}
          onProductClick={handleProductClick}
        />
        <div id="footer">
          <Footer />
        </div>
        <Toaster position="top-right" />
      </div>
    )
  }

  // Normal app views
  return (
    <div className="min-h-screen">
      <Header 
        onCartClick={handleCartClick}
        onSearch={handleSearch}
        onNavigate={handleNavigate}
        onLoginClick={handleLoginClick}
        onProfileClick={handleProfileClick}
        onAdminClick={handleAdminClick}
      />

      {currentView === 'home' && (
        <>
          <Hero 
            onExplore={handleViewAllProducts}
            onViewCollection={handleViewAllProducts}
          />
          <div id="features">
            <Features />
          </div>
          <FeaturedProducts 
            onProductClick={handleProductClick}
            onViewAll={handleViewAllProducts}
          />
        </>
      )}

      {currentView === 'products' && (
        <AllProducts 
          onProductClick={handleProductClick}
          searchQuery={searchQuery}
        />
      )}

      {currentView === 'cart' && (
        <CartPage 
          onBack={handleBackFromCart}
          onCheckout={handleCheckoutClick}
          onLoginClick={handleLoginClick}
        />
      )}

      {currentView === 'checkout' && (
        <Checkout 
          onBack={handleBackFromCheckout}
          onSuccess={handleBackToHome}
        />
      )}

      <div id="footer">
        <Footer />
      </div>

      <Toaster position="top-right" />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ProductsProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </ProductsProvider>
    </AuthProvider>
  )
}
