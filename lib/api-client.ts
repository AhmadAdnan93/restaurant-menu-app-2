// API Client for .NET Backend

function getApiBaseUrl(): string {
  // Client in browser: use proxy when on production domain (avoids CORS to localhost)
  if (typeof window !== "undefined") {
    const isProduction = !window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1");
    if (isProduction) {
      return "/api/backend"; // Always proxy when deployed - no localhost
    }
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  }
  // Server: use BACKEND_API_URL or NEXT_PUBLIC_API_URL
  const serverUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (serverUrl) return serverUrl;
  return "http://localhost:5000/api";
}

interface ApiConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  token?: string;
  timeoutMs?: number;
}

async function apiRequest<T>(endpoint: string, config: ApiConfig = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, token, timeoutMs = 10000 } = config;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const baseUrl = getApiBaseUrl();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      cache: "no-store" as RequestCache, // Always fresh data for menus/restaurants
    });
  } catch (err: any) {
    clearTimeout(timeout);
    if (err?.name === 'AbortError') {
      throw new Error('Request timed out. The server may be slow or unavailable. Please try again.');
    }
    throw err;
  }
  clearTimeout(timeout);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || error.error || 'API request failed');
  }

  return response.json();
}

// Retry helper for cold-backend (login often fails on first try when Railway is sleeping)
async function withRetryOn504<T>(
  fn: () => Promise<T>,
  maxAttempts = 2,
  delayMs = 2000
): Promise<T> {
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const msg = lastError.message?.toLowerCase() || "";
      const isRetriable =
        lastError.name === "AbortError" ||
        lastError.name === "TypeError" ||
        msg.includes("timed out") ||
        msg.includes("timeout") ||
        msg.includes("504") ||
        msg.includes("network") ||
        msg.includes("failed to fetch");
      if (!isRetriable || attempt >= maxAttempts) throw lastError;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastError || new Error("Request failed");
}

// Auth API
export interface LoginResponse {
  token: string;
  userId: string;
  email: string;
  role: string;
  restaurantId?: string;
}

export const authApi = {
  register: (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  }) => apiRequest('/auth/register', { method: 'POST', body: data }),

  login: (email: string, password: string) =>
    withRetryOn504(() =>
      apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: { email, password },
      })
    ),

  getCurrentUser: (token: string) =>
    apiRequest('/auth/me', {
      method: 'GET',
      token,
    }),
};

// Restaurants API
export const restaurantsApi = {
  getAll: (publishedOnly: boolean = true) =>
    apiRequest(`/restaurants?publishedOnly=${publishedOnly}`),

  getBySlug: (slug: string) => apiRequest(`/restaurants/slug/${slug}`),

  getById: (id: string) => apiRequest(`/restaurants/${id}`),

  create: (data: any, token: string) =>
    apiRequest('/restaurants', {
      method: 'POST',
      body: data,
      token,
    }),

  update: (id: string, data: any, token: string) =>
    apiRequest(`/restaurants/${id}`, {
      method: 'PUT',
      body: data,
      token,
    }),

  delete: (id: string, token: string) => {
    return fetch(`/api/restaurants/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.error || error.message || 'Failed to delete restaurant');
      }
      return response.status === 204 ? {} : response.json();
    });
  },
};

// Categories API
export const categoriesApi = {
  getByRestaurant: (restaurantId: string) =>
    apiRequest(`/categories/restaurant/${restaurantId}`),

  create: (restaurantId: string, data: any, token: string) =>
    apiRequest(`/categories/restaurant/${restaurantId}`, {
      method: 'POST',
      body: data,
      token,
    }),

  update: (id: string, data: any, token: string) =>
    apiRequest(`/categories/${id}`, {
      method: 'PUT',
      body: data,
      token,
    }),

  delete: (id: string, token: string) =>
    apiRequest(`/categories/${id}`, {
      method: 'DELETE',
      token,
    }),
};

// Menu Items API
export const menuItemsApi = {
  getByCategory: (categoryId: string) =>
    apiRequest(`/menuitems/category/${categoryId}`),

  create: (categoryId: string, data: any, token: string) =>
    apiRequest(`/menuitems/category/${categoryId}`, {
      method: 'POST',
      body: data,
      token,
      timeoutMs: 25000, // 25s for cold start
    }),

  update: (id: string, data: any, token: string) =>
    apiRequest(`/menuitems/${id}`, {
      method: 'PUT',
      body: data,
      token,
    }),

  delete: (id: string, token: string) =>
    apiRequest(`/menuitems/${id}`, {
      method: 'DELETE',
      token,
    }),
};

// Orders API
export const ordersApi = {
  create: (data: any) =>
    apiRequest('/orders', {
      method: 'POST',
      body: data,
    }),

  getById: (id: string, token: string) =>
    apiRequest(`/orders/${id}`, { token }),

  getMyOrders: (token: string) =>
    apiRequest('/orders/my-orders', { token }),

  updateStatus: (id: string, status: string, token: string) =>
    apiRequest(`/orders/${id}/status`, {
      method: 'PUT',
      body: { status },
      token,
    }),
};

// Payments API
export const paymentsApi = {
  createPayPalOrder: (orderId: string) =>
    apiRequest('/payments/paypal/create', {
      method: 'POST',
      body: { orderId },
    }),

  capturePayPalOrder: (orderId: string, paypalOrderId: string) =>
    apiRequest('/payments/paypal/capture', {
      method: 'POST',
      body: { orderId, payPalOrderId: paypalOrderId },
    }),
};

// Upload API
export const uploadApi = {
  uploadImage: async (file: File, token: string, retry = false): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file, file.name);

    const baseUrl = getApiBaseUrl();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    let response: Response;
    try {
      response = await fetch(`${baseUrl}/upload/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
        signal: controller.signal,
      });
    } catch (err: any) {
      clearTimeout(timeout);
      if ((err?.name === 'AbortError' || err?.message?.includes?.('504')) && !retry) {
        await new Promise(r => setTimeout(r, 5000));
        return uploadApi.uploadImage(file, token, true);
      }
      if (err?.name === 'AbortError') throw new Error('Upload timed out. Try again.');
      throw err;
    }
    clearTimeout(timeout);

    if (!response.ok) {
      if ((response.status === 504 || response.status === 502) && !retry) {
        await new Promise(r => setTimeout(r, 5000));
        return uploadApi.uploadImage(file, token, true);
      }
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(errorData.error || errorData.message || 'Upload failed');
    }
    return response.json();
  },
};
