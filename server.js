
// This is a public sample test API key.
// Don’t submit any personally identifiable information in requests made with this key.
// Sign in to see your own test API key embedded in code samples.
const stripe = require("stripe")('sk_test_51MbaNlEi4KwCfDCDZao140YNb5rN3JV3ttL3R6Npj7xx48KWzoICLl61otE6GIA32mfikBuSQpUVimWUG92CAA8h00zv1bXVol');
const endpointSecret = 'whsec_5f734b7dfe630ce65f24ac487f428a2f0066e85362e059e9e3be3d1c33e6ee21';

const express = require("express");
const app = express();

app.use(express.static("public"));
// app.use(express.json());

app.use((req, res, next) => {
  if (req.originalUrl === '/webhook') {
    next(); // Do nothing with the body because I need it in a raw state.
  } else {
    express.json()(req, res, next);  // ONLY do express.json() if the received request is NOT a WebHook from Stripe.
  }
});


let customer;

app.get('/secret', async (req, res) => {

  customer = await stripe.customers.create({
    metadata: { "premieraccountId": "testing_accountID" }
  });

  const setupIntent = await stripe.setupIntents.create({
    customer: customer.id,
    payment_method_types: ['us_bank_account', 'card'],
  });
  console.log("setupIntent.client_secret : " + setupIntent.client_secret);
  // const intent = // ... Fetch or create the SetupIntent
  res.json({ client_secret: setupIntent.client_secret, customer_id: customer.id });
});

app.get('/get-pmid', async (req, res) => {

  const paymentMethod = stripe.customers.retrievePaymentMethod(
    customer.id,
  );
  console.log("paymentMethod : " + paymentMethod);
  res.json({ paymentMethod: paymentMethod });
});

app.get('/create-payment-intent', async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      currency: 'USD',
      amount: 1999,
      automatic_payment_methods: { enabled: true }
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (e) {
    return res.status(400).send({
      error: {
        message: e.message,
      },
    });
  }
});


app.post('/webhook', express.raw({ type: 'application/json' }), (request, response) => {
  // const sig = request.headers['stripe-signature'];

  let event = request.body;

  if (endpointSecret) {
    const signature = request.headers['stripe-signature'];

    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        signature,
        endpointSecret
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      return response.sendStatus(400);
    }
  }
  let pmethod;
  // Handle the event
  switch (event.type) {
    case 'setup_intent.canceled':
      const setupIntentCanceled = event.data.object;
      console.log("setupIntentCanceled")
      break;
    case 'setup_intent.created':
      const setupIntentCreated = event.data.object;
      console.log("setupIntentCreated")
      break;
    case 'setup_intent.requires_action':
      const setupIntentRequiresAction = event.data.object;
      console.log("setupIntentRequiresAction")
      break;
    case 'setup_intent.setup_failed':
      const setupIntentSetupFailed = event.data.object;
      console.log("setupIntentSetupFailed")
      break;
    case 'setup_intent.succeeded':
      const setupIntentSucceeded = event.data.object;
      console.log(`setupIntentSucceeded was successful! ` + JSON.stringify(setupIntentSucceeded));

      (async () => {
        const paymentIntent = await stripe.paymentIntents.create({
          currency: 'USD',
          amount: 1959,
          // automatic_payment_methods: { enabled: true },
          customer: setupIntentSucceeded.customer,
          payment_method_types: ['us_bank_account', 'card'],
          payment_method: setupIntentSucceeded.payment_method,
        });

      })();
      break;
    case 'payment_intent.succeeded':
      const handlePaymentIntentSucceeded = event.data.object;
      console.log(`handlePaymentIntentSucceeded for ${handlePaymentIntentSucceeded.amount} was successful!`);
      break;
    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      console.log(`payment_method.attached was successful!`);
      break;
    case 'payment_method.created':
      const paymentMethodCreated = event.data.object;
      console.log(`payment_method.created was successful!`);
      break;
    case 'financial_connections.account.created':
      const financial_connections_account_created = event.data.object;
      console.log(`financial_connections_account_created was successful!`);
      break;
    case 'payment_intent.created':
      const payment_intent_created = event.data.object;
      console.log(`payment_intent_created was successful! : ` + JSON.stringify(payment_intent_created));

      (async () => {
        const paymentIntentUpdate = await stripe.paymentIntents.update(
          payment_intent_created.id,
          { payment_method: pmethod }
        );

        console.log(`paymentIntentUpdate reached! ` + JSON.stringify(paymentIntentUpdate));

      })();
      break;
    case 'customer.created':
      const customer_created = event.data.object;
      console.log(`customer_created was successfullyyyy! : ` + JSON.stringify(customer_created));
      break;
    case 'payment_intent.update':
      const payment_intent_update = event.data.object;
      console.log(`payment_intent_update was successfully! : ` + JSON.stringify(payment_intent_update));
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  // Return a 200 response to acknowledge receipt of the event
  response.send();
});




app.listen(4242, () => console.log("Node server listening on port 4242!"));