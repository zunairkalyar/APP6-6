import express from 'express';
import bodyParser from 'body-parser';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import crypto from 'crypto';
import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(bodyParser.json());

const api = new WooCommerceRestApi({
  url: process.env.WOO_URL,
  consumerKey: process.env.WOO_CONSUMER_KEY,
  consumerSecret: process.env.WOO_CONSUMER_SECRET,
  version: 'wc/v3',
  axiosConfig: {
    httpsAgent: new https.Agent({ rejectUnauthorized: true })
  }
});

app.get('/api/test-connection', async (req, res) => {
  try {
    await api.get('orders', { per_page: 1 });
    res.json({ success: true, message: 'WooCommerce connection successful!' });
  } catch (err) {
    res.status(err.response?.status || 500).json({ success: false, message: err.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const { data } = await api.get('orders');
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { data } = await api.put(`orders/${id}`, { status });
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

app.post('/api/webhooks', (req, res) => {
  const signature = req.headers['x-wc-webhook-signature'];
  const digest = crypto.createHmac('sha256', process.env.WOO_CONSUMER_SECRET)
                       .update(JSON.stringify(req.body))
                       .digest('base64');
  if (signature !== digest) {
    return res.status(401).send('Invalid signature');
  }
  console.log('Received WooCommerce webhook:', req.body);
  res.status(200).send('OK');
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`WooCommerce API server running on port ${port}`);
});
