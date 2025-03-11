export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface BillingAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export interface ShippingDetails {
  name: string;
  phone: string;
  address: ShippingAddress;
  saveDetails: boolean;
  billingAddress?: BillingAddress;
}
