import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import '../styles/Home.scss';

const Destacados = () => {
    const [productosDestacados, setProductosDestacados] = useState([]);

    useEffect(() => {
        // Hacer una solicitud al backend para obtener los productos destacados
        axios.get("http://localhost:5000/api/productos_destacados")
            .then(response => {
                setProductosDestacados(response.data);
            })
            .catch(error => {
                console.error("Error al cargar productos destacados:", error);
            });
    }, []);

    return (
        <div>
            <h2>Productos Destacados</h2>
            <div className="productos-destacados">
                {productosDestacados.length > 0 ? (
                    productosDestacados.map(producto => (
                        <div key={producto.id} className="producto">
                            <img
                                src={`http://localhost:5000/static/images/${producto.imagen_url ? producto.imagen_url : 'default.jpg'}`}
                                alt={producto.nombre}
                                className="producto-imagen"
                            />
                            <h3>{producto.nombre}</h3>
                            <p>Precio: €{producto.precio}</p>
                            <Link to={`/productos?id=${producto.id}`}>
                                <button className="btn btn-primary">Ver Producto</button>
                            </Link>
                        </div>
                    ))
                ) : (
                    <p>No hay productos destacados en este momento.</p>
                )}
            </div>
        </div>
    );
};

export default Destacados;