// Add these to your existing types.ts file

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: string;
  total_amount: number;
  payment_intent_id: string | null;
  shipping_address: any;
  billing_address: any;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    email: string;
  };
  customer_profiles?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
    image_url: string | null;
  };
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: number;
  quantity: number;
  price: number;
  color: string | null;
  size: string | null;
  created_at: string;
  products: {
    id: number;
    name: string;
    price: number;
    image_url: string;
    category: string;
  };
}
