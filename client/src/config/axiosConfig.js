import axios from 'axios';

const axiosInstance = axios.create(
  {
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:4000"
}
);

axiosInstance.interceptors.request.use(
  (config) => {
    // ════════════════════════════════════════════════════════════════════════
    // FIX: Get token from localStorage 'user' JSON object
    // ════════════════════════════════════════════════════════════════════════
    
    try {
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        // Parse the JSON to get token
        const userData = JSON.parse(storedUser);
        const token = userData.token;
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('✓ Token attached to request'); // For debugging
        } else {
          console.warn('⚠️ Token not found in stored user data');
        }
      } else {
        console.warn('⚠️ No user data in localStorage');
      }
    } catch (error) {
      console.error('❌ Error retrieving token from localStorage:', error);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;