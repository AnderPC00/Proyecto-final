import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import '../styles/Productos.scss';
import '../styles/styles.scss';
import { showSuccessMessage, showErrorMessage } from '../utils/alertas';
import { useLocation } from 'react-router-dom';

const Productos = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('nombre') || ''; 

    const [productos, setProductos] = useState([]);
    const [productosFiltrados, setProductosFiltrados] = useState([]);
    const { setCarrito, setCarritoCount } = useContext(AuthContext);
    const [selectedColor, setSelectedColor] = useState({});
    const [selectedCapacidad, setSelectedCapacidad] = useState({});
    const [stock, setStock] = useState({});
    const [stockTotal, setStockTotal] = useState({});

    const [mostrarDescripcionCompleta, setMostrarDescripcionCompleta] = useState({});

    // Cargar todos los productos
    useEffect(() => {
        axios.get('http://localhost:5000/api/productos')
            .then(response => {
                setProductos(response.data);
                setProductosFiltrados(response.data);
                calcularStockTotal(response.data);
            })
            .catch(error => {
                showErrorMessage('Error al cargar los productos');
            });
    }, []);

    // Filtrar los productos
    useEffect(() => {
        if (searchQuery) {
            const productosFiltrados = productos.filter(producto =>
                producto.nombre.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setProductosFiltrados(productosFiltrados);
        } else {
            setProductosFiltrados(productos); 
        }
    }, [searchQuery, productos]);

    const calcularStockTotal = (productos) => {
        const stockInfo = {};
        productos.forEach(producto => {
            const tieneStock = producto.variantes.some(vari => {
                const stockDisponible = parseInt(vari.split('-')[2], 10);
                return stockDisponible > 0;
            });
            stockInfo[producto.id] = tieneStock;
        });
        setStockTotal(stockInfo);
    };

    const handleColorChange = (productoId, color) => {
        setSelectedColor(prev => ({
            ...prev,
            [productoId]: color
        }));

        const producto = productos.find(p => p.id === productoId);
        const stockVariantes = producto.stock_variantes || {};
        const stockKey = `${color}-${selectedCapacidad[productoId]}`;
        const stockDisponible = stockVariantes[stockKey] || 0;

        setStock(prev => ({
            ...prev,
            [productoId]: stockDisponible
        }));
    };

    const handleCapacidadChange = (productoId, capacidad) => {
        setSelectedCapacidad(prev => ({
            ...prev,
            [productoId]: capacidad
        }));

        const colorSeleccionado = selectedColor[productoId];
        if (colorSeleccionado) {
            actualizarStock(productoId, colorSeleccionado, capacidad);
        }
    };

    const actualizarStock = (productoId, color, capacidad) => {
        const producto = productos.find(p => p.id === productoId);
        if (!producto || !producto.variantes) {
            setStock(prev => ({ ...prev, [productoId]: 0 }));
            return;
        }

        const variante = producto.variantes.find(v => v.startsWith(`${color}-${capacidad}`));
        if (variante) {
            const stockDisponible = variante.split('-')[2];  
            setStock(prev => ({
                ...prev,
                [productoId]: parseInt(stockDisponible)
            }));
        } else {
            setStock(prev => ({ ...prev, [productoId]: 0 }));
        }
    };

    const handleAddToCart = (productoId) => {
        const color = selectedColor[productoId];
        const capacidad = selectedCapacidad[productoId];

        if (!color || !capacidad) {
            showErrorMessage('Por favor, selecciona un color y una capacidad');
            return;
        }

        const stockDisponible = stock[productoId] || 0;

        if (stockDisponible < 1) {
            showErrorMessage('No hay stock disponible para la variante seleccionada');
            return;
        }

        axios.post(`http://localhost:5000/api/add_to_cart/${productoId}`, 
            { cantidad: 1, color, capacidad }, 
            { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
        )
        .then(response => {
            showSuccessMessage('Producto añadido al carrito');
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

    const toggleDescripcion = (productoId) => {
        setMostrarDescripcionCompleta(prev => ({
            ...prev,
            [productoId]: !prev[productoId] 
        }));
    };

    return (
        <div>
            <h1>Productos Disponibles</h1>
            {productosFiltrados.length > 0 ? (
                <ul className="productos-lista">
                    {productosFiltrados.map(producto => {
                        const imagen = producto.imagen; 
                        const colores = producto.variantes ? [...new Set(producto.variantes.map(v => v.split('-')[0]))] : [];
                        const capacidades = producto.variantes ? [...new Set(producto.variantes.map(v => v.split('-')[1]))] : [];

                        const primeraImagen = imagen ? imagen : ''; 

                        const stockDisponible = stock[producto.id];
                        let stockClase = '';

                        if (selectedColor[producto.id] && selectedCapacidad[producto.id]) {
                            stockClase = stockDisponible > 0 ? 'stock-disponible' : 'sin-stock';
                        } else if (!selectedColor[producto.id] || !selectedCapacidad[producto.id]) {
                            stockClase = stockTotal[producto.id] ? 'stock-por-seleccionar' : 'sin-stock';
                        }

                        return (
                            <li key={`${producto.id}-${selectedColor[producto.id] || 'default'}-${selectedCapacidad[producto.id] || 'default'}`} className="producto-item">
                                <div className="producto-imagenes">
                                    {primeraImagen && (
                                        <img src={`http://localhost:5000/static/images/${primeraImagen}`} alt={producto.nombre} className="producto-imagen" />
                                    )}
                                </div>
                                <h2>{producto.nombre}</h2>
                                
                                <p className={`producto-descripcion ${mostrarDescripcionCompleta[producto.id] ? 'mostrar-completa' : 'mostrar-parcial'}`}>
                                    {producto.descripcion}
                                </p>
                                <span 
                                    className="mostrar-mas" 
                                    onClick={() => toggleDescripcion(producto.id)}
                                >
                                    {mostrarDescripcionCompleta[producto.id] ? '▲' : '▼'}
                                </span>

                                <div className="producto-info">
                                    <p className="producto-precio">Precio: €{producto.precio}</p>
                                    
                                    <p className={stockClase}>
                                        {selectedColor[producto.id] && selectedCapacidad[producto.id]
                                            ? `Stock disponible: ${stock[producto.id] !== undefined ? stock[producto.id] : '0'}`
                                            : 'Stock disponible: Selecciona color y capacidad'}
                                    </p>
                                </div>

                                {colores.length > 0 && capacidades.length > 0 ? (
                                    <>
                                        <label>Color:</label>
                                        <select value={selectedColor[producto.id] || ''} onChange={(e) => handleColorChange(producto.id, e.target.value)}>
                                            <option value="">Seleccionar Color</option>
                                            {colores.map((color, index) => (
                                                <option key={index} value={color}>{color}</option>
                                            ))}
                                        </select>

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