import { computed, Injectable, signal } from '@angular/core';
import { CartItem, Product } from '../models/models';

const CART_STORAGE_KEY = 'valleystore_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  readonly cartItems = signal<CartItem[]>(this.restoreCart());
  readonly itemCount = computed(() => this.cartItems().reduce((count, item) => count + item.quantity, 0));

  addToCart(product: Product): void {
    if (product.stock < 1) return;

    this.updateItems(items => {
      const current = items.find(item => item.product.id === product.id);
      if (current) {
        return items.map(item => item.product.id === product.id
          ? { ...item, product, quantity: Math.min(item.quantity + 1, product.stock) }
          : item);
      }

      return [...items, { product, quantity: 1 }];
    });
  }

  removeFromCart(productId: number): void {
    this.updateItems(items => items.filter(item => item.product.id !== productId));
  }

  setQuantity(product: Product, quantity: number): void {
    if (quantity < 1) {
      this.removeFromCart(product.id);
      return;
    }

    this.updateItems(items => items.map(item => item.product.id === product.id
      ? { ...item, product, quantity: Math.min(quantity, product.stock) }
      : item));
  }

  getTotal(): number {
    return this.cartItems().reduce((total, item) => total + item.product.price * item.quantity, 0);
  }

  clearCart(): void {
    this.updateItems(() => []);
  }

  private updateItems(update: (items: CartItem[]) => CartItem[]): void {
    const items = update(this.cartItems());
    this.cartItems.set(items);
    try {
      globalThis.localStorage?.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Cart changes remain available for the current page session.
    }
  }

  private restoreCart(): CartItem[] {
    try {
      const saved = globalThis.localStorage?.getItem(CART_STORAGE_KEY);
      if (!saved) return [];
      const items = JSON.parse(saved) as CartItem[];
      if (!Array.isArray(items) || items.some(item =>
        !item?.product || typeof item.product.id !== 'number' ||
        typeof item.quantity !== 'number' || item.quantity < 1)) {
        globalThis.localStorage?.removeItem(CART_STORAGE_KEY);
        return [];
      }
      return items;
    } catch {
      return [];
    }
  }
}
