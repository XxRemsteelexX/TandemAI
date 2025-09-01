
# TandemAI - Local-First LLM Ensemble Platform

**"Let your models work together: relay, debate, verify."**

TandemAI orchestrates multiple LLMs (local + API) in structured collaborative modes for better AI responses.

## ✨ Features

### 🧠 **4 Orchestration Modes**
- **Conversation**: Natural chat with 3 models responding sequentially
- **Answer**: Seed → Refine → Polish for best final answer  
- **Argumentative**: Two models debate → Arbiter decides
- **Research**: Outline → Suggestions → Rewrite for structured research

### 🔌 **Universal Provider Support**
**Local LLMs (Privacy-First):**
- ✅ Ollama (http://localhost:11434/v1)
- ✅ LM Studio (http://localhost:1234/v1)
- ✅ vLLM (http://localhost:8000/v1) 
- ✅ llama.cpp (http://localhost:8080/v1)

**API Providers:**
- ✅ OpenAI (GPT-4, GPT-3.5)
- ✅ Anthropic (Claude 3.5 Sonnet)
- ✅ Groq (Ultra-fast inference)
- ✅ Together AI, Fireworks AI
- ✅ OpenRouter (Unified access)
- ✅ DeepSeek (Coding specialist)
- ✅ Kimi/Moonshot (Long context)

### 🛡️ **Privacy & Control**
- **Offline-capable** - Works without internet using local models
- **Mix & match** - Combine local and API providers
- **Real-time monitoring** - Watch models collaborate in real-time
- **Export capabilities** - Save conversations with full orchestration details

## 🚀 **Quick Start**

### 1. **Install & Run**
```bash
cd app
yarn install
yarn dev
# Open http://localhost:3000
```

### 2. **Local Setup (Recommended)**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a lightweight model
ollama pull llama3.1:8b

# Or install LM Studio from https://lmstudio.ai
```

### 3. **Configure Providers**
1. Go to **Providers** tab
2. Enable local providers or add API keys
3. Test connections to verify they work

### 4. **Setup Orchestration**
1. Go to **Orchestration** tab
2. Choose a **Quick Preset** or customize your own:
   - 🛡️ **Local Privacy** - Only local models
   - ⚡ **Speed First** - Fast lightweight responses
   - ⭐ **Max Quality** - Premium models for best results
   - 🧠 **Research Deep** - Multi-round comprehensive research

### 5. **Start Chatting**
1. Go to **Chat** tab
2. Ask questions and watch models collaborate!
3. Enable **Thinking Mode** to see intermediate steps

## 🎯 **Use Cases**

### **Local Privacy Mode**
Perfect for sensitive work - uses only local models:
```
Ollama (Seed) → LM Studio (Refine) → Local Judge
```

### **Hybrid Quality Mode** 
Best of both worlds - API seed, local refine:
```
GPT-4 (Seed) → Claude (Analyze) → Local Ollama (Polish)
```

### **Speed Research Mode**
Fast collaborative research:
```
Groq (Outline) → Together AI (Suggest) → Claude (Rewrite)
```

### **Debate Mode**
Get multiple perspectives:
```
GPT-4 vs Claude → Local Arbiter decides
```

## ⚙️ **Advanced Features**

- **Early Stopping** - Stop when changes are minimal
- **Temperature Control** - Different creativity for seed vs refine
- **Token Tracking** - Monitor usage across all providers
- **Diff Visualization** - See what changed between rounds
- **Drag-and-drop** - Reorder provider sequences
- **Export** - Save chat history as Markdown

## 🔧 **Configuration**

### **Provider Types Supported:**
- `openai_compat` - Local servers (Ollama, LM Studio, vLLM, llama.cpp)
- `openai` - OpenAI API
- `anthropic` - Anthropic Claude
- `groq` - Groq API
- `together` - Together AI
- `fireworks` - Fireworks AI
- `openrouter` - OpenRouter
- `deepseek` - DeepSeek API
- `kimi` - Kimi/Moonshot

### **Orchestration Modes:**
Each mode has different collaboration patterns optimized for specific use cases.

### **Presets:**
Quick-start configurations for common scenarios with recommended model combinations.

## 📦 **Packaging for Desktop**

TandemAI is designed to be packaged as a desktop application:

### **Option 1: Tauri (Recommended)**
```bash
# Install Tauri CLI
cargo install tauri-cli

# Package as desktop app
tauri build
```

### **Option 2: Electron**
```bash
# Install Electron
npm install -g electron

# Package app
electron-builder
```

### **Option 3: Standalone Web App**
```bash
# Build static export
yarn build
yarn export

# Can be served locally or packaged with any web wrapper
```

## 🎯 **Philosophy**

Instead of just switching between different AI models, TandemAI makes them **collaborate**:

- **Seed** models generate initial responses
- **Refiner** models improve and correct
- **Specialists** add domain expertise  
- **Arbiters** resolve conflicts and merge perspectives

This creates more thoughtful, accurate, and comprehensive responses than any single model alone.

## 🛣️ **Roadmap**

**Current (MVP):**
- ✅ All 4 orchestration modes
- ✅ Universal provider support  
- ✅ Real-time streaming
- ✅ Offline capability

**Next:**
- 🔄 Fact-checker integration (NLI models)
- 📊 Judge scoring system
- 🔍 RAG/document integration
- 🎙️ Voice roundtable mode
- 📱 Mobile app

---

**TandemAI** - Where AI models work together for better responses! 🤖✨
