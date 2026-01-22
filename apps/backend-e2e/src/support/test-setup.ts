 
import axios from 'axios';

module.exports = async function () {
  // Configure axios for tests to use.
  const host = process.env.HOST ?? 'localhost';
  const port = process.env.PORT ?? '3000';
  axios.defaults.baseURL = `http://${host}:${port}`;
  axios.defaults.withCredentials = true;

  // Add debug interceptor for requests with Authorization
  axios.interceptors.request.use((config) => {
    const authHeader = config.headers.Authorization;
    if (typeof authHeader === 'string') {
      console.log(`🚀 [${config.method?.toUpperCase()}] ${config.url} - Token: ${authHeader.substring(0, 30)}...`);
    }
    return config;
  });

  // Add debug interceptor for responses
  axios.interceptors.response.use(
    (response) => {
      console.log(`✅ [${response.status}] ${response.config.url}`);
      return response;
    },
    (error) => {
      const url = error.config?.url;
      const status = error.response?.status;
      const message = error.response?.data?.message;
      console.log(`❌ [${status}] ${url} - Error: ${message || error.message}`);
      return Promise.reject(error);
    }
  );
};
