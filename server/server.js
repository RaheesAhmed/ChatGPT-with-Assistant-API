// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai"); // Import OpenAI library

const app = express();
const PORT = process.env.PORT || 5000; // Use environment variable for port or default to 5000

// --- OpenAI Setup ---
// Ensure API key and Assistant ID are set
if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_ASSISTANT_ID) {
  console.error(
    "Error: OPENAI_API_KEY and OPENAI_ASSISTANT_ID must be set in the .env file."
  );
  process.exit(1); // Exit if essential configuration is missing
}

const openai = new OpenAI(); // Initializes with API key from OPENAI_API_KEY env var
const assistantId = process.env.OPENAI_ASSISTANT_ID;
// --- End OpenAI Setup ---

// Store active threads in memory (simple approach; consider a database for production)
const activeThreads = {};

app.use(cors());
app.use(express.json());

/**
 * Endpoint to handle chat messages using OpenAI Assistant API with streaming.
 * Uses an existing threadId or creates a new one.
 * Streams responses back to the client using Server-Sent Events (SSE).
 * Accessed via GET request.
 */
app.get("/chat/streaming", async (req, res) => {
  // Read parameters from query string
  const { message, threadId: clientThreadId } = req.query;

  if (!message) {
    // Cannot send JSON error after setting SSE headers, so handle early
    return res
      .status(400)
      .send("Error: Message content is required in query parameters.");
  }

  console.log(
    `Streaming GET request received: "${message}", Thread ID: ${
      clientThreadId || "New"
    }`
  );

  // --- Set Headers for SSE --- Must be done before any async operations that might fail
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); // Flush headers to establish the connection

  try {
    let threadIdToUse = clientThreadId || null; // Use null if empty string or undefined
    let isNewThread = false;

    // Create a new thread if no threadId is provided
    if (!threadIdToUse) {
      console.log("Creating new thread...");
      const thread = await openai.beta.threads.create();
      threadIdToUse = thread.id;
      isNewThread = true;
      console.log(`New thread created: ${threadIdToUse}`);
    } else {
      console.log(`Using existing thread: ${threadIdToUse}`);
    }

    // Add the user's message to the thread (this is NOT streamed)
    await openai.beta.threads.messages.create(threadIdToUse, {
      role: "user",
      content: message,
    });
    console.log(`User message added to thread: ${threadIdToUse}`);

    // --- Send the threadId as the first event ---
    res.write(
      `event: thread.id\ndata: ${JSON.stringify({
        threadId: threadIdToUse,
      })}\n\n`
    );

    // --- Initiate the Assistant Run Stream ---
    console.log(
      `Streaming assistant run (${assistantId}) on thread ${threadIdToUse}...`
    );
    const stream = openai.beta.threads.runs.stream(threadIdToUse, {
      assistant_id: assistantId,
    });

    // --- Process and Forward Stream Events ---
    for await (const event of stream) {
      // Construct SSE message format: event name + data
      const eventName = event.event.replace(/\./g, "_"); // Replace dots for valid event names if needed, or use raw
      const data = JSON.stringify(event.data);
      res.write(`event: ${event.event}\ndata: ${data}\n\n`);

      // Log server-side for debugging
      if (event.event === "thread.message.delta") {
        // Basic logging of delta content
        const delta = event.data.delta?.content?.[0];
        if (delta?.type === "text" && delta.text?.value) {
          // Log only the text value to keep console cleaner
          // console.log(`Delta Chunk: ${delta.text.value}`);
          process.stdout.write(delta.text.value); // Write chunk directly to stdout
        }
      } else if (event.event === "thread.message.completed") {
        process.stdout.write("\n"); // Add newline after message completion
        // console.log('\nMessage completed.');
      } else if (event.event === "thread.run.requires_action") {
        console.log("Run requires action:", event.data);
        // Handle function calls if your assistant uses them
        // This basic example doesn't handle function calls
      } else if (event.event === "thread.run.failed") {
        console.error("Run failed:", event.data);
      }
    }

    console.log(`Stream ended for thread ${threadIdToUse}.`);

    // Signal the end of the stream to the client (optional custom event)
    res.write(
      `event: stream.end\ndata: ${JSON.stringify({
        message: "Stream ended",
      })}\n\n`
    );

    // End the response connection
    res.end();
  } catch (error) {
    console.error("Error during streaming chat:", error);
    // If stream started, try sending an error event before closing
    // Avoid sending 500 status code here as headers are already sent
    try {
      res.write(
        `event: stream.error\ndata: ${JSON.stringify({
          error: error.message || "An internal error occurred during streaming",
        })}\n\n`
      );
    } catch (writeError) {
      console.error("Failed to write stream error event:", writeError);
    }
    res.end(); // Ensure connection is closed
  }
});

/**
 * Endpoint to retrieve message history for a specific thread.
 */
app.get("/chat/history/:threadId", async (req, res) => {
  const { threadId } = req.params;

  if (!threadId) {
    return res
      .status(400)
      .json({ error: "Thread ID is required in URL parameters." });
  }

  console.log(`Fetching history for thread ID: ${threadId}`);

  try {
    const messages = await openai.beta.threads.messages.list(threadId, {
      order: "asc", // Fetch messages in chronological order
    });

    // Format messages for the frontend
    const formattedHistory = messages.data
      .map((msg) => {
        // Ensure content is text and extract it
        const textContent =
          msg.content.find((c) => c.type === "text")?.text?.value || "";
        return {
          role: msg.role, // 'user' or 'assistant'
          content: textContent,
          // You could add message ID or timestamp if needed later
        };
      })
      .filter((msg) => msg.content); // Filter out any messages that didn't have text content

    console.log(
      `Found ${formattedHistory.length} messages for thread ${threadId}.`
    );
    res.json({ history: formattedHistory });
  } catch (error) {
    console.error(`Error fetching history for thread ${threadId}:`, error);
    // Check for specific OpenAI errors if needed (e.g., invalid thread ID)
    if (error.status === 404) {
      return res
        .status(404)
        .json({ error: "Chat history not found for the given ID." });
    }
    res
      .status(500)
      .json({ error: "Internal server error fetching chat history." });
  }
});

app.listen(PORT, () => {
  console.log(
    `Server with OpenAI streaming running at http://localhost:${PORT}`
  );
  console.log(`Using Assistant ID: ${assistantId}`);
});
