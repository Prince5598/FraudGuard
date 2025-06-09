import axios from 'axios';

const BASE_URL = 'http://localhost:5000'; // Replace with your actual API URL

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials : true,
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 responses (token expired)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear auth state and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  userLogin: async (email: string, password: string) => {
    // Remove any existing tokens before login
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    
    const response = await api.post('/api/user/login', { email, password });
    if (response.data.data) {
      console.log(response.data.data);
      localStorage.setItem('token', response.data.data);
      localStorage.setItem('isAdmin', 'false');
    }
    return response;
  },
  
  userSignup: async (firstName: string, lastName: string, email: string, password: string) => {
    console.log(firstName);
    const response = await api.post('/api/user/signup', { 
      firstName, 
      lastName, 
      email, 
      password 
    });
    return response;
  },
  
  userLogout: async () => {
    try {
      await api.get('/api/logout/user');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
    }
  },
  
  adminLogin: async (email: string, password: string) => {
    // Remove any existing tokens before login
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    
    const response = await api.post('/api/admin/login', { email, password });
    if (response.data.data) {
      console.log("token  ",response.data.data);
      localStorage.setItem('token', response.data.data);
      localStorage.setItem('isAdmin', 'true');
    }
    return response;
  },
  
  adminSignup: async (firstName: string, lastName: string, email: string, password: string) => {
    const response = await api.post('/api/admin/signup', { 
      firstName, 
      lastName, 
      email, 
      password 
    });
    return response;
  },
  
  adminLogout: async () => {
    try {
      await api.get('/api/logout/admin');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
    }
  },
};

// User APIs
export const userAPI = {
  getDashboard: () => api.get('/api/user/dashboard'),
  
  getProfile: () => api.get('/api/user/profile'),
  
  updateProfile: (firstName: string, lastName: string) => 
    api.put('/api/user/profile', { firstName, lastName }),
  
  submitTransaction: (transactionData: any) => 
    api.post('/api/user/form-transaction', transactionData),
  
  getTransactions: () => api.get('/api/user/transactions'),
  
  downloadTransactions: () => 
    api.get('/api/user/download-transactions', { responseType: 'blob' }),
};

// Admin APIs
export const adminAPI = {
  getAllUsers: () => api.get('/api/admin/AllUsers'),
  
  searchUser: (queryParams: any) => 
    api.get('/api/admin/search-user', { params: queryParams }),
  
  getFilteredTransactions: (filters: any) => 
    api.get('/api/admin/advanced-transactions-filter', { params: filters }),
  
  getStatistics: () => api.get('/api/admin/statistics-summary'),
};

export default api;