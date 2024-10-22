import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.scss';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
  
    axios.post('http://localhost:5000/register', formData)
      .then(response => {
        // Si el registro es exitoso
        navigate('/login');  // Redirigir a la página de inicio de sesión
      })
      .catch(error => {
        console.error("Error al registrarse:", error);
      });
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h1>Registrarse</h1>
        <form className="register-form" onSubmit={handleSubmit}>
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
          <button type="submit">Registrarse</button>
        </form>
      </div>
    </div>
  );
};

export default Register;