import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(() => {
        const usuarioGuardado = localStorage.getItem('usuario');
        return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
    });

    const [carrito, setCarrito] = useState(() => {
        const carritoGuardado = sessionStorage.getItem('cart');
        return carritoGuardado ? JSON.parse(carritoGuardado) : [];
    });

    const [carritoCount, setCarritoCount] = useState(0);  // Nuevo estado para el contador del carrito

    // Sincronizar el carrito con sessionStorage
    useEffect(() => {
        sessionStorage.setItem('cart', JSON.stringify(carrito));

        // Recalcular la cantidad total de productos en el carrito
        const count = carrito.reduce((total, item) => total + item.cantidad, 0);
        setCarritoCount(count);
    }, [carrito]);

    const login = (usuarioData) => {
        setUsuario(usuarioData);
        localStorage.setItem('usuario', JSON.stringify(usuarioData));
        axios.get('http://localhost:5000/api/carrito', { withCredentials: true })
            .then((response) => {
                if (response.data.cart) {
                    setCarrito(response.data.cart);
                    const count = response.data.cart.reduce((total, item) => total + item.cantidad, 0);
                    setCarritoCount(count);  // Actualizar la cantidad de productos en el carrito
                }
            })
            .catch(error => {
                console.error('Error al recuperar el carrito del usuario:', error);
            });
    };

    const logout = () => {
        axios.post('http://localhost:5000/api/logout', {}, { withCredentials: true })
            .then(() => {
                setUsuario(null);
                localStorage.removeItem('usuario');
                setCarrito([]);
                setCarritoCount(0);  // Resetear el contador del carrito
                sessionStorage.removeItem('cart');
            })
            .catch(error => {
                console.error('Error al cerrar sesión:', error);
            });
    };

    return (
        <AuthContext.Provider value={{ usuario, login, logout, carrito, setCarrito, carritoCount, setCarritoCount }}>
            {children}
        </AuthContext.Provider>
    );
};