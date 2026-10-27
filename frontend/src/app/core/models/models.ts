export interface User {
  id: number;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresInSeconds: number;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  brand?: string;
  featured: boolean;
  imageUrl?: string | null;
}

export interface CartItem {
  id?: number;
  product: Product;
  quantity: number;
}

export interface OrderLineRequest {
  productId: number;
  quantity: number;
}

export interface CustomerAddress {
  id: number;
  name: string;
  value: string;
}

export interface CustomerAddressRequest {
  name: string;
  value: string;
}

export interface CheckoutRequest {
  addressId: number;
  items: OrderLineRequest[];
}

export interface OrderRequest extends CheckoutRequest {}

export interface OrderResponse {
  orderId: number;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
}