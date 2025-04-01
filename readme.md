# AI Chat Interface with OpenAI Assistant API

This project implements a chat interface using React (Next.js) for the frontend and Node.js (Express) for the backend, connecting to the OpenAI Assistant API. It supports real-time streaming responses and chat history management.

## Features Implemented

**Frontend (Client - Next.js):**

- **UI Framework:** Built with Next.js and styled using Tailwind CSS and shadcn/ui components.
- **Real-time Streaming:** Assistant responses are streamed token-by-token using Server-Sent Events (SSE).
- **Chat History Sidebar:**
  - Displays a list of previous chat sessions identified by title and thread ID.
  - Persists the list of chat sessions (`threadId`, `title`, `timestamp`) in browser `localStorage`.
  - Allows starting a new chat session.
  - Allows selecting a previous chat session to load its message history.
  - Provides a button to delete all chat sessions from the list and `localStorage`.
- **Message Display:**
  - Distinguishes between 'user' and 'assistant' messages using different styling and icons.
  - Renders assistant messages using `react-markdown` to support Markdown formatting.
  - Shows a blinking cursor indicator while an assistant message is actively streaming.
- **Input:**
  - Allows sending messages by pressing the 'Enter' key.
  - Input field is automatically focused on load and after message send/selection.
- **Chat Starters:** Displays suggested starter prompts with icons when a new chat is started and the history is empty.

**Backend (Server - Node.js/Express):**

- **OpenAI Assistant API Integration:** Connects to a specified OpenAI Assistant using the official `openai` Node.js library.
- **Thread Management:** Creates new OpenAI conversation threads or utilizes existing `threadId` provided by the client.
- **Streaming Endpoint (`GET /chat/streaming`):**
  - Receives user messages and optional `threadId`.
  - Adds the user message to the OpenAI thread.
  - Creates and streams the Assistant's response back to the client using Server-Sent Events (SSE), sending `thread.id`, `thread.message.created`, `thread.message.delta`, `thread.message.completed`, and custom `stream.end`/`stream.error` events.
- **History Endpoint (`GET /chat/history/:threadId`):**
  - Retrieves the list of messages for a given `threadId` from the OpenAI API.
  - Formats the messages into a simple `{ role, content }` structure for the frontend.
- **Configuration:** Uses a `.env` file to manage the OpenAI API Key and Assistant ID.

_(Note: Features from the original task description like suggestion lists/buttons and specific typing indicators before suggestions were not implemented in this version.)_

## Project Structure

```
.
├── client/         # Next.js Frontend Application
│   ├── app/        # App Router structure
│   ├── components/ # React components (Sidebar, ChatMessage, ui)
│   ├── lib/        # Utility functions (e.g., shadcn utils)
│   ├── public/     # Static assets
│   ├── ...         # Config files (tailwind, postcss, tsconfig, etc.)
│   └── package.json
├── server/         # Node.js Backend Application
│   ├── .env        # Environment variables (API Keys, Assistant ID) - MUST BE CREATED
│   ├── server.js   # Express server logic
│   └── package.json
└── README.md       # This file
```

## Clone the Repo:

``
git clone https://github.com/RaheesAhmed/ChatGPT-with-Assistant-API.git

````

## Setup and Installation

**Prerequisites:**

- Node.js (v18 or later recommended)
- npm or yarn
- OpenAI API Key
- OpenAI Assistant ID (Create one via the OpenAI platform or API)

**1. Backend Setup:**

```bash
# Navigate to the server directory
cd server

# Install dependencies
npm install

# Create the environment file
# Manually create a file named .env in the server/ directory

# Edit the .env file and add your credentials:
OPENAI_API_KEY=sk-your_openai_api_key_here
OPENAI_ASSISTANT_ID=asst_your_assistant_id_here
# PORT=5000 # Optional, defaults to 5000
````

**2. Frontend Setup:**

```bash
# Navigate to the client directory (from the root)
cd ../client
# or from the server directory: cd ../client

# Install dependencies
npm install
```

## Running the Application

You need to run both the backend and frontend servers concurrently.

**1. Start the Backend Server:**

```bash
# Navigate to the server directory
cd server

# Start the server
node server.js
```

The backend will run on `http://localhost:5000` (or the port specified in `.env`).

**2. Start the Frontend Development Server:**

```bash
# Navigate to the client directory
cd ../client # (If you are in the server directory)

# Start the Next.js dev server
npm run dev
```

The frontend will typically run on `http://localhost:3000`. Open this URL in your browser.
