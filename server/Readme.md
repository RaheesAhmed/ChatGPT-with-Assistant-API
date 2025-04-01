# Backend Server for AI Chat Interface

This Node.js/Express server acts as the backend for the AI Chat Interface, handling communication between the React frontend and the OpenAI Assistant API.

## Purpose

- Provides API endpoints for the frontend to send messages and manage chat sessions.
- Integrates with the OpenAI Assistant API to:
  - Create and manage conversation threads.
  * Add user messages to threads.
  * Run the specified Assistant on a thread.
  * Stream Assistant responses back to the client in real-time using Server-Sent Events (SSE).
  * Retrieve message history for a given thread.
- Manages necessary configuration like API keys and Assistant IDs via environment variables.

## Setup

**Prerequisites:**

- Node.js (v18 or later recommended)
- npm or yarn
- OpenAI API Key
- OpenAI Assistant ID (You can use the scripts in the `/assistants` directory to help create/manage one)

**Steps:**

1.  **Navigate to the `server` directory:**

    ```bash
    cd server
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    ```

3.  **Create Environment File:**
    - Manually create a file named `.env` in this `server` directory.
    - Add the following environment variables, replacing the placeholder values with your actual credentials:
      ```dotenv
      OPENAI_API_KEY=sk-your_openai_api_key_here
      OPENAI_ASSISTANT_ID=asst_your_assistant_id_here
      # PORT=5000 # Optional: Defaults to 5000 if not set
      ```

## Running the Server

```bash
node server.js
```

The server will start, typically on `http://localhost:5000` (or the port specified in `.env`), and log the Assistant ID it's configured to use.

## API Endpoints

1.  **`GET /chat/streaming`**

    - **Purpose:** Sends a user message to the Assistant and streams the response back. Creates a new thread if `threadId` is not provided.
    - **Query Parameters:**
      - `message` (string, required): The user's message content.
      - `threadId` (string, optional): The ID of an existing OpenAI thread to continue.
    - **Response:** A `text/event-stream` response containing Server-Sent Events corresponding to the OpenAI stream events (`thread.id`, `thread.message.created`, `thread.message.delta`, `thread.message.completed`, etc.) and custom `stream.end`/`stream.error` events.

2.  **`GET /chat/history/:threadId`**
    - **Purpose:** Retrieves the message history for a specific conversation thread.
    - **URL Parameters:**
      - `:threadId` (string, required): The ID of the OpenAI thread.
    - **Response:** A JSON object containing `{ history: [...] }` where `history` is an array of message objects (`{ role: 'user' | 'assistant', content: string }`) in chronological order. Returns 404 if the thread is not found, 500 on other errors.

## Environment Variables

- `OPENAI_API_KEY`: **Required.** Your secret API key from OpenAI.
- `OPENAI_ASSISTANT_ID`: **Required.** The ID of the OpenAI Assistant this server should interact with.
- `PORT`: Optional. The port number for the server to listen on (defaults to 5000).

## Helper Scripts (`/assistants`)

This directory contains simple Node.js scripts to help manage your OpenAI Assistant:

- **`create.js`:** Creates a new OpenAI Assistant with basic configuration (name, instructions, model). You'll need to manually update the `.env` file with the new Assistant ID after running it.
- **`update.js`:** Updates an existing Assistant (specified by the ID in `.env`) with new instructions or model.

**Note:** These scripts require `openai` and `dotenv` packages (install via `npm install`) and expect the `OPENAI_API_KEY` to be set in the `.env` file. Run them using `node assistants/create.js` or `node assistants/update.js` from the `server` directory.
