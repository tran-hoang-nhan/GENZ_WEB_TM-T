import { Router } from 'express';
import { db } from '../app';
import { ObjectId } from 'mongodb';

const router = Router();

// GET /api/carts/:userId - Get user's cart
router.get('/carts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const cartsCollection = db.collection('carts');
    
    const cart = await cartsCollection.findOne({ userId });
    
    if (!cart) {
      return res.json({ data: { userId, items: [], totalPrice: 0 } });
    }
    
    return res.json({ data: cart });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// POST /api/carts - Create or update cart
router.post('/carts', async (req, res) => {
  try {
    const { userId, items, totalPrice } = req.body;
    
    if (!userId || !items) {
      return res.status(400).json({ error: 'Missing userId or items' });
    }
    
    const cartsCollection = db.collection('carts');
    const now = new Date();
    
    // Check if cart exists first
    const cartExists = await cartsCollection.findOne({ userId });
    
    const result = await cartsCollection.findOneAndUpdate(
      { userId },
      {
        $set: {
          userId,
          items,
          totalPrice,
          updatedAt: now,
          // Always ensure createdAt exists
          ...(cartExists ? {} : { createdAt: now })
        }
      },
      { upsert: true, returnDocument: 'after' }
    );
    
    return res.status(201).json({ data: result.value });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to save cart' });
  }
});

// PATCH /api/carts/:userId/items - Add item to cart
router.patch('/carts/:userId/items', async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, productName, color, size, quantity, price } = req.body;
    
    if (!productId || !quantity || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const cartsCollection = db.collection('carts');
    
    // Check if item already exists
    const cart = await cartsCollection.findOne({ userId });
    
    if (cart) {
      const existingItem = cart.items.find(
        (item: any) => item.productId === productId && item.color === color && item.size === size
      );
      
      if (existingItem) {
        // Update quantity
        const result = await cartsCollection.findOneAndUpdate(
          { userId, 'items.productId': productId, 'items.color': color, 'items.size': size },
          {
            $inc: { 'items.$.quantity': quantity, totalPrice: quantity * price },
            $set: { updatedAt: new Date() },
          },
          { returnDocument: 'after' }
        );
        return res.json({ data: result.value });
      }
    }
    
    // Add new item
    const newItem = { productId, productName, color, size, quantity, price, subtotal: quantity * price };
    const now = new Date();
    
    // Check if cart exists first
    const cartExists = await cartsCollection.findOne({ userId });
    
    const result = await cartsCollection.findOneAndUpdate(
      { userId },
      {
        $push: { items: newItem },
        $inc: { totalPrice: quantity * price },
        $set: { 
          updatedAt: now,
          // Always ensure createdAt exists
          ...(cartExists ? {} : { createdAt: now })
        }
      },
      { upsert: true, returnDocument: 'after' }
    );
    
    return res.json({ data: result.value });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// DELETE /api/carts/:userId/items/:productId - Remove item from cart
router.delete('/carts/:userId/items/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { color, size, selectedColor, selectedSize } = req.body;
    
    // Accept both 'color'/'size' (old format) and 'selectedColor'/'selectedSize' (new format)
    const matchColor = selectedColor || color;
    const matchSize = selectedSize || size;
    
    const cartsCollection = db.collection('carts');
    
    // Find item to get its price for totalPrice calculation
    const cart = await cartsCollection.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    const item = cart.items.find(
      (i: any) => String(i.id) === String(productId) && 
                 (i.selectedColor === matchColor || i.color === matchColor) && 
                 (i.selectedSize === matchSize || i.size === matchSize)
    );
    
    if (!item) {
      console.log(`Item not found - userId: ${userId}, productId: ${productId}, color: ${matchColor}, size: ${matchSize}`);
      console.log('Cart items:', JSON.stringify(cart.items, null, 2));
      return res.status(404).json({ error: 'Item not found in cart' });
    }
    
    const itemSubtotal = item.price * item.quantity;
    
    const result = await cartsCollection.findOneAndUpdate(
      { userId },
      {
        $pull: { items: { 
          id: productId,
          selectedColor: matchColor,
          selectedSize: matchSize
        }},
        $inc: { totalPrice: -itemSubtotal },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: 'after' }
    );
    
    return res.json({ data: result.value });
  } catch (err) {
    console.error('Error in DELETE /carts/:userId/items/:productId:', err);
    return res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// DELETE /api/carts/:userId - Clear cart
router.delete('/carts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const cartsCollection = db.collection('carts');
    
    const result = await cartsCollection.findOneAndUpdate(
      { userId },
      {
        $set: { items: [], totalPrice: 0, updatedAt: new Date() },
      },
      { returnDocument: 'after' }
    );
    
    return res.json({ data: result.value || { userId, items: [], totalPrice: 0 } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to clear cart' });
  }
});

export default router;
