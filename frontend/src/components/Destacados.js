import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Destacados = () => {
    const [productos, setProductos] = useState([]);

    useEffect(() => {
        // Hacer una solicitud al backend para obtener los productos destacados o recientes
        axios.get('http://localhost:5000/api/productos-destacados')
            .then(response => {
                setProductos(response.data);
            })
            .catch(error => {
                console.error('Error al cargar productos destacados:', error);
            });
    }, []);

    return (
        <div>
            <h2>Productos Destacados</h2>
            <ul>
                {productos.map(producto => (
                    <li key={producto.id}>
                        <Link to={`/producto/${producto.id}`}>
                            <h3>{producto.nombre}</h3>
                            <p>Precio: €{producto.precio}</p>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Destacados;