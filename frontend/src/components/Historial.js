import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Historial = () => {
    const [pedidos, setPedidos] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/historial_pedidos', { withCredentials: true })
            .then(response => {
                setPedidos(response.data);
            })
            .catch(error => {
                console.error('Error al cargar el historial de pedidos:', error);
            });
    }, []);

    return (
        <div>
            <h1>Historial de Pedidos</h1>
            {pedidos.length > 0 ? (
                <ul>
                    {pedidos.map(pedido => (
                        <li key={pedido.id}>
                            <h2>Pedido #{pedido.id} - Total: €{pedido.total} - Fecha: {new Date(pedido.fecha).toLocaleString()}</h2>
                            <ul>
                                {pedido.detalles.map(detalle => (
                                    <li key={detalle.producto_id}>
                                        {detalle.nombre} - Cantidad: {detalle.cantidad} - Precio: €{detalle.precio}
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No has realizado ningún pedido aún.</p>
            )}
        </div>
    );
};

export default Historial;