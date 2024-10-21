import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Historial() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    axios.get('/api/historial')
      .then(response => {
        setPedidos(response.data);
      })
      .catch(error => {
        console.error('Error al cargar el historial de pedidos:', error);
      });
  }, []);

  return (
    <div>
      <h1>Historial de pedidos</h1>
      {pedidos.length === 0 ? (
        <p>No has realizado ningún pedido.</p>
      ) : (
        pedidos.map(pedido => (
          <div key={pedido.id}>
            <h3>Pedido {pedido.id} - {new Date(pedido.fecha).toLocaleDateString()}</h3>
            <ul>
              {pedido.detalles.map(detalle => (
                <li key={detalle.nombre}>{detalle.nombre} - {detalle.cantidad} x €{detalle.precio}</li>
              ))}
            </ul>
            <p>Total: €{pedido.total}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default Historial;