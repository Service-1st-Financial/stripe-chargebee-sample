import React from 'react'

export default function Redirect({...props}) {
const stripe = require("stripe")('sk_test_51MbaNlEi4KwCfDCDZao140YNb5rN3JV3ttL3R6Npj7xx48KWzoICLl61otE6GIA32mfikBuSQpUVimWUG92CAA8h00zv1bXVol');

    async function test ()  {
        console.log("Inside TESSSTT props.customerId: " + props.customerId);

        const paymentMethods = await stripe.customers.listPaymentMethods(
            props.customerId,
          );
        console.log("paymentMethods : " + paymentMethods);
         
    }

  return (
    <div>
      <button onClick={test}>Get Payement Method</button>
    </div>
  )
}
