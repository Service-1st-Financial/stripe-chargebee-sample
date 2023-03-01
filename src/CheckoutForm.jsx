import React, { useEffect, useState } from "react";
import {
  PaymentElement,
  LinkAuthenticationElement,
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";


export default function CheckoutForm({...props}) {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pi, setPI] = useState("");


  useEffect(() => {
    setMessage(null);
  },[]);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    console.log("In payment_intent_client_secret : " + clientSecret);

    if (!clientSecret) {
      return;
    }
  }, [stripe]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("In Submit");

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    stripe.confirmSetup({
      elements,
      confirmParams: {
        // Return URL where the customer should be redirected after the SetupIntent is confirmed.
        return_url: 'http://localhost:3000/checkout/redirect',
      },
    })
    .then(function(result) {
      if (result.error) {
        // Inform the customer that there was an error.
      }
      console.log("Ressulltt : "  +result);
    });
    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: "tabs"
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        "::placeholder": {
          color: "#87bbfd"
        }
      },
      invalid: {
        color: "red",
        iconColor: "red"

      }
    },
    hidePostalCode: true
  }


  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      {/* <CardElement id="card-element" options={cardElementOptions} /> */}
      <PaymentElement id="payment-element" options={paymentElementOptions} />
      <button disabled={isLoading || !stripe || !elements} id="submit">
        <span id="button-text">
          {isLoading ? <div className="spinner" id="spinner"></div> : "Pay now"}
        </span>
      </button>
      {/* Show any error or success messages */}
      {message && <div id="payment-message">{message}</div>}
    </form>
  );
}