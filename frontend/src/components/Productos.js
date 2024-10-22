import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import '../styles/Productos.css';
import '../styles/styles.css';
import { showSuccessMessage, showErrorMessage } from '../utils/alertas';

const Productos = ({ searchQuery = '', resetSearch }) => {
    const [productos, setProductos] = useState([]);
    const [productosFiltrados, setProductosFiltrados] = useState([]);
    const { carrito, setCarrito, carritoCount, setCarritoCount } = useContext(AuthContext);

    // Cargar todos los productos al montar el componente
    useEffect(() => {
        axios.get('http://localhost:5000/api/productos')
            .then(response => {
                setProductos(response.data);
                setProductosFiltrados(response.data); // Inicialmente mostrar todos
            })
            .catch(error => {
                showErrorMessage('Error al cargar los productos');
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

    // Función para añadir un producto al carrito
    const handleAddToCart = (productoId) => {
        axios.post(`http://localhost:5000/api/add_to_cart/${productoId}`, { cantidad: 1 }, {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true
        })
        .then(response => {
            showSuccessMessage('Producto añadido al carrito');
            // Actualizar el carrito globalmente en el contexto
            axios.get('http://localhost:5000/api/carrito', { withCredentials: true })
                .then(response => {
                    setCarrito(response.data.productos);
                    const count = response.data.productos.reduce((total, item) => total + item.cantidad, 0);
                    setCarritoCount(count); // Actualizar la cantidad de productos en el carrito
                })
                .catch(error => {
                    showErrorMessage('Error al actualizar el carrito');
                });
        })
        .catch(error => {
            showErrorMessage('Error al añadir el producto al carrito');
        });
    };

    // Función para restablecer todos los productos
    const mostrarTodos = () => {
        setProductosFiltrados(productos);
        if (resetSearch) resetSearch(); // Limpiar la búsqueda en la barra si es necesario
    };

    return (
        <div>
            <h1>Productos Disponibles</h1>
            <button onClick={mostrarTodos}>Mostrar todos los productos</button>
            {productosFiltrados.length > 0 ? (
                <ul>
                    {productosFiltrados.map(producto => (
                        <li key={producto.id}>
                            <h2>{producto.nombre}</h2>
                            <p>Precio: €{producto.precio}</p>
                            {producto.stock > 0 ? (
                                <>
                                    <p className="stock-disponible">Stock disponible: {producto.stock}</p>
                                    <button className="btn-carrito" onClick={() => handleAddToCart(producto.id)}>Añadir al carrito</button>
                                </>
                            ) : (
                                <p className="sin-stock">Sin stock</p>
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

export default Productos;