import express, { type ErrorRequestHandler } from 'express';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import { closeDatabase, connectDatabase, pingDatabase } from './db.js';
import { authRouter } from './routes/auth.js';
import { requireAdmin } from './middleware/requireAdmin.js';
import { publicContentRouter, adminContentRouter } from './routes/content.js';

const app = express();
const { port, host } = config;
app.set('trust proxy', config.trustProxy);

app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/ready', async (_req, res) => {
  try {
    await pingDatabase();
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'unavailable', database: 'disconnected' });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/admin', requireAdmin, adminContentRouter);
app.use('/api', publicContentRouter);
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Only the built frontend is public; server source and environment files are not served.
const frontendPath = fileURLToPath(new URL('../dist/', import.meta.url));
app.use(express.static(frontendPath, { dotfiles: 'deny', index: 'index.html', maxAge: 0 }));
app.use((_req, res) => res.status(404).send('Page not found'));

const handleError: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error.code === 121) {
    res.status(400).json({ error: 'This entry could not be saved because its fields do not match the database rules. Check the year, links, and research themes. If they are correct, ask the administrator to update the database schema.' }); return;
  }
  if (error.code === 11000) {
    res.status(409).json({ error: 'A record with this unique value already exists' }); return;
  }
  const status = error.status === 400 || error.status === 413 ? error.status : 500;
  if (status === 500) console.error('API request failed');
  res.status(status).json({ error: status === 400 ? 'Invalid JSON body' : status === 413 ? 'Request body too large' : 'Internal server error' });
};
app.use(handleError);

try {
  await connectDatabase();
  console.log('MongoDB connected.');
} catch {
  console.error('MongoDB connection failed. Check credentials, Atlas network access, and DNS/network connectivity.');
  await closeDatabase();
  process.exit(1);
}

const server = app.listen(port, host, () => {
  console.log(`FOCUS website and API listening at http://${host}:${port}`);
});
server.on('error', async () => {
  console.error('Unable to start API. Check that PORT is available.');
  await closeDatabase();
  process.exitCode = 1;
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    const deadline = setTimeout(() => process.exit(1), 15000);
    deadline.unref();
    server.close(async () => {
      await closeDatabase();
      process.exit(0);
    });
  });
}
