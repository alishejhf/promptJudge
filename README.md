# ⚖️ PromptJudge

**AI-Powered Prompt Quality Evaluator using Ollama**

PromptJudge is a production-quality web application that evaluates and improves prompts for Large Language Models (LLMs). It uses a local Ollama instance to analyze prompt quality across multiple dimensions and provides actionable feedback.

---

## 🎯 Features

- **✅ Prompt Evaluation**: Analyze prompts across 5 key dimensions (clarity, specificity, scope, context, constraints)
- **🔀 Prompt Comparison**: Compare two prompts side-by-side to determine which is better
- **📊 Evaluation History**: Track your last 5 evaluated prompts
- **🎨 Modern UI**: Clean, responsive dark-themed interface with real-time feedback
- **🔄 Smart Retry**: Automatic retry mechanism for invalid LLM responses
- **⚡ Fast & Local**: Runs entirely on your machine with Ollama

---

## 🧱 Tech Stack

### Backend
- **Node.js** with ES Modules
- **Express.js** for API and static file serving
- **Ollama** for local LLM inference
- **dotenv** for environment configuration
- **CORS** for cross-origin requests
- **Morgan** for HTTP logging

### Frontend
- Vanilla **HTML5**, **CSS3**, **JavaScript** (ES6+)
- Fetch API for async requests
- Responsive design with CSS Grid & Flexbox
- Dark theme optimized for readability

---

## 📦 Installation

### Prerequisites

1. **Node.js** (v16 or higher)
2. **Ollama** installed and running

### Step 1: Install Ollama

**macOS/Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Or download from:** https://ollama.com/download

### Step 2: Pull Required Models

```bash
ollama pull llama3.2:3b
ollama pull llama3.1:8b  # Fallback model
```

### Step 3: Clone/Download the Project

```bash
cd /Users/alisheraldamzharov/Desktop/ppromptJudgeAI
```

### Step 4: Install Dependencies

```bash
npm install
```

### Step 5: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` if needed (default values work out of the box):
```env
PORT=3000
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
OLLAMA_FALLBACK_MODEL=llama3.1:8b
OLLAMA_TEMPERATURE=0.3
```

---

## 🚀 Usage

### Start Ollama (if not already running)

```bash
ollama serve
```

### Start PromptJudge Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

### Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🧪 API Endpoints

### 1️⃣ POST `/evaluate`

Evaluates a single prompt.

**Request:**
```bash
curl -X POST http://localhost:3000/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Tell me about climate change."
  }'
```

**Response:**
```json
{
  "clarity": 8,
  "specificity": 5,
  "scope": 6,
  "context": 7,
  "constraints": 4,
  "bias": "low",
  "feedback": "Prompt is general. Add constraints or examples for more precise answers.",
  "improved_prompt": "Explain the causes of climate change focusing on industrial emissions and data from the past 20 years."
}
```

### 2️⃣ POST `/compare`

Compares two prompts.

**Request:**
```bash
curl -X POST http://localhost:3000/compare \
  -H "Content-Type: application/json" \
  -d '{
    "promptA": "Tell me about AI.",
    "promptB": "Explain the key differences between supervised and unsupervised machine learning, including practical examples."
  }'
```

**Response:**
```json
{
  "winner": "B",
  "reason": "Prompt B is more specific, provides clear scope, and requests examples.",
  "scores": {
    "A": { "clarity": 6, "specificity": 4 },
    "B": { "clarity": 9, "specificity": 9 }
  }
}
```

### 3️⃣ GET `/history`

Retrieves the last 5 evaluations.

**Request:**
```bash
curl http://localhost:3000/history
```

**Response:**
```json
{
  "count": 2,
  "history": [
    {
      "prompt": "Tell me about climate change.",
      "result": { ... },
      "timestamp": "2025-10-18T19:26:00.000Z"
    }
  ]
}
```

### 4️⃣ GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-18T19:26:00.000Z",
  "uptime": 123.45
}
```

---

## 🎨 Web Interface Usage

### Evaluate a Prompt
1. Select **"Evaluate Prompt"** mode
2. Enter your prompt in the textarea
3. Click **"Evaluate Prompt"** (or press `Ctrl/Cmd + Enter`)
4. View the structured JSON results below

### Compare Two Prompts
1. Select **"Compare Prompts"** mode
2. Enter both prompts in their respective textareas
3. Click **"Compare Prompts"**
4. See which prompt is better and why

### View History
1. Select **"History"** mode
2. View your last 5 evaluated prompts
3. Click **"Refresh History"** to reload

---

## 📁 Project Structure

```
promptjudge/
├── package.json              # Dependencies and scripts
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore rules
├── README.md                # This file
└── src/
    ├── app.js               # Express server entry point
    ├── routes/
    │   ├── evaluate.js      # /evaluate endpoint
    │   ├── compare.js       # /compare endpoint
    │   └── history.js       # /history endpoint
    ├── services/
    │   └── ollamaService.js # Ollama API integration
    ├── utils/
    │   └── parseJSON.js     # JSON parsing utilities
    └── public/
        ├── index.html       # Frontend HTML
        ├── style.css        # Frontend styles
        └── app.js           # Frontend JavaScript
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `OLLAMA_HOST` | `http://localhost:11434` | Ollama API URL |
| `OLLAMA_MODEL` | `llama3.2:3b` | Primary model |
| `OLLAMA_FALLBACK_MODEL` | `llama3.1:8b` | Fallback model |
| `OLLAMA_TEMPERATURE` | `0.3` | LLM temperature (0-1) |

### Model Selection

The app uses `llama3.2:3b` by default for speed. If you have more VRAM, you can use larger models:

```env
OLLAMA_MODEL=llama3.1:8b
OLLAMA_FALLBACK_MODEL=llama2:13b
```

---

## 🐛 Troubleshooting

### "Connection refused" errors

**Problem:** Cannot connect to Ollama.

**Solution:**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not, start it
ollama serve
```

### "Model not found" errors

**Problem:** Required model isn't installed.

**Solution:**
```bash
ollama pull llama3.2:3b
```

### Invalid JSON responses

**Problem:** LLM returns malformed JSON.

**Solution:** The app automatically retries with stricter instructions. Check server logs for details:
```
[OllamaService] Attempt 1 failed: ...
[OllamaService] Retrying with stricter instruction...
```

### Port already in use

**Problem:** Port 3000 is occupied.

**Solution:** Change port in `.env`:
```env
PORT=3001
```

---

## 🧪 Example Prompts to Try

**Poor Quality Prompt:**
```
Tell me about AI.
```

**Good Quality Prompt:**
```
Explain the key differences between supervised and unsupervised machine learning, 
including practical examples of each, targeted at someone with basic programming 
knowledge but no ML experience.
```

**Comparison Example:**
- **Prompt A:** "Write code for a website."
- **Prompt B:** "Create a responsive landing page using HTML, CSS, and JavaScript with a hero section, feature cards, and contact form."

---

## 📝 Development

### Running in Development Mode

```bash
npm run dev
```

This uses Node's `--watch` flag for auto-reload on file changes.

### Code Style

- ES Modules (`import`/`export`)
- Async/await for asynchronous operations
- Comprehensive error handling
- Console logging for debugging

---

## 🤝 Contributing

Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

---

## 📄 License

MIT License - feel free to use this project however you'd like!

---

## 🙏 Acknowledgments

- **Ollama** for local LLM inference
- **Express.js** for the robust web framework
- **llama3.2** and **llama3.1** models by Meta

---

## 📞 Support

If you encounter issues:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Verify Ollama is running: `ollama list`
3. Check server logs for detailed error messages
4. Ensure all dependencies are installed: `npm install`

---

**Built with ❤️ using Node.js, Express, and Ollama**
