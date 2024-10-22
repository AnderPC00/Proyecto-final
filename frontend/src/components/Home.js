import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import '../styles/Home.scss';

function Home() {
  const [productosDestacados, setProductosDestacados] = useState([]);

  // Cargar productos destacados desde el backend
  useEffect(() => {
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
      <h1>Bienvenido a la Tienda APC</h1>
      <p>Explora nuestros productos destacados.</p>

      <h2>Productos Destacados</h2>
      <div className="productos-destacados">
        {productosDestacados.length > 0 ? (
          productosDestacados.map(producto => {
            // Verifica si hay imágenes en los datos recibidos
            const primeraImagen = producto.imagenes ? producto.imagenes : "default.jpg";

            return (
              <div key={producto.id} className="producto">
                <img 
                  src={`http://localhost:5000/static/images/${primeraImagen}`} 
                  alt={producto.nombre} 
                  className="producto-destacado-imagen"
                />
                <h3>{producto.nombre}</h3>
                <p>Precio: €{producto.precio}</p>
                {/* Redirigir a la página de productos pero pasando el nombre como filtro en la URL */}
                <Link to={`/productos?nombre=${producto.nombre}`}>
                  <button className="btn btn-primary">Ver Producto</button>
                </Link>
              </div>
            );
          })
        ) : (
          <p>No hay productos destacados en este momento.</p>
        )}
      </div>
    </div>
  );
}

export default Home;