import React, { useState, useContext } from 'react';  
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';  
import { useNavigate } from 'react-router-dom';
import '../styles/Login.scss';

const Login = () => {
    const [email, setEmail] = useState('');  // Cambiado a email
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');  
    const { login } = useContext(AuthContext);  
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        axios.post('http://localhost:5000/api/login', { email, password })  // Cambiado a email
            .then(response => {
                login(response.data);  
                navigate('/carrito');  
            })
            .catch(error => {
                if (error.response && error.response.status === 401) {
                    setErrorMessage('Correo o contraseña incorrectos');  // Cambiado a correo
                } else {
                    setErrorMessage('Ocurrió un error, por favor intente de nuevo');
                }
                console.error('Error al iniciar sesión:', error);
            });
    };

    return (
        <div className="login-page"> {/* Añadimos la clase "login-page" */}
            <div className="login-container">
                <h1>Iniciar Sesión</h1>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <form className="login-form" onSubmit={handleSubmit}>
                    <input
                        type="email"  // Cambiado a email
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Correo electrónico"  // Cambiado a correo electrónico
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
        </div>
    );
};

export default Login;