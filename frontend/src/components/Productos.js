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
    const searchQuery = searchParams.get('nombre') || ''; // Obtener el valor de 'nombre' de la URL para filtrar por nombre del producto

    const [productos, setProductos] = useState([]);
    const [productosFiltrados, setProductosFiltrados] = useState([]);
    const { setCarrito, setCarritoCount } = useContext(AuthContext);
    const [selectedColor, setSelectedColor] = useState({});
    const [selectedCapacidad, setSelectedCapacidad] = useState({});
    const [stock, setStock] = useState({});
    const [stockTotal, setStockTotal] = useState({}); // Para verificar si alguna variante tiene stock

    // Cargar todos los productos al montar el componente
    useEffect(() => {
        axios.get('http://localhost:5000/api/productos')
            .then(response => {
                setProductos(response.data);
                setProductosFiltrados(response.data); // Mostrar todos los productos por defecto
                calcularStockTotal(response.data); // Calcular si hay stock disponible para las variantes
            })
            .catch(error => {
                showErrorMessage('Error al cargar los productos');
            });
    }, []);

    // Filtrar los productos según la búsqueda o el nombre del producto en la query string
    useEffect(() => {
        if (searchQuery) {
            const productosFiltrados = productos.filter(producto =>
                producto.nombre.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setProductosFiltrados(productosFiltrados);
        } else {
            setProductosFiltrados(productos); // Mostrar todos si no hay filtro de búsqueda
        }
    }, [searchQuery, productos]);

    // Calcular si el producto tiene stock en alguna variante
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

    // Manejar cambio de color
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

    // Manejar cambio de capacidad
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

    // Actualizar stock según color y capacidad seleccionados
    const actualizarStock = (productoId, color, capacidad) => {
        const producto = productos.find(p => p.id === productoId);
        if (!producto || !producto.variantes) {
            setStock(prev => ({ ...prev, [productoId]: 0 }));
            return;
        }

        // Filtrar la variante seleccionada de las variantes disponibles
        const variante = producto.variantes.find(v => v.startsWith(`${color}-${capacidad}`));
        if (variante) {
            const stockDisponible = variante.split('-')[2];  // El tercer valor es el stock
            setStock(prev => ({
                ...prev,
                [productoId]: parseInt(stockDisponible)
            }));
        } else {
            setStock(prev => ({ ...prev, [productoId]: 0 }));
        }
    };

    // Función para añadir un producto al carrito
    const handleAddToCart = (productoId) => {
        const color = selectedColor[productoId];
        const capacidad = selectedCapacidad[productoId];

        if (!color || !capacidad) {
            showErrorMessage('Por favor, selecciona un color y una capacidad');
            return;
        }

        // Verificar si hay stock disponible para la variante seleccionada
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
                        const colores = producto.variantes ? [...new Set(producto.variantes.map(v => v.split('-')[0]))] : [];
                        const capacidades = producto.variantes ? [...new Set(producto.variantes.map(v => v.split('-')[1]))] : [];

                        const primeraImagen = imagenes.length > 0 ? imagenes[0] : '';

                        // Determinar si hay stock total para el producto
                        const stockDisponible = stock[producto.id];
                        let stockClase = '';

                        // Lógica para determinar el mensaje y color
                        if (selectedColor[producto.id] && selectedCapacidad[producto.id]) {
                            // Si seleccionamos color y capacidad, mostrar el stock
                            stockClase = stockDisponible > 0 ? 'stock-disponible' : 'sin-stock';
                        } else if (!selectedColor[producto.id] || !selectedCapacidad[producto.id]) {
                            // Si no se seleccionaron opciones, mostrar "Selecciona color y capacidad" en verde si tiene stock
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
                                <p>Precio: €{producto.precio}</p>
                                
                                <p className={stockClase}>
                                    {selectedColor[producto.id] && selectedCapacidad[producto.id]
                                        ? `Stock disponible: ${stock[producto.id] !== undefined ? stock[producto.id] : '0'}`
                                        : 'Stock disponible: Selecciona color y capacidad'}
                                </p>

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