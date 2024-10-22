import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { checkSession } from '../api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Importar AuthContext para el carrito

const Carrito = () => {
    const { carrito, setCarrito } = useContext(AuthContext); // Obtener el carrito del contexto
    const [total, setTotal] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const cargarCarrito = () => {
            axios.get('http://localhost:5000/api/carrito', {
                withCredentials: true  // Enviar cookies de sesión
            })
            .then(response => {
                setCarrito(response.data.productos);  // Actualizar el carrito en el contexto
                recalcularTotal(response.data.productos);
                console.log('Productos en el carrito:', response.data.productos);  // Log para depurar
            })
            .catch(error => {
                console.error('Error al cargar el carrito:', error);
            });
        };

        // Verificar el estado de la sesión al cargar el carrito
        checkSession()
            .then(response => {
                console.log('Estado de la sesión:', response.data);
                if (response.data.cart) {
                    cargarCarrito(); // Si hay un carrito en la sesión, cargar los productos
                }
            })
            .catch(error => {
                console.error('Error al verificar la sesión:', error);
            });
    }, [setCarrito]);

    const recalcularTotal = (productos) => {
        const nuevoTotal = productos.reduce((acc, producto) => acc + producto.precio * producto.cantidad, 0);
        setTotal(nuevoTotal);
    };

    // Actualizar cantidad de productos en el carrito
    const handleUpdateCantidad = (productoId, nuevaCantidad, stockDisponible) => {
        if (nuevaCantidad < 1) return;
        if (nuevaCantidad > stockDisponible) {
            alert('No puedes añadir más productos de los que hay en stock.');
            return;
        }

        axios.post(`http://localhost:5000/api/update_cart/${productoId}`, 
            { cantidad: nuevaCantidad }, 
            { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
        )
        .then(() => {
            const productosActualizados = carrito.map(p =>
                p.id === productoId ? { ...p, cantidad: nuevaCantidad } : p
            );
            setCarrito(productosActualizados);
            recalcularTotal(productosActualizados);
            console.log('Cantidad actualizada:', productosActualizados);  // Log para depurar
        })
        .catch(error => {
            console.error('Error al actualizar la cantidad:', error);
        });
    };

    const handleRemoveFromCart = (productoId) => {
        console.log(`Eliminando producto con ID: ${productoId}`);  // Log para depurar
        axios.post(`http://localhost:5000/api/remove_from_cart/${productoId}`, {}, { withCredentials: true })
        .then(() => {
            const productosActualizados = carrito.filter(p => p.id !== productoId);
            setCarrito(productosActualizados);
            recalcularTotal(productosActualizados);
            console.log('Producto eliminado:', productosActualizados);  // Log para depurar
        })
        .catch(error => {
            console.error('Error al eliminar el producto:', error);
        });
    };

    const handleCheckout = () => {
        // En vez de procesar el pago aquí, redirigir al usuario a la página de checkout
        navigate('/checkout');  // Redirigir a la página de checkout
    };

    return (
        <div>
            <h1>Carrito de Compras</h1>
            {carrito && carrito.length > 0 ? (
                <div>
                    <ul>
                        {carrito.map(producto => (
                            <li key={producto.id}>
                                <h2>{producto.nombre}</h2>
                                <p>Precio: €{producto.precio}</p>
                                <p>Cantidad: {producto.cantidad}</p>
                                <button onClick={() => handleUpdateCantidad(producto.id, producto.cantidad - 1, producto.stock)}>-</button>
                                <button onClick={() => handleUpdateCantidad(producto.id, producto.cantidad + 1, producto.stock)}>+</button>
                                <button onClick={() => handleRemoveFromCart(producto.id)}>Eliminar</button>
                            </li>
                        ))}
                    </ul>
                    <h3>Total: €{total.toFixed(2)}</h3>
                    <button onClick={handleCheckout}>Proceder al pago</button> {/* Redirige al checkout */}
                </div>
            ) : (
                <p>El carrito está vacío.</p>
            )}
        </div>
    );
};

export default Carrito;