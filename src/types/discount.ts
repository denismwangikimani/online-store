export interface Discount {
    id: number;
    percentage: number;
    start_date: string;
    end_date: string;
    product_ids: number[];
    created_at?: string;
  }