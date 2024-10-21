import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Productos = ({ searchQuery }) => {
    const [productos, setProductos] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/productos')
            .then(response => {
                console.log(response.data);  // Verificar en la consola si llegan los productos
                setProductos(response.data);
            })
            .catch(error => {
                console.error('Error al cargar los productos:', error);
            });
    }, []);

    // Filtrar los productos en función de la búsqueda
    const productosFiltrados = productos.filter(producto =>
        producto.nombre.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            <h1>Productos Disponibles</h1>
            {productosFiltrados.length > 0 ? (
                <ul>
                    {productosFiltrados.map(producto => (
                        <li key={producto.id}>
                            <h2>{producto.nombre}</h2>
                            <p>Precio: €{producto.precio}</p>
                            {producto.stock > 0 ? (
                                <>
                                    <p>Stock disponible: {producto.stock}</p>
                                    <button onClick={() => handleAddToCart(producto.id)}>Añadir al carrito</button>
                                </>
                            ) : (
                                <p style={{ color: 'red' }}>Sin stock</p>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No se encontraron productos.</p>
            )}
        </div>
    );
};

const handleAddToCart = (productoId) => {
    axios.post(`http://localhost:5000/api/add_to_cart/${productoId}`, { cantidad: 1 }, {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Credentials': true,
        },
        withCredentials: true  // Esto asegura que las cookies de sesión se envíen con la petición
    })
    .then(response => {
        alert('Producto añadido al carrito');
    })
    .catch(error => {
        console.error('Error al añadir el producto al carrito:', error);
    });
};

export default Productos;