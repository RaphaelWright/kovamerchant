export type MerchantStatus = "PENDING_APPROVAL" | "ACTIVE" | "SUSPENDED" | "DEACTIVATED";
export type OrderStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID";
export type PaymentMethod = "MOBILE_MONEY" | "PAY_ON_DELIVERY";
export type MomoNetwork = "MTN" | "VODAFONE" | "AIRTELTIGO";
export type InvoiceStatus = "GENERATED" | "SENT" | "PAID";
export type BillingCycle = "WEEKLY" | "MONTHLY";

export interface MomoAccount {
  id: number;
  accountName: string;
  phoneNumber: string;
  network: MomoNetwork;
}

export interface MerchantInfo {
  id: string;
  businessName: string;
  email: string;
  phoneNumber: string;
  description: string | null;
  logoUrl: string | null;
  status: MerchantStatus;
  billingCycle: BillingCycle;
  billingStartDate: string;
  createdAt: string;
  updatedAt: string;
  momoAccount: MomoAccount | null;
}

export interface DashboardSummary {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalInvoices: number;
  merchantInfo: MerchantInfo;
}

export interface MerchantProduct {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stockQuantity: number;
  images: string[];
  specifications: Record<string, string> | null;
  categoryName: string;
  subCategoryName: string | null;
  merchantId: string;
  merchantBusinessName: string;
  createdAt: string;
  updatedAt: string;
}

export interface MerchantOrder {
  id: number;
  orderId: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  totalPrice: number;
  quantity: number;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  deliveryAddress: string | null;
  notes: string | null;
  productId: number;
  productName: string;
  productPrice: number;
  merchantId: string;
  merchantBusinessName: string;
  merchantMomo: MomoAccount | null;
  orderDate: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: number;
  orderId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  buyerName: string;
  buyerPhone: string;
  orderDate: string;
}

export interface MerchantInvoice {
  id: number;
  invoiceNumber: string;
  merchantId: string;
  merchantBusinessName: string;
  merchantEmail: string;
  periodStart: string;
  periodEnd: string;
  totalOrderValue: number;
  totalOrders: number;
  status: InvoiceStatus;
  generatedAt: string;
  items: InvoiceItem[];
}

export interface LoginResponse {
  token: string;
  status: string;
  merchant: MerchantInfo;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface Category {
  id: number;
  name: string;
  imageUrl: string;
  description: string;
  productCount: number;
}

export interface SubCategory {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  categoryId: number;
  categoryName: string;
}

export interface ApiError {
  status: string;
  message: string;
  timestamp: string;
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  price: number;
  stockQuantity?: number;
  categoryId: number;
  subCategoryId?: number | null;
  images?: string[];
  specifications?: Record<string, string>;
}

export interface UpdateProductPayload {
  name?: string;
  description?: string;
  price?: number;
  stockQuantity?: number;
  images?: string[];
  specifications?: Record<string, string>;
}

export interface UpdateOrderStatusPayload {
  orderStatus: OrderStatus;
  paymentStatus?: PaymentStatus;
}

export interface SaveMomoPayload {
  accountName: string;
  phoneNumber: string;
  network: MomoNetwork;
}
