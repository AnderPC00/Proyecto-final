import React, { useEffect, useRef } from 'react';
import '../styles/Checkout.scss';

const PaypalCheckout = ({ amount, onSuccess }) => {
  const paypalRef = useRef();  // Usar una referencia para el contenedor del botón de PayPal

  useEffect(() => {
    const loadPayPalScript = () => {
      const existingScript = document.getElementById('paypal-sdk');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=Af2mqWVexMidu3fujDKo93hJHqwMCWPEbPn8WcvzI1wjZQ00yew6RWm_BEarruZDzukj_noKT_eMX3rM&currency=EUR`;
        script.id = 'paypal-sdk';
        script.onload = () => renderPayPalButtons();
        document.body.appendChild(script);
      } else {
        renderPayPalButtons();
      }
    };

    const renderPayPalButtons = () => {
      window.paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: amount,  // Cantidad a pagar
              },
            }],
          });
        },
        onApprove: (data, actions) => {
          return actions.order.capture().then(details => {
            onSuccess(details);  // Llama a una función cuando el pago es exitoso
          });
        },
        onError: (err) => {
          console.error('PayPal error:', err);
        }
      }).render(paypalRef.current);  // Renderizar el botón en el elemento referenciado
    };

    loadPayPalScript();

  }, [amount, onSuccess]);

  return (
    <div>
      <div ref={paypalRef} id="paypal-button-container"></div> {/* Referencia del contenedor */}
    </div>
  );
};

export default PaypalCheckout;