import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Direccion.scss';  // Asegúrate de tener tu archivo de estilos

const DireccionForm = ({ onDireccionGuardada }) => {
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [provincia, setProvincia] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [pais, setPais] = useState('');
  const [telefono, setTelefono] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validar que los campos no estén vacíos
    if (!direccion || !ciudad || !provincia || !codigoPostal || !pais || !telefono) {
      setErrorMessage('Todos los campos son obligatorios');
      return;
    }

    // Enviar la dirección al backend
    axios.post('http://localhost:5000/api/guardar_direccion', {
      direccion, ciudad, provincia, codigo_postal: codigoPostal, pais, telefono
    })
      .then(response => {
        setErrorMessage('');
        if (onDireccionGuardada) onDireccionGuardada();  // Llamar a una función para actualizar el estado en el componente padre
      })
      .catch(error => {
        setErrorMessage('Error al guardar la dirección');
      });
  };

  return (
    <form onSubmit={handleSubmit} className="direccion-form">
      <h2>Agregar Nueva Dirección</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <input
        type="text"
        placeholder="Dirección"
        value={direccion}
        onChange={(e) => setDireccion(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Ciudad"
        value={ciudad}
        onChange={(e) => setCiudad(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Provincia"
        value={provincia}
        onChange={(e) => setProvincia(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Código Postal"
        value={codigoPostal}
        onChange={(e) => setCodigoPostal(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="País"
        value={pais}
        onChange={(e) => setPais(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Teléfono"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
        required
      />
      <button type="submit">Guardar Dirección</button>
    </form>
  );
};

export default DireccionForm;