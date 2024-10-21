import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Carrito = () => {
    const [productos, setProductos] = useState([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        axios.get('http://localhost:5000/api/carrito')
            .then(response => {
                setProductos(response.data.productos);
                setTotal(response.data.total);
            })
            .catch(error => {
                console.error('Error al cargar el carrito:', error);
            });
    }, []);    

    const handleUpdateCantidad = (productoId, nuevaCantidad) => {
        axios.post(`http://localhost:5000/api/update_cart/${productoId}`, { cantidad: nuevaCantidad })
            .then(() => {
                setProductos(prevProductos =>
                    prevProductos.map(p =>
                        p.id === productoId ? { ...p, cantidad: nuevaCantidad } : p
                    )
                );
            })
            .catch(error => {
                console.error('Error al actualizar la cantidad:', error);
            });
    };

    const handleRemoveFromCart = (productoId) => {
        axios.post(`http://localhost:5000/api/remove_from_cart/${productoId}`)
            .then(() => {
                setProductos(prevProductos => prevProductos.filter(p => p.id !== productoId));
            })
            .catch(error => {
                console.error('Error al eliminar el producto:', error);
            });
    };

    const handleCheckout = () => {
        axios.post('http://localhost:5000/api/checkout')
            .then(response => {
                alert('Pago realizado con éxito');
                setProductos([]);
                setTotal(0);
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
                                <button onClick={() => handleUpdateCantidad(producto.id, producto.cantidad - 1)}>-</button>
                                <button onClick={() => handleUpdateCantidad(producto.id, producto.cantidad + 1)}>+</button>
                                <button onClick={() => handleRemoveFromCart(producto.id)}>Eliminar</button>
                            </li>
                        ))}
                    </ul>
                    <h3>Total: €{total}</h3>
                    <button onClick={handleCheckout}>Proceder al pago</button>
                </div>
            ) : (
                <p>El carrito está vacío.</p>
            )}
        </div>
    );
};

export default Carrito;