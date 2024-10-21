import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Productos() {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    axios.get('/api/productos')
      .then(response => {
        setProductos(response.data);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
      });
  }, []);

  return (
    <div>
      <h1>Productos</h1>
      <ul>
        {productos.map(producto => (
          <li key={producto.id}>
            {producto.nombre} - €{producto.precio}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Productos;