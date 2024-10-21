import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Productos = () => {
    const [productos, setProductos] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/productos')
            .then(response => {
                setProductos(response.data);
            })
            .catch(error => {
                console.error('Error al cargar los productos:', error);
            });
    }, []);

    const handleAddToCart = (productoId) => {
        axios.post(`http://localhost:5000/api/add_to_cart/${productoId}`, { cantidad: 1 }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            alert('Producto añadido al carrito');
        })
        .catch(error => {
            console.error('Error al añadir el producto al carrito:', error);
        });
    };

    return (
        <div>
            <h1>Productos Disponibles</h1>
            <ul>
                {productos.map(producto => (
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
        </div>
    );
};

export default Productos;