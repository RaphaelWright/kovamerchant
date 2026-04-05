import type {
  LoginResponse,
  DashboardSummary,
  MerchantProduct,
  MerchantOrder,
  MerchantInvoice,
  MomoAccount,
  PagedResponse,
  CreateProductPayload,
  UpdateProductPayload,
  UpdateOrderStatusPayload,
  SaveMomoPayload,
  OrderStatus,
  Category,
  SubCategory,
} from "./types";

const BASE_URL = "https://api.kovaonline.com";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("kova_token");
}

export function saveToken(token: string) {
  localStorage.setItem("kova_token", token);
}

export function clearToken() {
  localStorage.removeItem("kova_token");
  localStorage.removeItem("kova_merchant");
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Request failed" }));
    throw { status: res.status, message: err.message ?? "Request failed" };
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    request<LoginResponse>("/api/v1/merchant/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }, false),

  reAuthenticate: () =>
    request<LoginResponse>("/api/v1/merchant/auth/re-authenticate"),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────

export const dashboardApi = {
  getSummary: () =>
    request<DashboardSummary>("/api/v1/merchant/dashboard"),
};

// ── Products ──────────────────────────────────────────────────────────────────

export const productsApi = {
  list: (page = 0, size = 20, sort?: string) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (sort) params.set("sort", sort);
    return request<PagedResponse<MerchantProduct>>(`/api/v1/merchant/products?${params}`);
  },

  get: (productId: number) =>
    request<MerchantProduct>(`/api/v1/merchant/products/${productId}`),

  create: (payload: CreateProductPayload) =>
    request<MerchantProduct>("/api/v1/merchant/products", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (productId: number, payload: UpdateProductPayload) =>
    request<MerchantProduct>(`/api/v1/merchant/products/${productId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  delete: (productId: number) =>
    request<void>(`/api/v1/merchant/products/${productId}`, { method: "DELETE" }),
};

// ── Orders ────────────────────────────────────────────────────────────────────

export const ordersApi = {
  list: (status?: OrderStatus, page = 0, size = 20, sort?: string) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (status) params.set("status", status);
    if (sort) params.set("sort", sort);
    return request<PagedResponse<MerchantOrder>>(`/api/v1/merchant/orders?${params}`);
  },

  get: (orderId: string) =>
    request<MerchantOrder>(`/api/v1/merchant/orders/${orderId}`),

  updateStatus: (orderId: string, payload: UpdateOrderStatusPayload) =>
    request<MerchantOrder>(`/api/v1/merchant/orders/${orderId}/status`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};

// ── Invoices ──────────────────────────────────────────────────────────────────

export const invoicesApi = {
  list: (page = 0, size = 20) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    return request<PagedResponse<MerchantInvoice>>(`/api/v1/merchant/dashboard/invoices?${params}`);
  },

  get: (invoiceId: number) =>
    request<MerchantInvoice>(`/api/v1/merchant/dashboard/invoices/${invoiceId}`),
};

// ── Categories ────────────────────────────────────────────────────────────────

export const categoriesApi = {
  getAll: () =>
    request<Category[]>("/api/v1/categories/all", {}, false),

  getSubCategories: (categoryId: number) =>
    request<SubCategory[]>(`/api/v1/sub-categories/all/category/${categoryId}`, {}, false),
};

// ── MoMo Account ──────────────────────────────────────────────────────────────

export const momoApi = {
  get: () =>
    request<MomoAccount>("/api/v1/merchant/dashboard/momo-account"),

  save: (payload: SaveMomoPayload) =>
    request<MomoAccount>("/api/v1/merchant/dashboard/momo-account", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
