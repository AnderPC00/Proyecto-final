import React, { useState, useEffect } from 'react';
import { getHistorialPedidos } from '../api'; // Importar la función desde api.js

const HistorialPedidos = () => {
    const [pedidos, setPedidos] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        getHistorialPedidos()
            .then(response => {
                // Asegurarse de que pedidos es un arreglo antes de usar map
                if (Array.isArray(response.data)) {
                    setPedidos(response.data);
                } else {
                    setPedidos([]); // En caso de que no sea un array, se deja vacío
                }
            })
            .catch(error => {
                console.error('Error al cargar el historial de pedidos:', error);
                setError('Error al cargar el historial de pedidos.');
            });
    }, []);

    return (
        <div>
            <h1>Historial de Pedidos</h1>
            {error && <p>{error}</p>}
            {pedidos.length > 0 ? (
                <ul>
                    {pedidos.map(pedido => (
                        <li key={pedido.id}>
                            <h2>Pedido #{pedido.id} - Total: €{pedido.total} - Fecha: {new Date(pedido.fecha).toLocaleString()}</h2>
                            <ul>
                                {pedido.detalles && pedido.detalles.length > 0 ? (
                                    pedido.detalles.map(detalle => (
                                        <li key={detalle.producto_id}>
                                            {detalle.nombre} - Cantidad: {detalle.cantidad} - Precio: €{detalle.precio}
                                        </li>
                                    ))
                                ) : (
                                    <li>No hay detalles disponibles para este pedido</li>
                                )}
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

export default HistorialPedidos;