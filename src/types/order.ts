export interface OrderItem {
  id: string;
  order_id: string;
  product_id: number;
  quantity: number;
  price: number;
  color?: string | null;
  size?: string | null;
  created_at: string;
  products?: {
    id: number;
    name: string;
    price: number;
    image_url?: string;
    category?: string;
  };
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: string;
  total_amount: number;
  payment_intent_id?: string;
  shipping_address?: {
    phone?: string;
    name?: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  billing_address?: {
    name?: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  created_at: string;
  updated_at?: string;
  profiles?: {
    id: string;
    email: string;
  };
  customer_profiles?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    image_url?: string;
  };
  items?: OrderItem[];

  // Add metadata
  metadata?: {
    userId?: string;
    orderNumber?: string;
    checkoutType?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
  };
}
