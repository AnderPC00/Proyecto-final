import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { checkSession } from '../api';

const Carrito = () => {
    const [productos, setProductos] = useState([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const cargarCarrito = () => {
            axios.get('http://localhost:5000/api/carrito', {
                withCredentials: true  // Enviar cookies de sesión
            })
            .then(response => {
                setProductos(response.data.productos);
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
    }, []);

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
            const productosActualizados = productos.map(p =>
                p.id === productoId ? { ...p, cantidad: nuevaCantidad } : p
            );
            setProductos(productosActualizados);
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
            const productosActualizados = productos.filter(p => p.id !== productoId);
            setProductos(productosActualizados);
            recalcularTotal(productosActualizados);
            console.log('Producto eliminado:', productosActualizados);  // Log para depurar
        })
        .catch(error => {
            console.error('Error al eliminar el producto:', error);
        });
    };

    const handleCheckout = () => {
        console.log('Procesando pago...');  // Log para depurar
        axios.post('http://localhost:5000/api/checkout', {}, { withCredentials: true })
        .then(response => {
            alert('Pago realizado con éxito');
            setProductos([]);
            setTotal(0);
            console.log('Pago exitoso, carrito vaciado');  // Log para depurar
        })
        .catch(error => {
            console.error('Error al proceder al pago:', error);
        });
    };

    return (
        <div>
            <h1>Carrito de Compras</h1>
            {productos && productos.length > 0 ? (
                <div>
                    <ul>
                        {productos.map(producto => (
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
                    <button onClick={handleCheckout}>Proceder al pago</button>
                </div>
            ) : (
                <p>El carrito está vacío.</p>
            )}
        </div>
    );
};

export default Carrito;