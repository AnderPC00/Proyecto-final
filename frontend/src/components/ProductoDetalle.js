import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'; // Usar useSearchParams para obtener la query string
import axios from 'axios';
import '../styles/ProductoDetalle.scss'; 

const ProductoDetalle = () => {
  const [searchParams] = useSearchParams();  // Obtener la query string
  const nombre = searchParams.get('nombre'); // Sacar el nombre del producto
  const [producto, setProducto] = useState(null);
  const [colorSeleccionado, setColorSeleccionado] = useState('');
  const [capacidadSeleccionada, setCapacidadSeleccionada] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (nombre) {
      // Buscar el producto basado en el nombre
      axios.get(`http://localhost:5000/api/producto`, { params: { nombre } })
        .then(response => {
          setProducto(response.data);
        })
        .catch(error => {
          console.error('Error al cargar los detalles del producto:', error);
        });
    }
  }, [nombre]);

  const agregarAlCarrito = () => {
    if (!colorSeleccionado || !capacidadSeleccionada) {
      setMensaje('Debes seleccionar un color y una capacidad');
      return;
    }

    // Agregar producto al carrito
    axios.post(`http://localhost:5000/api/add_to_cart/${producto.id}`, {
      color: colorSeleccionado,
      capacidad: capacidadSeleccionada,
      cantidad: cantidad
    })
      .then(response => {
        setMensaje('Producto añadido al carrito correctamente');
      })
      .catch(error => {
        console.error('Error al agregar el producto al carrito:', error);
        setMensaje('Error al agregar el producto al carrito');
      });
  };

  if (!producto) {
    return <p>Cargando detalles del producto...</p>;
  }

  return (
    <div className="producto-detalle">
      <h1>{producto.nombre}</h1>
      <img
        src={`http://localhost:5000/static/images/${producto.imagen}`}
        alt={producto.nombre}
        className="producto-imagen"
      />
      <p>Precio: €{producto.precio}</p>
      <p>Descripción: {producto.descripcion}</p>

      {/* Selección de color */}
      <label htmlFor="color">Color:</label>
      <select
        id="color"
        value={colorSeleccionado}
        onChange={(e) => setColorSeleccionado(e.target.value)}
      >
        <option value="">Selecciona un color</option>
        {producto.variantes.map((variante, index) => (
          <option key={index} value={variante.color}>
            {variante.color}
          </option>
        ))}
      </select>

      {/* Selección de capacidad */}
      <label htmlFor="capacidad">Capacidad:</label>
      <select
        id="capacidad"
        value={capacidadSeleccionada}
        onChange={(e) => setCapacidadSeleccionada(e.target.value)}
      >
        <option value="">Selecciona una capacidad</option>
        {producto.variantes.map((variante, index) => (
          <option key={index} value={variante.capacidad}>
            {variante.capacidad}
          </option>
        ))}
      </select>

      {/* Cantidad */}
      <label htmlFor="cantidad">Cantidad:</label>
      <input
        id="cantidad"
        type="number"
        value={cantidad}
        onChange={(e) => setCantidad(e.target.value)}
        min="1"
        max="10" 
      />

      <button onClick={agregarAlCarrito}>Añadir al carrito</button>

      {mensaje && <p>{mensaje}</p>}
    </div>
  );
};

export default ProductoDetalle;