import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext'; 
import { useNavigate } from 'react-router-dom';  // Para redirigir al usuario si no tiene acceso
import '../styles/ImportarProductos.scss'; 

const ImportarProductos = () => {
  const { usuario } = useContext(AuthContext);  // Obtener el usuario autenticado
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!usuario) {
      // Redirigir al login si el usuario no está autenticado
      navigate('/login');
    } else if (usuario.rol !== 'admin') {
      // Redirigir a una página sin permiso si el usuario no es administrador
      setError('No tienes permiso para ver esta página.');
    }
  }, [usuario, navigate]);

  // Manejo del archivo seleccionado
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Manejo del envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Por favor, selecciona un archivo CSV o Excel.');
      setMessage('');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    // Envío del archivo al backend
    axios.post('http://localhost:5000/api/importar_productos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true,
    })
    .then(response => {
      setMessage(response.data.message || 'Productos importados correctamente.');
      setError('');
    })
    .catch(error => {
      setError('Error al importar productos. Inténtalo de nuevo.');
      setMessage('');
      console.error('Error al importar productos:', error);
    });
  };

  // Mostrar un mensaje de error si el usuario no tiene acceso
  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="importar-productos-container">
      <h1>Importar Productos</h1>
      
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
      
      <form className="importar-productos-form" onSubmit={handleSubmit}>
        <input
          type="file"
          accept=".csv, .xlsx, .xls"
          onChange={handleFileChange}
          className="file-input"
        />
        <button type="submit" className="submit-button">Subir archivo</button>
      </form>
    </div>
  );
};

export default ImportarProductos;