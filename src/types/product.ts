export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock: number;
  created_at?: string;
  discount_percentage?: number;
  discounted_price?: number;
  colors: string[];
  sizes: string[];
}
