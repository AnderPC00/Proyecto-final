import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/Home.scss'; 

const ProductoDetalle = () => {
  const { id } = useParams(); // Obtener el id del producto desde la URL
  const [producto, setProducto] = useState(null);

  useEffect(() => {
    // Cargar los detalles del producto basado en el ID
    axios.get(`http://localhost:5000/api/producto/${id}`)
      .then(response => {
        setProducto(response.data);
      })
      .catch(error => {
        console.error('Error al cargar los detalles del producto:', error);
      });
  }, [id]);

  if (!producto) {
    return <p>Cargando detalles del producto...</p>;
  }

  return (
    <div>
      <h1>{producto.nombre}</h1>
      <img 
        src={`http://localhost:5000/static/images/${producto.imagen}`} 
        alt={producto.nombre} 
      />
      <p>Precio: €{producto.precio}</p>
      <p>Descripción: {producto.descripcion}</p>
      {/* Otros detalles del producto */}
    </div>
  );
};

export default ProductoDetalle;