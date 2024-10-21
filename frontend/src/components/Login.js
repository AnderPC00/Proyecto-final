import React, { useState, useContext } from 'react';  // Una sola importación de React
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';  // Importa el contexto
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);  // Obtén la función login del contexto
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        axios.post('http://localhost:5000/api/login', { username, password })
            .then(response => {
                login(response.data);  // Llama a la función login para guardar el usuario
                navigate('/carrito');  // Redirige al carrito
            })
            .catch(error => {
                console.error('Error al iniciar sesión:', error);
            });
    };

    return (
        <div>
            <h1>Iniciar Sesión</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nombre de usuario"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    required
                />
                <button type="submit">Iniciar sesión</button>
            </form>
        </div>
    );
};

export default Login;