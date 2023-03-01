import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import CheckoutForm from "./CheckoutForm";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import { BrowserRouter as Router } from "react-router-dom";

import Redirect from "./Redirect";


// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// This is a public sample test API key.
// Don’t submit any personally identifiable information in requests made with this key.
// Sign in to see your own test API key embedded in code samples.
const stripePromise = loadStripe("pk_test_**");

export default function App() {
  const [clientSecret, setClientSecret] = useState("");
  const [customerId, setCustomerId] = useState("");

  useEffect(() => {

    (async () => {
      const response = await fetch('/secret');
      let {client_secret: clientSecret, customer_id: customerId} = await response.json();
      console.log("cs : " + clientSecret + ", customerId: " +customerId);
      setClientSecret(clientSecret)
      setCustomerId(customerId)
      // Render the form using the clientSecret
    })();

  }, []);

  const appearance = {
    theme: 'stripe',
  };
  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="App">
      <Router >
       
        {clientSecret && (
          <Elements options={options} stripe={stripePromise}>
            <Routes>
              <Route
			    	  		path="/checkout"
                  element={<CheckoutForm clientSecret={clientSecret}/>}
			            />
              <Route
			    	  		path="/checkout/redirect"
                  element={<Redirect customerId={customerId}/>}
			            />
            </Routes>
          </Elements>
        )}
      </Router>
    </div>
  );
}