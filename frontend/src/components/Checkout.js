import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';  // Importar useNavigate para la redirección

const Checkout = () => {
    const { usuario } = useContext(AuthContext); // Comprobar si está autenticado
    const [direcciones, setDirecciones] = useState([]);
    const [usarDireccionGuardada, setUsarDireccionGuardada] = useState(true); // Para alternar entre usar dirección guardada o nueva
    const [direccionSeleccionada, setDireccionSeleccionada] = useState('');
    const [nuevaDireccion, setNuevaDireccion] = useState({
        direccion: '',
        ciudad: '',
        provincia: '',
        codigo_postal: '',
        pais: '',
        telefono: ''  // Añadido el campo de teléfono
    });
    const [metodoPago, setMetodoPago] = useState('');
    const navigate = useNavigate();  // Inicializar useNavigate para redirigir

    useEffect(() => {
        // Si está autenticado, obtener direcciones guardadas
        if (usuario) {
            axios.get('http://localhost:5000/api/obtener_direcciones', { withCredentials: true })
                .then(response => {
                    setDirecciones(response.data);
                    console.log('Direcciones cargadas:', response.data);
                })
                .catch(error => {
                    console.error('Error al cargar las direcciones:', error);
                });
        }
    }, [usuario]);

    const handleCheckout = () => {
        const direccionFinal = usarDireccionGuardada 
            ? direcciones.find(dir => dir.direccion === direccionSeleccionada) || nuevaDireccion 
            : nuevaDireccion;

        const payload = {
            direccion: {
                direccion: direccionFinal.direccion,
                ciudad: direccionFinal.ciudad,
                provincia: direccionFinal.provincia,
                codigo_postal: direccionFinal.codigo_postal,
                pais: direccionFinal.pais
            },
            telefono: nuevaDireccion.telefono || direccionFinal.telefono,
            metodo_pago: metodoPago
        };

        console.log('Payload enviado:', payload);
    
        axios.post('http://localhost:5000/api/checkout', payload, { withCredentials: true })
            .then(response => {
                alert('Pago realizado con éxito');
                console.log('Pago exitoso', response.data);
                // Redirigir a inicio después de la compra
                navigate('/');
            })
            .catch(error => {
                console.error('Error al proceder al pago:', error);
            });
    };    

    return (
        <div>
            <h1>Proceso de Pago</h1>

            {/* Selector para usar dirección guardada o nueva */}
            <div>
                <button onClick={() => setUsarDireccionGuardada(true)}>
                    Usar ubicación guardada
                </button>
                <button onClick={() => setUsarDireccionGuardada(false)}>
                    Usar nueva dirección
                </button>
            </div>

            {/* Mostrar direcciones guardadas si se selecciona "Usar ubicación guardada" */}
            {usarDireccionGuardada && usuario && direcciones.length > 0 && (
                <div>
                    <h2>Dirección Guardada</h2>
                    <select value={direccionSeleccionada} onChange={(e) => setDireccionSeleccionada(e.target.value)}>
                        <option value="">Seleccionar una dirección</option>
                        {direcciones.map((direccion) => (
                            <option key={direccion.id} value={direccion.direccion}>
                                {`${direccion.direccion}, ${direccion.ciudad}, ${direccion.provincia}, ${direccion.codigo_postal}, ${direccion.pais}`}
                            </option>
                        ))}
                    </select>

                    {/* Mostrar la dirección seleccionada */}
                    {direccionSeleccionada && (
                        <p>
                            Dirección seleccionada: {direccionSeleccionada}
                        </p>
                    )}
                </div>
            )}

            {/* Mostrar campos de nueva dirección si se selecciona "Usar nueva dirección" */}
            {!usarDireccionGuardada && (
                <div>
                    <h2>Nueva Dirección</h2>
                    <input
                        type="text"
                        placeholder="Dirección"
                        value={nuevaDireccion.direccion}
                        onChange={(e) => setNuevaDireccion({ ...nuevaDireccion, direccion: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Ciudad"
                        value={nuevaDireccion.ciudad}
                        onChange={(e) => setNuevaDireccion({ ...nuevaDireccion, ciudad: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Provincia"
                        value={nuevaDireccion.provincia}
                        onChange={(e) => setNuevaDireccion({ ...nuevaDireccion, provincia: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Código Postal"
                        value={nuevaDireccion.codigo_postal}
                        onChange={(e) => setNuevaDireccion({ ...nuevaDireccion, codigo_postal: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="País"
                        value={nuevaDireccion.pais}
                        onChange={(e) => setNuevaDireccion({ ...nuevaDireccion, pais: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Teléfono"
                        value={nuevaDireccion.telefono}
                        onChange={(e) => setNuevaDireccion({ ...nuevaDireccion, telefono: e.target.value })}
                    />
                </div>
            )}

            {/* Método de pago */}
            <div>
                <h2>Método de Pago</h2>
                <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
                    <option value="">Seleccionar método de pago</option>
                    <option value="tarjeta">Tarjeta de Crédito</option>
                    <option value="paypal">PayPal</option>
                    <option value="applepay">Apple Pay</option>
                </select>
            </div>

            <button onClick={handleCheckout}>Confirmar Compra</button>
        </div>
    );
};

export default Checkout;