import React, { createContext, useState } from 'react';

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
        setUsuario(null);
        localStorage.removeItem('usuario');
    };

    return (
        <AuthContext.Provider value={{ usuario, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};