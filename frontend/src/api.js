import axios from 'axios';

const API_URL = 'http://localhost:5000';

export const getProductos = () => axios.get(`${API_URL}/productos`, { withCredentials: true });
export const getCarrito = () => axios.get(`${API_URL}/carrito`, { withCredentials: true });
export const checkSession = () => axios.get(`${API_URL}/check_session`, { withCredentials: true });

