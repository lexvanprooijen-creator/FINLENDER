// server.js — FinLender label service
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// --- Optionele beveiliging ---
const REQUIRED_TOKEN = process.env.API_TOKEN || null;
app.use((req, res, next) => {
  if (!REQUIRED_TOKEN) return next(); // beveiliging uit
  const auth = req.headers.authorization || '';
  if (auth === `Bearer ${REQUIRED_TOKEN}`) return next();
  res.status(401).json({ error: 'unauthorized' });
});

// --- Static bestanden voor gidsen / pdf’s ---
app.use('/guides', express.static(path.join(__dirname, 'public', 'guides')));

// --- Helper: lees alle label-bestanden ---
function readLabels() {
  const dir = path.join(__dirname, 'data', 'labels');
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  const items = [];

  for (const f of files) {
    try {
      const raw = fs.readFileSync(path.join(dir, f), 'utf8');
      const obj = JSON.parse(raw);
      if (obj && obj.active) {
        items.push({
          id: obj.id,
          label: obj.label,
          provider: obj.provider,
          type: obj.type || '',
          notes: obj.notes || '',
          conditions_url: obj.conditions_url || '',
          acceptance_url: obj.acceptance_url || ''
        });
      }
    } catch (e) {
      console.warn('⚠️ Fout in', f, e.message);
    }
  }
  items.sort((a, b) => (a.label || '').localeCompare(b.label || ''));
  return items;
}

// --- API Endpoints ---
app.get('/labels', (req, res) => {
  try {
    res.json(readLabels());
  } catch (e) {
    res.status(500).json({ error: 'read_failed', message: e.message });
  }
});

app.get('/healthz', (_req, res) => res.json({ ok: true }));

// --- Start server ---
const port = process.env.PORT || 3000;
app.listen(port, () => {
  const url = process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`;
  console.log('✅ FinLender service actief op ' + url);
});
