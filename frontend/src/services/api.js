// API Service - Uses API Gateway
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const api = {
  // User Service
  users: {
    register: (data) => fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    
    login: (data) => fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    
    profile: () => fetch(`${API_BASE_URL}/users/profile`, {
      headers: getAuthHeaders()
    }).then(res => res.json()),
    
    verify: () => fetch(`${API_BASE_URL}/users/verify`, {
      headers: getAuthHeaders()
    }).then(res => res.json())
  },

  // Product Service
  products: {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return fetch(`${API_BASE_URL}/products/products?${queryString}`, {
        headers: getAuthHeaders()
      }).then(res => res.json());
    },
    
    getById: (id) => fetch(`${API_BASE_URL}/products/products/${id}`, {
      headers: getAuthHeaders()
    }).then(res => res.json()),
    
    create: (data) => fetch(`${API_BASE_URL}/products/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }).then(res => res.json())
  },

  // Inventory Service
  inventory: {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return fetch(`${API_BASE_URL}/inventory/inventory?${queryString}`, {
        headers: getAuthHeaders()
      }).then(res => res.json());
    },
    
    getByProductId: (productId) => fetch(`${API_BASE_URL}/inventory/inventory/${productId}`, {
      headers: getAuthHeaders()
    }).then(res => res.json()),
    
    create: (data) => fetch(`${API_BASE_URL}/inventory/inventory`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }).then(res => res.json())
  },

  // Order Service
  orders: {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return fetch(`${API_BASE_URL}/orders/orders?${queryString}`, {
        headers: getAuthHeaders()
      }).then(res => res.json());
    },
    
    getById: (id) => fetch(`${API_BASE_URL}/orders/orders/${id}`, {
      headers: getAuthHeaders()
    }).then(res => res.json()),
    
    getByCustomer: (customerId, params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return fetch(`${API_BASE_URL}/orders/orders/customer/${customerId}?${queryString}`, {
        headers: getAuthHeaders()
      }).then(res => res.json());
    },
    
    create: (data) => fetch(`${API_BASE_URL}/orders/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }).then(res => res.json())
  },

  // Search Service
  search: {
    products: (query, params = {}) => {
      const searchParams = new URLSearchParams({ q: query, ...params });
      return fetch(`${API_BASE_URL}/search/search?${searchParams}`, {
        headers: getAuthHeaders()
      }).then(res => res.json());
    },
    
    suggestions: (query) => {
      const searchParams = new URLSearchParams({ q: query });
      return fetch(`${API_BASE_URL}/search/suggestions?${searchParams}`, {
        headers: getAuthHeaders()
      }).then(res => res.json());
    }
  },

  // Payment Service
  payments: {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return fetch(`${API_BASE_URL}/payments/payments?${queryString}`, {
        headers: getAuthHeaders()
      }).then(res => res.json());
    },
    
    create: (data) => fetch(`${API_BASE_URL}/payments/payments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }).then(res => res.json())
  },

  // Review Service
  reviews: {
    getByProduct: (productId, params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return fetch(`${API_BASE_URL}/reviews/reviews/product/${productId}?${queryString}`, {
        headers: getAuthHeaders()
      }).then(res => res.json());
    },
    
    create: (data) => fetch(`${API_BASE_URL}/reviews/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }).then(res => res.json())
  },

  // Shipping Service
  shipping: {
    getMethods: () => fetch(`${API_BASE_URL}/shipping/methods`, {
      headers: getAuthHeaders()
    }).then(res => res.json()),
    
    getShipments: (orderId) => fetch(`${API_BASE_URL}/shipping/shipments/order/${orderId}`, {
      headers: getAuthHeaders()
    }).then(res => res.json())
  },

  // Analytics Service
  analytics: {
    dashboard: (period = '7d') => fetch(`${API_BASE_URL}/analytics/dashboard?period=${period}`, {
      headers: getAuthHeaders()
    }).then(res => res.json())
  }
};

