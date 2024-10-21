import React, { createContext, useState } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(() => {
        // Inicialmente, cargar el usuario de localStorage si está disponible
        const usuarioGuardado = localStorage.getItem('usuario');
        return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
    });

    const login = (usuarioData) => {
        setUsuario(usuarioData);
        localStorage.setItem('usuario', JSON.stringify(usuarioData));
    };

    const logout = () => {
        // Enviar solicitud al backend para cerrar sesión
        axios.post('http://localhost:5000/api/logout', {}, { withCredentials: true })
            .then(() => {
                // Eliminar el usuario y vaciar el carrito en el frontend
                setUsuario(null);
                localStorage.removeItem('usuario');
                console.log('Cierre de sesión exitoso y carrito vaciado');
            })
            .catch(error => {
                console.error('Error al cerrar sesión:', error);
            });
    };

    return (
        <AuthContext.Provider value={{ usuario, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};