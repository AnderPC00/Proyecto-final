import React, { useEffect, useState } from 'react';
import { getRutaProtegidaTest } from '../api';

const RutaProtegidaTest = () => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getRutaProtegidaTest();
        setMessage(response.message);  // Asegurarse que el campo sea `message` desde el backend
      } catch (error) {
        setError('No tienes acceso a esta ruta protegida.');
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Prueba de Ruta Protegida</h1>
      {message && <p>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default RutaProtegidaTest;