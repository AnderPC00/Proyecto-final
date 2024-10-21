import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Productos = ({ searchQuery = '', resetSearch }) => {
    const [productos, setProductos] = useState([]);
    const [productosFiltrados, setProductosFiltrados] = useState([]);

    // Cargar todos los productos al montar el componente
    useEffect(() => {
        axios.get('http://localhost:5000/api/productos')
            .then(response => {
                console.log('Productos recibidos del backend:', response.data);
                setProductos(response.data);
                setProductosFiltrados(response.data); // Inicialmente mostrar todos
            })
            .catch(error => {
                console.error('Error al cargar los productos:', error);
            });
    }, []);

    // Filtrar los productos según la búsqueda
    useEffect(() => {
        const normalizedSearchQuery = String(searchQuery).trim().toLowerCase();
        if (normalizedSearchQuery) {
            setProductosFiltrados(productos.filter(producto =>
                producto.nombre.toLowerCase().includes(normalizedSearchQuery)
            ));
        } else {
            setProductosFiltrados(productos); // Si no hay búsqueda, mostrar todos
        }
    }, [searchQuery, productos]);

    // Reiniciar la búsqueda cuando se carga la página de productos
    useEffect(() => {
        if (resetSearch) {
            resetSearch();  // Resetear la búsqueda cuando se carga la página
        }
    }, [resetSearch]);

    // Función para restablecer todos los productos
    const mostrarTodos = () => {
        setProductosFiltrados(productos);
        if (resetSearch) resetSearch(); // Limpiar la búsqueda en la barra si es necesario
    };

    return (
        <div>
            <h1>Productos Disponibles</h1>
            <button onClick={mostrarTodos}>Mostrar todos los productos</button> {/* Botón para mostrar todos */}
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
                <p>No se encontraron productos que coincidan con la búsqueda.</p>
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
        withCredentials: true
    })
    .then(() => {
        alert('Producto añadido al carrito');
    })
    .catch(error => {
        console.error('Error al añadir el producto al carrito:', error);
    });
};

export default Productos;