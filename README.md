# LocalChat

A modern, all-in-one local AI chat application with built-in Ollama management. Install, download models, and chat - all from one beautiful interface with a clean, always-visible sidebar.

![LocalChat Screenshot](public/Ollama.png)

## 🌟 Key Highlights

- **RAG - Chat with Documents** - Upload and chat with your PDFs, Word docs, and text files!
- **Always-Visible Sidebar** - Quick access to all your conversations
- **Clean, Modern UI** - Professional design with optimal spacing and readability
- **Complete Privacy** - Everything runs locally on your machine (including embeddings!)
- **Zero Configuration** - Guided setup from start to finish

## Repository

🔗 **GitHub Repository**: [https://github.com/saravanasak/localchat]

## ✨ Features

### 🎯 Core Features
- � **Buillt-in Ollama Management** - Install and manage Ollama directly from the app
- 📦 **Model Library** - Browse and download 60+ AI models with one click
- 💬 **Real-time Chat** - Smooth streaming responses from local AI models
- 📝 **Edit & Regenerate** - Edit any message and regenerate responses
- 📚 **Persistent Sidebar** - Always-visible chat history for easy navigation
- 🎨 **Modern UI/UX** - Clean, professional interface with optimal spacing
- ⚡ **Quick Prompts** - Get started with suggested prompts
- 🔄 **Auto-Detection** - Automatically detects Ollama installation status
- 💾 **Local First** - Everything runs on your machine, complete privacy

### 🎨 UI/UX Improvements
- **Left Sidebar** - Always visible with all your conversations
- **Clean Header** - Streamlined design with essential controls
- **Centered Chat** - Optimal reading width for better focus
- **Better Spacing** - Improved message layout and padding
- **Icon Badges** - Visual indicators for user and AI messages
- **Smooth Animations** - Polished transitions and hover effects

## Prerequisites

**Node.js** (version 16.x or higher)
- Download from [Node.js official website](https://nodejs.org)

That's it! LocalChat will guide you through installing Ollama if needed.

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/saravanasak/localchat.git
   cd localchat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   npm run dev
   ```

4. **Access LocalChat**
   - Open your browser and navigate to `http://localhost:5173`
   - Follow the on-screen setup wizard if Ollama is not installed

## 🚀 Getting Started

### First Launch

1. **Ollama Detection**
   - LocalChat automatically detects if Ollama is installed
   - If not installed: Setup Wizard appears with instructions
   - If installed: Proceeds to model selection

2. **Download Your First Model**
   - Click "Models" button in the header
   - Browse the model library
   - Recommended starter: **llama3.2:1b** (1.3 GB, fast)
   - Click "Download" and watch real-time progress
   - Model appears in dropdown when ready

3. **Start Chatting**
   - Select your model from the dropdown
   - Type a message or click a quick prompt
   - Watch responses stream in real-time
   - All conversations saved in the left sidebar

### Navigation

**Sidebar (Left)**
- Click "New Chat" to start fresh conversation
- Click any chat to switch to it
- Hover over chat to reveal delete button
- Active chat is highlighted

**Header (Top)**
- Monitor Ollama status (green = online)
- Click "Models" to manage your AI models
- Select active model from dropdown

**Chat Area (Center)**
- Type messages in the input at bottom
- Hover over your messages to edit them
- Scroll through conversation history
- Rename chat using "Rename" button
- Enable RAG toggle to chat with your documents

## 📱 Interface Overview

### Layout
```
┌─────────────────────────────────────────────────────────┐
│  Sidebar (280px)  │         Main Content Area           │
│                   │                                      │
│  LocalChat        │  Header: LocalChat | Status | Models│
│  [New Chat]       │  ─────────────────────────────────  │
│                   │                                      │
│  Recent Chats     │         Chat Messages                │
│  • Chat 1         │         (Centered, 900px max)        │
│  • Chat 2         │                                      │
│  • Chat 3         │                                      │
│                   │                                      │
│                   │         Message Input                │
└─────────────────────────────────────────────────────────┘
```

### Key UI Elements

**Left Sidebar (Always Visible)**
- LocalChat branding at top
- New Chat button (prominent green)
- List of recent conversations
- Hover to reveal delete button
- Active chat highlighted

**Main Header**
- LocalChat logo and tagline
- Server status indicator
- Models button (access model library)
- Model selector dropdown

**Chat Area**
- Centered content (max 900px width)
- Clean message bubbles with icon badges
- User messages: Blue badge with user icon
- AI messages: Green badge with terminal icon
- Edit button on hover for user messages

## Features in Detail

### Built-in Ollama Management
- Automatic detection of Ollama installation
- Platform-specific installation instructions
- One-click setup wizard
- Real-time status monitoring

### Model Library
- **60+ AI models** from Ollama's official library
- One-click model downloads with progress tracking
- Advanced filtering (recommended, chat, code, vision, size)
- Sort by popularity, name, or size
- Search across all models
- Model management (install/delete)
- See model sizes and parameters before downloading
- Recommended models highlighted
- Categories: Chat, Code, Vision, Embedding, Multilingual

### RAG - Chat with Documents (NEW!)
- Upload PDFs, DOCX, TXT, MD files
- Automatic text extraction and processing
- Semantic search using embeddings (runs in browser!)
- Context-aware responses based on your documents
- Document management (view, delete)
- Toggle RAG on/off per conversation
- All processing happens locally - complete privacy

### Enhanced Chat Experience
- Real-time streaming responses
- Edit any message and regenerate responses
- Organize conversations with custom titles
- Quick prompt suggestions on welcome screen
- Clean, readable message layout
- Smooth animations and transitions

## Troubleshooting

### Ollama Not Detected
- Make sure Ollama is installed and running
- Check if Ollama is accessible at `http://localhost:11434`
- Try restarting the Ollama application
- On macOS: Check if Ollama is in Applications folder
- On Windows: Check if Ollama service is running
- On Linux: Run `systemctl status ollama`

### Model Download Issues
- Ensure you have enough disk space
- Check your internet connection
- Try downloading a smaller model first
- Restart Ollama if downloads hang

### Chat Not Working
- Verify a model is selected in the dropdown
- Check that the model finished downloading
- Refresh the page if the UI seems stuck
- Check browser console for errors (F12)

## 🎨 Design Philosophy

LocalChat is designed with these principles:

1. **Clarity** - Clean, uncluttered interface
2. **Accessibility** - Always-visible sidebar for easy navigation
3. **Focus** - Centered chat area for optimal reading
4. **Privacy** - Everything local, nothing sent to servers
5. **Simplicity** - Guided experience from setup to chat

## 💻 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Framework**: Chakra UI
- **Styling**: Emotion (CSS-in-JS)
- **Icons**: React Icons
- **State**: React Hooks
- **Storage**: LocalStorage (chat history)
- **AI Backend**: Ollama (local)

## 🎯 Use Cases

- **Document Q&A** - Upload research papers, manuals, books and ask questions
- **Personal Knowledge Base** - Chat with your notes, documents, and files
- **Research Assistant** - Analyze and summarize multiple documents
- **Study Helper** - Upload textbooks and get explanations
- **Code Documentation** - Chat with API docs and technical manuals
- **Legal/Contract Review** - Ask questions about contracts and agreements
- **Personal Assistant** - Ask questions, get explanations
- **Coding Help** - Generate code, debug, explain algorithms
- **Writing** - Draft emails, articles, creative content

## 🔒 Privacy First

- ✅ All processing happens on your machine
- ✅ No data sent to external servers
- ✅ No account required
- ✅ No tracking or analytics
- ✅ Complete control over your data
- ✅ Works offline (after models downloaded)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## � Acknowyledgments

- [Ollama](https://ollama.com) - For making local AI accessible
- [Chakra UI](https://chakra-ui.com) - For the beautiful component library
- [React](https://react.dev) - For the powerful UI framework
- All the open-source AI models available through Ollama

---

**LocalChat** - Your Private AI Assistant, Running Locally

Made with ❤️ for privacy-conscious users who want the power of AI without compromising their data.
