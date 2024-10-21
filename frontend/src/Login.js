import React, { useState } from 'react';
import axios from 'axios';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://127.0.0.1:5000/login', { username, password })
      .then(response => {
        if (response.data.success) {
          window.location.href = '/profile';
        } else {
          alert('Usuario o contraseña incorrectos');
        }
      })
      .catch(error => console.log(error));
  };

  return (
    <div>
      <h1>Iniciar Sesión</h1>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Usuario" 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Contraseña" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
        />
        <button type="submit">Iniciar sesión</button>
      </form>
    </div>
  );
}

export default Login;