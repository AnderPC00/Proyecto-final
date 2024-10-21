import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Carrito() {
  const [productos, setProductos] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Llamada a la API de Flask para obtener los productos del carrito
    axios.get('http://127.0.0.1:5000/carrito')
      .then(response => {
        setProductos(response.data.productos);
        setTotal(response.data.total);
      })
      .catch(error => console.log(error));
  }, []);

  const handleActualizarCantidad = (productoId, cantidad) => {
    axios.post(`/update_cart/${productoId}`, { cantidad })
      .then(() => {
        // Actualiza la UI después de cambiar la cantidad
        setProductos(prev => prev.map(p => 
          p.id === productoId ? { ...p, cantidad } : p
        ));
        setTotal(prev => prev + productos.find(p => p.id === productoId).precio * cantidad);
      })
      .catch(error => console.log(error));
  };

  return (
    <div>
      <h1>Carrito de compras</h1>
      <ul>
        {productos.map(producto => (
          <li key={producto.id}>
            <h2>{producto.nombre}</h2>
            <p>Precio: €{producto.precio}</p>
            <p>Cantidad: {producto.cantidad}</p>
            <form onSubmit={() => handleActualizarCantidad(producto.id, producto.cantidad - 1)}>
              <button type="submit">Actualizar cantidad</button>
            </form>
          </li>
        ))}
      </ul>
      <h3>Total: €{total}</h3>
      <button disabled={productos.some(p => p.stock === 0)}>Proceder al pago</button>
    </div>
  );
}

export default Carrito;