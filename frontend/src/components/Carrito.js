import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Carrito() {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    axios.get('/api/carrito')
      .then(response => {
        setProductos(response.data);
      })
      .catch(error => {
        console.error('Error al cargar el carrito:', error);
      });
  }, []);

  return (
    <div>
      <h1>Carrito de compras</h1>
      {productos.length === 0 ? (
        <p>El carrito está vacío.</p>
      ) : (
        <ul>
          {productos.map(producto => (
            <li key={producto.id}>
              {producto.nombre} - €{producto.precio} (Cantidad: {producto.cantidad})
              {producto.stock === 0 && <p style={{color: 'red'}}>Sin stock</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Carrito;