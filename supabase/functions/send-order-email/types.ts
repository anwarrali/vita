export interface OrderEmailItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderEmailPayload {
  orderId: string;
  customerName: string;
  phone: string;
  address: string;
  region: string;
  regionLabel: string;
  notes: string | null;
  items: OrderEmailItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
}
