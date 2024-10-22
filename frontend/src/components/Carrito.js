import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { checkSession } from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { showSuccessMessage, showErrorMessage } from '../utils/alertas'; 
import '../styles/Carrito.scss'; 

const Carrito = () => {
    const { carrito, setCarrito, setCarritoCount } = useContext(AuthContext);
    const [total, setTotal] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const cargarCarrito = () => {
            axios.get('http://localhost:5000/api/carrito', {
                withCredentials: true
            })
            .then(response => {
                setCarrito(response.data.productos);
                recalcularTotal(response.data.productos);
                setCarritoCount(response.data.productos.reduce((total, item) => total + item.cantidad, 0));
                console.log('Productos en el carrito:', response.data.productos);
            })
            .catch(error => {
                console.error('Error al cargar el carrito:', error);
            });
        };

        checkSession()
            .then(response => {
                if (response.data.cart) {
                    cargarCarrito();
                }
            })
            .catch(error => {
                console.error('Error al verificar la sesión:', error);
            });
    }, [setCarrito, setCarritoCount]);

    const recalcularTotal = (productos) => {
        const nuevoTotal = productos.reduce((acc, producto) => acc + producto.precio * producto.cantidad, 0);
        setTotal(nuevoTotal);
    };

    const handleUpdateCantidad = (productoId, nuevaCantidad, stockDisponible, color, capacidad) => {
        if (nuevaCantidad < 1) return;
        if (nuevaCantidad > stockDisponible) {
            showErrorMessage('No puedes añadir más productos de los que hay en stock.');
            return;
        }
    
        axios.post(`http://localhost:5000/api/update_cart/${productoId}`, 
            { cantidad: nuevaCantidad, color, capacidad }, 
            { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
        )
        .then(() => {
            const productosActualizados = carrito.map(p =>
                p.id === productoId && p.color === color && p.capacidad === capacidad 
                    ? { ...p, cantidad: nuevaCantidad } 
                    : p
            );
            setCarrito(productosActualizados);
            recalcularTotal(productosActualizados);
            showSuccessMessage('Cantidad actualizada correctamente');
        })
        .catch(error => {
            showErrorMessage('Error al actualizar la cantidad.');
            console.error('Error al actualizar la cantidad:', error);
        });
    };    

    const handleRemoveFromCart = (productoId, color, capacidad) => {
        axios.post(`http://localhost:5000/api/remove_from_cart/${productoId}`, 
            { color, capacidad },  // Asegúrarse de pasar el color y la capacidad correctos
            { withCredentials: true }
        )
        .then(() => {
            const productosActualizados = carrito.filter(p => !(p.id === productoId && p.color === color && p.capacidad === capacidad));
            setCarrito(productosActualizados);
            recalcularTotal(productosActualizados);
            setCarritoCount(productosActualizados.reduce((total, item) => total + item.cantidad, 0));
            showSuccessMessage('Producto eliminado del carrito.');
        })
        .catch(error => {
            showErrorMessage('Error al eliminar el producto.');
            console.error('Error al eliminar el producto:', error);
        });
    };    

    const handleCheckout = () => {
        navigate('/checkout');
    };

    return (
        <div className="carrito">
            <h1>Carrito de Compras</h1>
            {carrito && carrito.length > 0 ? (
                <div>
                    <ul className="lista-productos">
                        {carrito.map((producto, index) => (
                            <li key={`${producto.id}-${producto.color}-${producto.capacidad}`} className="producto-carrito">
                                {/* Actualizar la ruta de la imagen */}
                                <img 
                                    src={producto.imagen} 
                                    alt={producto.nombre} 
                                    className="imagen-producto" 
                                    onError={(e) => { e.target.src = 'http://localhost:5000/static/images/default.jpg'; }} // Imagen por defecto si falla
                                />
                                <div>
                                    <h3>{producto.nombre}</h3>
                                    <p>Precio: €{producto.precio}</p>
                                    <p>Color: {producto.color}</p>
                                    <p>Capacidad: {producto.capacidad}</p>
                                    <div className="cantidad-control">
                                        <button onClick={() => handleUpdateCantidad(producto.id, producto.cantidad - 1, producto.stock, producto.color, producto.capacidad)}>-</button>
                                        <input 
                                            type="number" 
                                            value={producto.cantidad} 
                                            onChange={(e) => handleUpdateCantidad(producto.id, parseInt(e.target.value), producto.stock, producto.color, producto.capacidad)}
                                            min="1"
                                        />
                                        <button onClick={() => handleUpdateCantidad(producto.id, producto.cantidad + 1, producto.stock, producto.color, producto.capacidad)}>+</button>
                                    </div>
                                    <button className="btn btn-danger" onClick={() => handleRemoveFromCart(producto.id, producto.color, producto.capacidad)}>Eliminar</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <h3>Total: €{total.toFixed(2)}</h3>
                    <button onClick={handleCheckout} className="btn btn-success">Proceder al pago</button>
                </div>
            ) : (
                <div className="carrito-vacio">
                    <h2>Tu carrito está vacío</h2>
                    <p>Explora nuestros productos y añade algo a tu carrito.</p>
                    <Link to="/productos" className="btn btn-primary">Ver productos</Link>
                </div>
            )}
        </div>
    );
};

export default Carrito;