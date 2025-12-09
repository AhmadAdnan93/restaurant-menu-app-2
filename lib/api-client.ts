// API Client for .NET Backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}

// Auth API
export const authApi = {
  register: (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  }) => apiRequest('/auth/register', { method: 'POST', body: data }),

  login: (email: string, password: string) =>
    apiRequest('/auth/login', {
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

  delete: (id: string, token: string) =>
    apiRequest(`/restaurants/${id}`, {
      method: 'DELETE',
      token,
    }),
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
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  },
};

