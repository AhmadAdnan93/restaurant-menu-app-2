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
}

async function apiRequest<T>(endpoint: string, config: ApiConfig = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, token } = config;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const baseUrl = getApiBaseUrl();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30s max wait
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
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
    apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

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
    // Use Next.js API route for DELETE to handle authentication properly
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
      // DELETE returns 204 No Content, so no JSON to parse
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
  uploadImage: async (file: File, token: string): Promise<{ url: string }> => {
    const formData = new FormData();
    // Explicitly append file with filename to ensure it's preserved
    formData.append('file', file, file.name);

    console.log('Uploading file:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    const baseUrl = getApiBaseUrl();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000); // 90s for uploads (cold start + processing)
    let response: Response;
    try {
      response = await fetch(`${baseUrl}/upload/image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type - browser will set it with boundary for FormData
        },
        body: formData,
        signal: controller.signal,
      });
    } catch (err: any) {
      clearTimeout(timeout);
      if (err?.name === 'AbortError') {
        throw new Error('Upload timed out. Please try again with a smaller image.');
      }
      throw err;
    }
    clearTimeout(timeout);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      console.error('Upload failed:', errorData);
      throw new Error(errorData.error || errorData.message || 'Upload failed');
    }

    return response.json();
  },
};

