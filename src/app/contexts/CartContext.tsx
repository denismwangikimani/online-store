"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import toast from "react-hot-toast";
import { useAuth } from "./AuthProvider";

type CartProduct = {
  id: string;
  products: {
    id: number;
    name: string;
    price: number;
    image_url: string;
    discount_percentage: number | null;
    stock: number;
    discounted_price: number | null;
  };
  quantity: number;
  color: string | null;
  size: string | null;
  price: number;
  total: number;
};

type CartContextType = {
  items: CartProduct[];
  totalAmount: number;
  itemCount: number;
  isLoading: boolean;
  addToCart: (
    productId: number,
    quantity?: number,
    color?: string | null,
    size?: string | null
  ) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  removeItem: (itemId: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartProduct[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user, session } = useAuth();

  // Fetch cart when user changes
  useEffect(() => {
    const fetchCart = async () => {
      if (!user || !session) {
        setItems([]);
        setTotalAmount(0);
        setItemCount(0);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch("/api/shop/cart");

        if (!response.ok) {
          throw new Error("Failed to fetch cart");
        }

        const data = await response.json();
        setItems(data.items || []);
        setTotalAmount(data.totalAmount || 0);
        setItemCount(data.itemCount || 0);
      } catch (error) {
        console.error("Error fetching cart:", error);
        toast.error("Failed to load your cart");
        setItems([]);
        setTotalAmount(0);
        setItemCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, [user, session]);

  const addToCart = async (
    productId: number,
    quantity: number = 1,
    color: string | null = null,
    size: string | null = null
  ) => {
    if (!user) {
      toast.error("Please sign in to add items to your cart");
      return false;
    }

    try {
      const response = await fetch("/api/shop/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, quantity, color, size }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add item to cart");
      }

      // Refresh cart
      const cartResponse = await fetch("/api/shop/cart");
      if (cartResponse.ok) {
        const data = await cartResponse.json();
        setItems(data.items || []);
        setTotalAmount(data.totalAmount || 0);
        setItemCount(data.itemCount || 0);
      }

      toast.success("Added to cart successfully");
      return true;
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add item to cart"
      );
      return false;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!user) return false;

    try {
      const response = await fetch(`/api/shop/cart/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update cart");
      }

      // Update local state
      const updatedItems = items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity,
              total: item.price * quantity,
            }
          : item
      );

      const newTotalAmount = updatedItems.reduce(
        (sum, item) => sum + item.total,
        0
      );
      const newItemCount = updatedItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      setItems(updatedItems);
      setTotalAmount(Number(newTotalAmount.toFixed(2)));
      setItemCount(newItemCount);

      return true;
    } catch (error) {
      console.error("Error updating cart:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update cart"
      );
      return false;
    }
  };

  const removeItem = async (itemId: string) => {
    if (!user) return false;

    try {
      const response = await fetch(`/api/shop/cart/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove item from cart");
      }

      // Update local state
      const updatedItems = items.filter((item) => item.id !== itemId);
      const newTotalAmount = updatedItems.reduce(
        (sum, item) => sum + item.total,
        0
      );
      const newItemCount = updatedItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      setItems(updatedItems);
      setTotalAmount(Number(newTotalAmount.toFixed(2)));
      setItemCount(newItemCount);

      toast.success("Item removed from cart");
      return true;
    } catch (error) {
      console.error("Error removing item from cart:", error);
      toast.error("Failed to remove item from cart");
      return false;
    }
  };

  const clearCart = async () => {
    if (!user) return false;

    try {
      const response = await fetch("/api/shop/cart/clear", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to clear cart");
      }

      // Update local state
      setItems([]);
      setTotalAmount(0);
      setItemCount(0);

      toast.success("Cart cleared");
      return true;
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error("Failed to clear cart");
      return false;
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalAmount,
        itemCount,
        isLoading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
