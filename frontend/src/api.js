import axios from 'axios';

const API_URL = 'http://localhost:5000';

export const getProductos = () => axios.get(`${API_URL}/productos`);
export const getCarrito = () => axios.get(`${API_URL}/carrito`);