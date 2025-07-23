import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,   // CRA: process.env.REACT_APP_API_URL
  withCredentials: false                  // true si usas cookies httpOnly
});

export default api;