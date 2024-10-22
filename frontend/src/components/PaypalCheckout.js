import React, { useEffect } from 'react';
import '../styles/Checkout.scss'; 

const PaypalCheckout = ({ amount, onSuccess }) => {
  useEffect(() => {
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
    }).render('#paypal-button-container');
  }, [amount]);

  return (
    <div>
      <div id="paypal-button-container"></div>
    </div>
  );
};

export default PaypalCheckout;