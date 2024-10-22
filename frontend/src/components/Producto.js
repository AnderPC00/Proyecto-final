import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/Producto.scss'; // Añade tus estilos personalizados

const Producto = () => {
  const { id } = useParams(); // Obtenemos el ID del producto desde la URL
  const [producto, setProducto] = useState(null);
  const [error, setError] = useState(null);

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
      <p>Descripción: {producto.descripcion}</p>

      {/* Mostrar la imagen del producto */}
      {imagenes.length > 0 && (
        <img 
          src={`http://localhost:5000/static/images/${imagenes[0]}`} 
          alt={producto.nombre} 
          className="producto-imagen"
        />
      )}
    </div>
  );
};

export default Producto;