import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import '../styles/Productos.css';
import '../styles/styles.css';
import { showSuccessMessage, showErrorMessage } from '../utils/alertas';

const Productos = ({ searchQuery = '' }) => {
    const [productos, setProductos] = useState([]);
    const [productosFiltrados, setProductosFiltrados] = useState([]);
    const { setCarrito, setCarritoCount } = useContext(AuthContext);
    const [selectedColor, setSelectedColor] = useState({});
    const [selectedCapacidad, setSelectedCapacidad] = useState({});

    // Cargar todos los productos al montar el componente
    useEffect(() => {
        axios.get('http://localhost:5000/api/productos')
            .then(response => {
                setProductos(response.data);
                setProductosFiltrados(response.data);
            })
            .catch(error => {
                showErrorMessage('Error al cargar los productos');
            });
    }, []);

    // Filtrar los productos según la búsqueda
    useEffect(() => {
        const normalizedSearchQuery = String(searchQuery).trim().toLowerCase();
        if (normalizedSearchQuery) {
            const productosFiltrados = productos.filter(producto =>
                producto.nombre.toLowerCase().includes(normalizedSearchQuery)
            );
            setProductosFiltrados(productosFiltrados);
        } else {
            setProductosFiltrados(productos);
        }
    }, [searchQuery, productos]);

    const handleColorChange = (productoId, color) => {
        setSelectedColor(prev => ({
            ...prev,
            [productoId]: color
        }));
    };

    const handleCapacidadChange = (productoId, capacidad) => {
        setSelectedCapacidad(prev => ({
            ...prev,
            [productoId]: capacidad
        }));
    };

    // Función para añadir un producto al carrito
    const handleAddToCart = (productoId) => {
        const color = selectedColor[productoId];
        const capacidad = selectedCapacidad[productoId];

        if (!color || !capacidad) {
            showErrorMessage('Por favor, selecciona un color y una capacidad');
            return;
        }

        axios.post(`http://localhost:5000/api/add_to_cart/${productoId}`, 
            { cantidad: 1, color, capacidad }, 
            { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
        )
        .then(response => {
            showSuccessMessage('Producto añadido al carrito');
            // Actualizar el carrito después de agregar el producto
            axios.get('http://localhost:5000/api/carrito', { withCredentials: true })
                .then(response => {
                    setCarrito(response.data.productos);
                    const count = response.data.productos.reduce((total, item) => total + item.cantidad, 0);
                    setCarritoCount(count);
                })
                .catch(error => {
                    showErrorMessage('Error al actualizar el carrito');
                });
        })
        .catch(error => {
            showErrorMessage('Error al añadir el producto al carrito');
        });
    };

    return (
        <div>
            <h1>Productos Disponibles</h1>
            {productosFiltrados.length > 0 ? (
                <ul className="productos-lista">
                    {productosFiltrados.map(producto => {
                        const imagenes = producto.imagenes ? producto.imagenes.split(',') : [];
                        const colores = producto.colores ? producto.colores.split(',') : [];
                        const capacidades = producto.capacidades ? producto.capacidades.split(',') : [];

                        // Mostrar solo la primera imagen
                        const primeraImagen = imagenes.length > 0 ? imagenes[0] : '';

                        return (
                            <li key={`${producto.id}-${selectedColor[producto.id] || 'default'}-${selectedCapacidad[producto.id] || 'default'}`} className="producto-item">
                                <div className="producto-imagenes">
                                    {primeraImagen && (
                                        <img src={`http://localhost:5000/static/images/${primeraImagen}`} alt={producto.nombre} className="producto-imagen" />
                                    )}
                                </div>
                                <h2>{producto.nombre}</h2>
                                <p>Precio: €{producto.precio}</p>
                                {producto.stock > 0 ? (
                                    <>
                                        <p className="stock-disponible">Stock disponible: {producto.stock}</p>
                                        
                                        {/* Selector de color */}
                                        <label>Color:</label>
                                        <select value={selectedColor[producto.id] || ''} onChange={(e) => handleColorChange(producto.id, e.target.value)}>
                                            <option value="">Seleccionar Color</option>
                                            {colores.map((color, index) => (
                                                <option key={index} value={color}>{color}</option>
                                            ))}
                                        </select>

                                        {/* Selector de capacidad */}
                                        <label>Capacidad:</label>
                                        <select value={selectedCapacidad[producto.id] || ''} onChange={(e) => handleCapacidadChange(producto.id, e.target.value)}>
                                            <option value="">Seleccionar Capacidad</option>
                                            {capacidades.map((capacidad, index) => (
                                                <option key={index} value={capacidad}>{capacidad}</option>
                                            ))}
                                        </select>

                                        <button className="btn-carrito" onClick={() => handleAddToCart(producto.id)}>Añadir al carrito</button>
                                    </>
                                ) : (
                                    <p className="sin-stock">Sin stock</p>
                                )}
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p>No se encontraron productos que coincidan con la búsqueda.</p>
            )}
        </div>
    );
};

export default Productos;