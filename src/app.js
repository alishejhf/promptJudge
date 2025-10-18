import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import evaluateRouter from './routes/evaluate.js';
import compareRouter from './routes/compare.js';
import historyRouter from './routes/history.js';

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/evaluate', evaluateRouter);
app.use('/compare', compareRouter);
app.use('/history', historyRouter);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.url} not found`
  });
});

app.use((err, req, res, next) => {
  console.error('[Error]', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║        PromptJudge AI Server          ║
╚═══════════════════════════════════════╝

🚀 Server running on: http://localhost:${PORT}
📊 API Endpoints:
   POST /evaluate   - Evaluate a prompt
   POST /compare    - Compare two prompts
   GET  /history    - View evaluation history
   GET  /health     - Health check

⚙️  Configuration:
   Model: ${process.env.OLLAMA_MODEL || 'llama3.2:3b'}
   Ollama: ${process.env.OLLAMA_HOST || 'http://localhost:11434'}

💡 Make sure Ollama is running!
  `);
});
