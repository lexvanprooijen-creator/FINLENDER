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

// Static serve for acceptance guides / PDFs
app.use('/guides', express.static(path.join(__dirname, 'public', 'guides')));

function readLabels(){
  const dir = path.join(__dirname, 'data', 'labels');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  const items = [];
  for(const f of files){
    const raw = fs.readFileSync(path.join(dir, f), 'utf8');
    try{ 
      const obj = JSON.parse(raw);
      if(obj && obj.active){
        // normalize & required fields
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
    } catch(e){ /* skip */ }
  }
  // sort by label
  items.sort((a,b)=> (a.label||'').localeCompare(b.label||''));
  return items;
}

app.get('/labels', (req,res)=>{
  try{
    res.json(readLabels());
  }catch(e){
    res.status(500).json({error: 'read_failed'});
  }
});

// Health
app.get('/healthz', (_req,res)=> res.json({ok:true}));

const port = process.env.PORT || 3000;
app.listen(port, ()=> console.log('Labels service on :' + port));
