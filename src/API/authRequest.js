import axios from 'axios';

const BASE_URL = process.env.REACT_APP_SERVER_URL || 'https://postagramm-backend.onrender.com/api';
// const BASE_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:4000/api';

const API = axios.create({ baseURL: BASE_URL });

export const register = (formData) => API.post('/signup', formData);
export const login = (formData) => API.post('/login', formData);