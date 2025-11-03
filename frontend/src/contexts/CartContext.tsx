import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { CartItem, Product } from '../lib/types'
import { toast } from 'sonner'
import { apiFetch } from '../lib/api'

interface CartContextType {
  cart: CartItem[]
  addToCart: (product: Product, color: string, size: string, quantity: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [userId, setUserId] = useState<string | null>(null)

  // Load user ID and cart from localStorage/API
  useEffect(() => {
    const storedUserId = localStorage.getItem('genz_user_id')
    if (storedUserId) {
      setUserId(storedUserId)
      // Load cart from DB
      loadCartFromDB(storedUserId)
    }
  }, [])

  const loadCartFromDB = async (uid: string) => {
    try {
      const response = await apiFetch(`carts/${uid}`)
      if (response.data?.items) {
        setCart(response.data.items)
      }
    } catch (err) {
      console.error('Failed to load cart:', err)
    }
  }

  const saveCartToDB = async (items: CartItem[]) => {
    if (!userId) {
      console.warn('⚠️ No userId! Cannot save cart. userId:', userId)
      return
    }
    
    // Transform items: loại bỏ colors[], sizes[] array, chỉ giữ selectedColor, selectedSize
    const cleanedItems = items.map(item => ({
      id: item.id,
      productName: item.name,
      price: item.price,
      quantity: item.quantity,
      selectedColor: item.selectedColor,
      selectedSize: item.selectedSize,
      image: item.image,
      // Không gửi: colors[], sizes[], images[], description...
    }))
    
    const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0)
    console.log('💾 Saving cart to DB:', { userId, itemsCount: cleanedItems.length, totalPrice })
    
    try {
      await apiFetch('carts', {
        method: 'POST',
        body: JSON.stringify({ userId, items: cleanedItems, totalPrice }),
        headers: { 'Content-Type': 'application/json' },
      })
      console.log('✅ Cart saved successfully')
    } catch (err) {
      console.error('❌ Failed to save cart:', err)
    }
  }

  const addToCart = (product: Product, color: string, size: string, quantity: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.id === product.id && item.selectedColor === color && item.selectedSize === size
      )

      let newCart: CartItem[]
      
      if (existingItem) {
        toast.success('Đã cập nhật số lượng trong giỏ hàng!')
        newCart = prevCart.map((item) =>
          item.id === product.id && item.selectedColor === color && item.selectedSize === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        toast.success('Đã thêm sản phẩm vào giỏ hàng!')
        newCart = [...prevCart, { ...product, quantity, selectedColor: color, selectedSize: size }]
      }
      
      // Save to DB
      saveCartToDB(newCart)
      return newCart
    })
  }

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => {
      const itemToRemove = prevCart.find((item) => item.id === productId)
      const newCart = prevCart.filter((item) => item.id !== productId)
      
      if (userId && itemToRemove) {
        try {
          apiFetch(`carts/${userId}/items/${productId}`, {
            method: 'DELETE',
            body: JSON.stringify({ 
              selectedColor: itemToRemove.selectedColor, 
              selectedSize: itemToRemove.selectedSize 
            }),
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (err) {
          console.error('Failed to remove item from cart:', err)
        }
      }
      
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng!')
      return newCart
    })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart((prevCart) => {
      const newCart = prevCart.map((item) => 
        item.id === productId ? { ...item, quantity } : item
      )
      
      // Save to DB
      saveCartToDB(newCart)
      return newCart
    })
  }

  const clearCart = () => {
    setCart([])
    if (userId) {
      try {
        apiFetch(`carts/${userId}`, { method: 'DELETE' })
      } catch (err) {
        console.error('Failed to clear cart:', err)
      }
    }
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
