import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.scss';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');  // Cambié "correo" por "email" para consistencia con el backend
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');  // Para mensajes de error
  const navigate = useNavigate();

  // Función para validar correo
  const validarEmail = (email) => {
    const regex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    return regex.test(email);
  };

  // Función para validar contraseña segura
  const validarContrasena = (password) => {
    return password.length >= 8 && /\d/.test(password) && /[a-zA-Z]/.test(password);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones de correo y contraseña
    if (!validarEmail(email)) {
      setErrorMessage('Por favor, ingresa un correo válido');
      return;
    }

    if (!validarContrasena(password)) {
      setErrorMessage('La contraseña debe tener al menos 8 caracteres, un número y una letra');
      return;
    }

    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('email', email);  // Cambié "correo" a "email" para consistencia con el backend
    formData.append('password', password);
  
    axios.post('http://localhost:5000/register', formData)
      .then(response => {
        navigate('/login');  // Redirigir a la página de inicio de sesión
      })
      .catch(error => {
        console.error("Error al registrarse:", error);
        setErrorMessage('Error en el registro, inténtalo nuevamente');
      });
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h1>Registrarse</h1>
        {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Mostrar mensaje de error */}
        <form className="register-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nombre de usuario"
            required
          />
          <input
            type="email"  // Validación básica de correo en HTML
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            required
          />
          <button type="submit">Registrarse</button>
        </form>
      </div>
    </div>
  );
};

export default Register;