const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 4000;
const DJANGO_API = process.env.DJANGO_API || 'http://127.0.0.1:8000';

app.set('trust proxy', 1);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(morgan('combined'));

const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });
app.use(globalLimiter);

function decodeToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const decoded = jwt.decode(authHeader.split(' ')[1]);
      if (decoded) req.headers['x-user-id'] = String(decoded.user_id || '');
    } catch (_) {}
  }
  next();
}

app.use(decodeToken);
app.use((req, res, next) => {
  console.log(`[Gateway] ${req.method} ${req.path} | ip=${req.ip}`);
  next();
});

app.get('/health', (req, res) => res.json({
  status: 'ok', gateway: 'Express.js — MedBook',
  upstream: DJANGO_API, timestamp: new Date().toISOString()
}));

const proxyOptions = {
  target: DJANGO_API,
  changeOrigin: true,
  on: {
    proxyRes: (proxyRes, req) => {
      proxyRes.headers['Access-Control-Allow-Origin'] = req.headers.origin || '*';
      proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
    },
    error: (err, req, res) => {
      console.error('[Gateway] Proxy error:', err.message);
      res.status(502).json({ error: 'Upstream service unavailable.' });
    },
  },
};

app.use('/api/auth', authLimiter, createProxyMiddleware(proxyOptions));
app.use('/api', createProxyMiddleware(proxyOptions));
app.use((req, res) => res.status(404).json({ error: `Route ${req.path} not found.` }));

app.listen(PORT, () => {
  console.log(`\n🏥 MedBook Gateway running on http://localhost:${PORT}`);
  console.log(`   Proxying → ${DJANGO_API}\n`);
});
