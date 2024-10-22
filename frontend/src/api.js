import axios from 'axios';

const API_URL = 'http://localhost:5000';

// Función para obtener los productos
export const getProductos = () => axios.get(`${API_URL}/productos`, { withCredentials: true });

// Función para obtener el carrito
export const getCarrito = () => axios.get(`${API_URL}/carrito`, { withCredentials: true });

// Función para verificar la sesión
export const checkSession = () => axios.get(`${API_URL}/check_session`, { withCredentials: true });

// Función para obtener las direcciones del usuario
export const obtenerDirecciones = () => axios.get(`${API_URL}/api/obtener_direcciones`, { withCredentials: true });

// Función para guardar una nueva dirección
export const guardarDireccion = (direccionData) => axios.post(`${API_URL}/api/guardar_direccion`, direccionData, { withCredentials: true });