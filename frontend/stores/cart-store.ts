import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  produto_id: string;
  loja_id: string;
  nome: string;
  sku: string;
  preco_unitario: number;
  quantidade: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantidade">, quantidade?: number) => void;
  removeItem: (produto_id: string) => void;
  updateQuantity: (produto_id: string, quantidade: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, quantidade = 1) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.produto_id === item.produto_id
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.produto_id === item.produto_id
                  ? { ...i, quantidade: i.quantidade + quantidade }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantidade }] };
        });
      },
      removeItem: (produto_id) => {
        set((state) => ({
          items: state.items.filter((i) => i.produto_id !== produto_id),
        }));
      },
      updateQuantity: (produto_id, quantidade) => {
        if (quantidade <= 0) {
          get().removeItem(produto_id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.produto_id === produto_id ? { ...i, quantidade } : i
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantidade, 0),
      totalPrice: () =>
        get().items.reduce(
          (sum, i) => sum + i.preco_unitario * i.quantidade,
          0
        ),
    }),
    { name: "marketplace-cb-cart" }
  )
);
