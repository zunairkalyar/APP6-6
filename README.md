# Run and deploy your web app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`
3. Run tests:
   `npx tsx tests/replacePlaceholders.test.ts`

## WooCommerce Integration

A small Express server is included to talk to the WooCommerce REST API. Configure your credentials in `server/.env` (see `server/.env.example`).

Start the server with:

```bash
npm start
```

This exposes the following endpoints:

- `GET /api/test-connection` – validates the credentials
- `GET /api/orders` – returns orders from WooCommerce
- `PUT /api/orders/:id` – update the status of an order
- `POST /api/webhooks` – endpoint to receive WooCommerce webhooks (verify with `x-wc-webhook-signature`)

The consumer secret is loaded only on the server and never sent to the client.
