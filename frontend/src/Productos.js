import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Productos() {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    // Llamada a la API de Flask para obtener los productos
    axios.get('http://127.0.0.1:5000/productos')
      .then(response => {
        setProductos(response.data); // Asegúrate de que esto sea correcto
      })
      .catch(error => console.log('Error al obtener los productos:', error));
  }, []);

  return (
    <div>
      <h1>Productos</h1>
      {productos.length === 0 ? (
        <p>No hay productos disponibles</p>
      ) : (
        <ul>
          {productos.map(producto => (
            <li key={producto.id}>
              <h2>{producto.nombre}</h2>
              <p>Precio: €{producto.precio}</p>
              <p>Stock: {producto.stock}</p>
              <form action={`/add_to_cart/${producto.id}`} method="POST">
                <button type="submit" disabled={producto.stock === 0}>
                  Añadir al carrito
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Productos;