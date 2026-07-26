"use client";

import { useState, useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, ProductVariant } from "@/types";

export interface CartItemState {
  id: string;
  productId: string;
  variantId: string | null;
  name: string;
  price: number;
  image: string;
  quantity: number;
  maxQuantity: number;
}

interface CartStore {
  items: CartItemState[];
  addItem: (product: Product, variant?: ProductVariant | null, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, variant = null, quantity = 1) => {
        const itemId = variant ? `${product.id}-${variant.id}` : product.id;
        const existingItem = get().items.find((item) => item.id === itemId);

        if (existingItem) {
          set({
            items: get().items.map((item) =>
              item.id === itemId
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          const price = variant?.price ? Number(variant.price) : product.salePrice ? Number(product.salePrice) : Number(product.price);
          const stockQuantity = variant ? variant.stockQuantity : product.stockQuantity;
          const image = product.images?.[0]?.url || "";

          set({
            items: [
              ...get().items,
              {
                id: itemId,
                productId: product.id,
                variantId: variant?.id || null,
                name: product.name,
                price,
                image,
                quantity,
                maxQuantity: stockQuantity,
              },
            ],
          });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage",
    }
  )
);

export function useCart() {
  const [isHydrated, setIsHydrated] = useState(false);
  const store = useCartStore();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const items = isHydrated ? store.items : [];
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    ...store,
    items,
    totalItems,
    subtotal,
    isHydrated,
  };
}
