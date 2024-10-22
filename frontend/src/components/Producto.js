import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/Producto.scss'; // Añade tus estilos personalizados

const Producto = () => {
  const { id } = useParams(); // Obtenemos el ID del producto desde la URL
  const [producto, setProducto] = useState(null);
  const [error, setError] = useState(null);
  const [mostrarMas, setMostrarMas] = useState(false); // Estado para mostrar más detalles

  useEffect(() => {
    // Llamada a la API para obtener los detalles del producto
    axios.get(`http://localhost:5000/api/producto/${id}`)
      .then(response => {
        setProducto(response.data);
      })
      .catch(error => {
        setError('Error al cargar los detalles del producto');
      });
  }, [id]);

  const toggleMostrarMas = () => {
    setMostrarMas(!mostrarMas); // Alternar entre mostrar más y menos
  };

  if (error) {
    return <p>{error}</p>;
  }

  if (!producto) {
    return <p>Cargando detalles del producto...</p>;
  }

  // Separar las imágenes del producto si hay varias
  const imagenes = producto.imagenes ? producto.imagenes.split(',') : [];

  return (
    <div className="producto-detalle">
      <h1>{producto.nombre}</h1>
      <p>Precio: €{producto.precio}</p>
      <p>Descripción corta: {producto.descripcion_corta}</p> {/* Mostrar la descripción corta */}

      {/* Mostrar la imagen del producto */}
      {imagenes.length > 0 && (
        <img 
          src={`http://localhost:5000/static/images/${imagenes[0]}`} 
          alt={producto.nombre} 
          className="producto-imagen"
        />
      )}

      {/* Botón para alternar entre mostrar más y menos */}
      <button className="btn-mostrar-mas" onClick={toggleMostrarMas}>
        {mostrarMas ? "Mostrar menos" : "Mostrar más"}
      </button>

      {/* Mostrar más detalles si se hace clic en el botón */}
      {mostrarMas && (
        <div className="informacion-adicional">
          <p><strong>Descripción completa:</strong> {producto.descripcion_larga}</p>
          <p><strong>Stock disponible:</strong> {producto.stock}</p>
        </div>
      )}
    </div>
  );
};

export default Producto;