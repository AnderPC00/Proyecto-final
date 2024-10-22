import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { showSuccessMessage, showErrorMessage } from '../utils/alertas';
import { PayPalButton } from 'react-paypal-button-v2';
import '../styles/Checkout.scss';

const Checkout = () => {
    const { usuario, setCarrito, setCarritoCount } = useContext(AuthContext);
    const [direcciones, setDirecciones] = useState([]);
    const [usarDireccionGuardada, setUsarDireccionGuardada] = useState(true);
    const [direccionSeleccionada, setDireccionSeleccionada] = useState('');
    const [nuevaDireccion, setNuevaDireccion] = useState({
        direccion: '',
        ciudad: '',
        provincia: '',
        codigo_postal: '',
        pais: '',
        telefono: ''
    });
    const [metodoPago, setMetodoPago] = useState('');
    const [totalCompra, setTotalCompra] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (usuario) {
            axios.get('http://localhost:5000/api/obtener_direcciones', { withCredentials: true })
                .then(response => {
                    if (Array.isArray(response.data)) {
                        setDirecciones(response.data);
                    } else {
                        setDirecciones([]);
                    }
                })
                .catch(error => {
                    showErrorMessage('Error al cargar las direcciones');
                });
        }

        // Obtener el total de la compra
        axios.get('http://localhost:5000/api/carrito', { withCredentials: true })
            .then(response => {
                const total = response.data.total;
                setTotalCompra(total);
            })
            .catch(error => {
                showErrorMessage('Error al obtener el total de la compra');
            });

    }, [usuario]);

    const handleGuardarDireccion = () => {
        if (!usuario) {
            showErrorMessage('Debes iniciar sesión para guardar una dirección');
            return;
        }

        const payload = {
            direccion: nuevaDireccion.direccion,
            ciudad: nuevaDireccion.ciudad,
            provincia: nuevaDireccion.provincia,
            codigo_postal: nuevaDireccion.codigo_postal,
            pais: nuevaDireccion.pais,
            telefono: nuevaDireccion.telefono,
        };

        axios.post('http://localhost:5000/api/guardar_direccion', payload, { withCredentials: true })
            .then(response => {
                showSuccessMessage('Dirección guardada con éxito');
                setDirecciones([...direcciones, payload]); // Actualiza la lista de direcciones
                setUsarDireccionGuardada(true); // Cambia de nuevo a usar dirección guardada
            })
            .catch(error => {
                console.error('Error al guardar la dirección:', error);
                showErrorMessage('Error al guardar la dirección');
            });
    };

    const handleCheckout = (paymentResult) => {
        const direccionFinal = usarDireccionGuardada && usuario
            ? direcciones.find(dir => dir.direccion === direccionSeleccionada) || nuevaDireccion
            : nuevaDireccion;

        if (!direccionFinal.direccion || !direccionFinal.ciudad || !direccionFinal.provincia || !direccionFinal.codigo_postal || !direccionFinal.pais) {
            showErrorMessage('Por favor, complete todos los campos de dirección.');
            return;
        }

        if (!metodoPago) {
            showErrorMessage('Por favor, seleccione un método de pago.');
            return;
        }

        const payload = {
            direccion: {
                direccion: direccionFinal.direccion,
                ciudad: direccionFinal.ciudad,
                provincia: direccionFinal.provincia,
                codigo_postal: direccionFinal.codigo_postal,
                pais: direccionFinal.pais
            },
            telefono: nuevaDireccion.telefono || direccionFinal.telefono,
            metodo_pago: metodoPago,
            pago: paymentResult
        };

        axios.post('http://localhost:5000/api/checkout', payload, { withCredentials: true })
            .then(response => {
                showSuccessMessage('Pago realizado con éxito');
                setCarrito([]);
                setCarritoCount(0);
                navigate('/');
            })
            .catch(error => {
                showErrorMessage('Error al proceder al pago');
            });
    };

    return (
        <div className="checkout-container">
            <h1>Proceso de Pago</h1>

            {/* Si hay sesión, permite elegir entre dirección guardada o nueva */}
            {usuario ? (
                <>
                    <div className="direccion-selector">
                        <button 
                            className={`btn btn-small ${usarDireccionGuardada ? 'btn-primary' : 'btn-outline-primary'}`} 
                            onClick={() => setUsarDireccionGuardada(true)}
                        >
                            Usar dirección guardada
                        </button>
                        <button 
                            className={`btn btn-small ${!usarDireccionGuardada ? 'btn-primary' : 'btn-outline-primary'}`} 
                            onClick={() => setUsarDireccionGuardada(false)}
                        >
                            Usar nueva dirección
                        </button>
                    </div>

                    {usarDireccionGuardada && direcciones.length > 0 ? (
                        <div>
                            <h2>Seleccionar Dirección Guardada</h2>
                            <select 
                                className="form-select" 
                                value={direccionSeleccionada} 
                                onChange={(e) => setDireccionSeleccionada(e.target.value)}
                            >
                                <option value="">Seleccionar una dirección</option>
                                {direcciones.map((direccion, index) => (
                                    <option key={index} value={direccion.direccion}>
                                        {`${direccion.direccion}, ${direccion.ciudad}, ${direccion.provincia}, ${direccion.codigo_postal}, ${direccion.pais}`}
                                    </option>
                                ))}
                            </select>
                            {direccionSeleccionada && (
                                <p>Dirección seleccionada: {direccionSeleccionada}</p>
                            )}
                        </div>
                    ) : (
                        !usarDireccionGuardada && (
                            <div className="direccion-form">
                                <h2>Introducir Nueva Dirección</h2>
                                <div className="form-group">
                                    <input type="text" className="form-control" placeholder="Dirección" value={nuevaDireccion.direccion} onChange={(e) => setNuevaDireccion({ ...nuevaDireccion, direccion: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <input type="text" className="form-control" placeholder="Ciudad" value={nuevaDireccion.ciudad} onChange={(e) => setNuevaDireccion({ ...nuevaDireccion, ciudad: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <input type="text" className="form-control" placeholder="Provincia" value={nuevaDireccion.provincia} onChange={(e) => setNuevaDireccion({ ...nuevaDireccion, provincia: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <input type="text" className="form-control" placeholder="Código Postal" value={nuevaDireccion.codigo_postal} onChange={(e) => setNuevaDireccion({ ...nuevaDireccion, codigo_postal: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <input type="text" className="form-control" placeholder="País" value={nuevaDireccion.pais} onChange={(e) => setNuevaDireccion({ ...nuevaDireccion, pais: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <input type="text" className="form-control" placeholder="Teléfono" value={nuevaDireccion.telefono} onChange={(e) => setNuevaDireccion({ ...nuevaDireccion, telefono: e.target.value })} />
                                </div>
                                <button className="btn btn-primary" onClick={handleGuardarDireccion}>Guardar Dirección</button> {/* Botón de guardar dirección */}
                            </div>
                        )
                    )}
                </>
            ) : (
                <div className="direccion-form">
                    <h2>Introducir Nueva Dirección</h2>
                    <div className="form-group">
                        <input type="text" className="form-control" placeholder="Dirección" value={nuevaDireccion.direccion} onChange={(e) => setNuevaDireccion({ ...nuevaDireccion, direccion: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <input type="text" className="form-control" placeholder="Ciudad" value={nuevaDireccion.ciudad} onChange={(e) => setNuevaDireccion({ ...nuevaDireccion, ciudad: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <input type="text" className="form-control" placeholder="Provincia" value={nuevaDireccion.provincia} onChange={(e) => setNuevaDireccion({ ...nuevaDireccion, provincia: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <input type="text" className="form-control" placeholder="Código Postal" value={nuevaDireccion.codigo_postal} onChange={(e) => setNuevaDireccion({ ...nuevaDireccion, codigo_postal: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <input type="text" className="form-control" placeholder="País" value={nuevaDireccion.pais} onChange={(e) => setNuevaDireccion({ ...nuevaDireccion, pais: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <input type="text" className="form-control" placeholder="Teléfono" value={nuevaDireccion.telefono} onChange={(e) => setNuevaDireccion({ ...nuevaDireccion, telefono: e.target.value })} />
                    </div>
                </div>
            )}

            <div className="metodo-pago">
                <h2>Método de Pago</h2>
                <select 
                    className="form-select" 
                    value={metodoPago} 
                    onChange={(e) => setMetodoPago(e.target.value)}
                >
                    <option value="">Seleccionar método de pago</option>
                    <option value="tarjeta">Tarjeta de Crédito</option>
                    <option value="paypal">PayPal</option>
                    <option value="applepay">Apple Pay</option>
                </select>
            </div>

            {metodoPago === 'paypal' && totalCompra > 0 && (
                <div className="paypal-button">
                    <PayPalButton
                        amount={totalCompra}
                        onSuccess={(details, data) => handleCheckout(details)}
                        options={{
                            clientId: 'Af2mqWVexMidu3fujDKo93hJHqwMCWPEbPn8WcvzI1wjZQ00yew6RWm_BEarruZDzukj_noKT_eMX3rM',
                            currency: 'EUR'
                        }}
                    />
                </div>
            )}

            {metodoPago === 'tarjeta' && (
                <div className="d-flex justify-content-center">
                    <button className="btn btn-success mt-3" onClick={() => handleCheckout()}>Confirmar Compra</button>
                </div>
            )}
        </div>
    );
};

export default Checkout;