"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Sidebar from '../components/Sidebar';
import ChatMessage from '../components/ChatMessage';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BrainCircuit, ThermometerSun, BookOpenText, Feather } from 'lucide-react';

// Define an interface for chat messages
interface Message {
  role: "user" | "assistant";
  content: string;
}

// Added interface for streaming message parts
interface StreamMessage extends Message {
  isStreaming?: boolean;
}

// High-quality Send Icon (Feather Icons: Send)
const SendIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20" // Slightly smaller icon
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="feather feather-send"
  >
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

interface ChatSession {
  threadId: string;
  title: string;
  timestamp: number; // Make timestamp non-optional for sorting
}

// Sample starter prompts with icons
const starterPrompts = [
  { text: "Explain quantum computing in simple terms", icon: BrainCircuit },
  { text: "What are the pros and cons of Tailwind CSS?", icon: Feather },
  { text: "Suggest a recipe for a healthy dinner", icon: ThermometerSun }, // Placeholder - could use ChefHat
  { text: "Write a short poem about React", icon: BookOpenText },
];

const App = () => {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<StreamMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const isSavingNewChat = useRef(false);

  // Load chat sessions from localStorage on initial mount
  useEffect(() => {
    let loadedSessions: ChatSession[] = []; // Default to empty
    try {
      const savedSessions = localStorage.getItem('chatSessions');
      console.log("Raw data from localStorage:", savedSessions); // Log raw data
      if (savedSessions) {
        const parsedSessions: ChatSession[] = JSON.parse(savedSessions);
        console.log("Parsed sessions from localStorage:", parsedSessions); // Log parsed data
        
        // Validate basic structure (array of objects with threadId and title)
        if (Array.isArray(parsedSessions) && parsedSessions.every(s => typeof s === 'object' && s !== null && 'threadId' in s && 'title' in s)) {
            // Ensure timestamp exists for sorting
            const sessionsWithTimestamp = parsedSessions.map(s => ({ 
                ...s, 
                timestamp: s.timestamp || Date.now() 
            }));
            loadedSessions = sessionsWithTimestamp.sort((a, b) => b.timestamp - a.timestamp); // Sort newest first
        } else {
            console.warn("Invalid session data structure found in localStorage. Clearing.");
            localStorage.removeItem('chatSessions');
        }
      }
    } catch (e) {
      console.error("Failed to load or parse chat sessions from localStorage:", e);
      localStorage.removeItem('chatSessions'); // Clear corrupted data
      loadedSessions = []; // Ensure state is empty on error
    }
    setChatSessions(loadedSessions); // Set state with loaded (or empty) sessions
    
    inputRef.current?.focus();
  }, []);

  // Save chat sessions to localStorage whenever they change
  useEffect(() => {
    // Save sessions, including when the array becomes empty
    try {
       localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
       console.log("Chat sessions saved to localStorage."); // Add confirmation log
    } catch (e) {
       console.error("Failed to save chat sessions to localStorage:", e);
    }
  }, [chatSessions]);

  // Scroll to bottom of chat history when it updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  // Cleanup EventSource on component unmount
  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();
    };
  }, []);

  // Chat Management Callbacks
  const handleNewChat = useCallback(() => {
    eventSourceRef.current?.close(); // Close any active stream
    setActiveChatId(null);
    setHistory([]);
    setMessage(""); // Clear input
    setError(null);
    setLoading(false);
    isSavingNewChat.current = false;
    inputRef.current?.focus();
  }, []);

  // Updated to fetch history
  const handleSelectChat = useCallback(async (threadId: string) => {
    if (threadId === activeChatId || loading) return; // Prevent switching if already active or loading
    
    console.log(`Selecting chat: ${threadId}`);
    eventSourceRef.current?.close(); // Close any active stream
    setActiveChatId(threadId);
    setHistory([]); // Clear current view while loading new history
    setMessage(""); 
    setError(null);
    setLoading(true); // Set loading state while fetching history
    isSavingNewChat.current = false;
    
    try {
        const res = await fetch(`http://localhost:5000/chat/history/${threadId}`);
        
        if (!res.ok) {
            let errorMsg = `HTTP error! status: ${res.status}`;
            try {
                const errorData = await res.json();
                errorMsg = errorData.error || errorMsg;
            } catch { /* Ignore if response is not JSON */ }
            throw new Error(errorMsg);
        }
        
        const data = await res.json();
        
        if (data.history && Array.isArray(data.history)) {
            console.log(`Fetched ${data.history.length} messages for thread ${threadId}.`);
            // Ensure messages have the correct structure (content might be empty)
            const validHistory = data.history.map((msg: any) => ({ 
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: typeof msg.content === 'string' ? msg.content : '', 
                isStreaming: false // Ensure this is set for loaded history
            }));
            setHistory(validHistory);
        } else {
            console.warn("Received invalid history data format.");
            setHistory([]); // Show empty if format is wrong
        }

    } catch (err: any) {
        console.error(`Failed to fetch history for thread ${threadId}:`, err);
        setError(`Failed to load chat history: ${err.message}`);
        setHistory([]); // Clear history on error
        setActiveChatId(null); // Deselect chat if history fails to load? Optional.
    } finally {
        setLoading(false); // Clear loading state
        inputRef.current?.focus();
    }

  }, [activeChatId, loading]); // Add loading to dependency array

  // Callback to delete all chat sessions
  const handleDeleteAllChats = useCallback(() => {
    if (window.confirm('Are you sure you want to delete all chat history? This cannot be undone.')) {
        console.log("Deleting all chat sessions...");
        setChatSessions([]); // Clear state
        localStorage.removeItem('chatSessions'); // Explicitly clear storage
        handleNewChat(); // Reset to a new chat state
        console.log("All chat sessions deleted.");
    }
  }, [handleNewChat]);

  /**
   * Handles sending the user message to the backend API.
   * Updates history with user message, calls API, and updates history with assistant response.
   */
  const handleSend = async () => {
    if (!message.trim() || loading) return;

    const userMessage: Message = { role: "user", content: message };
    const currentMessage = message;
    setHistory((prevHistory) => [...prevHistory, userMessage]);
    setMessage("");
    setLoading(true);
    setError(null);
    
    // Flag if we need to save this as a new session upon receiving the thread ID
    if (!activeChatId) {
        isSavingNewChat.current = true;
    }

    eventSourceRef.current?.close(); // Close previous connection

    try {
      const eventSource = new EventSource(`http://localhost:5000/chat/streaming?${new URLSearchParams({
          message: currentMessage,
          threadId: activeChatId || '', // Use activeChatId
      })}`);
      eventSourceRef.current = eventSource;

      let streamedMessageId: string | null = null;
      let fullStreamedContent = "";
      let receivedThreadId: string | null = activeChatId; // Assume current initially

      // Add placeholder for the incoming message
      setHistory((prev) => [
          ...prev,
          { role: "assistant", content: "", isStreaming: true },
      ]);

      eventSource.addEventListener("thread.id", (event) => {
          const data = JSON.parse(event.data);
          console.log("SSE - Received thread ID:", data.threadId);
          receivedThreadId = data.threadId;
          if (!activeChatId) { // If it was a new chat
             setActiveChatId(data.threadId); // Set it as active
             // Save the new chat session if needed
             if (isSavingNewChat.current) {
                 const newSession: ChatSession = {
                     threadId: data.threadId,
                     // Simple title generation from the first user message
                     title: currentMessage.substring(0, 30) + (currentMessage.length > 30 ? '...' : ''),
                     timestamp: Date.now(),
                 };
                 // Add to state, ensuring no duplicates, and sort
                 setChatSessions(prevSessions => 
                     [newSession, ...prevSessions.filter(s => s.threadId !== newSession.threadId)]
                     .sort((a, b) => b.timestamp - a.timestamp)
                 );
                 isSavingNewChat.current = false; // Reset flag
                 console.log("New chat session saved:", newSession.threadId);
             }
          }
      });

      eventSource.addEventListener("thread.message.created", (event) => {
          const messageData = JSON.parse(event.data);
          streamedMessageId = messageData.id;
          console.log("SSE - Assistant message created:", streamedMessageId);
      });

      eventSource.addEventListener("thread.message.delta", (event) => {
        const data = JSON.parse(event.data);
        const delta = data.delta?.content?.[0];

        if (delta?.type === 'text' && delta.text?.value) {
          fullStreamedContent += delta.text.value;
          // Update the last message in history (which is the streaming one)
          setHistory((prev) =>
            prev.map((msg, index) =>
              index === prev.length - 1
                ? { ...msg, content: fullStreamedContent }
                : msg
            )
          );
        }
      });

      eventSource.addEventListener("thread.message.completed", (event) => {
         console.log("SSE - Message stream completed.");
         // Mark the last message as no longer streaming
          setHistory((prev) =>
            prev.map((msg, index) =>
              index === prev.length - 1
                ? { ...msg, isStreaming: false } // Finalize
                : msg
            )
          );
         eventSource.close(); // Close connection once message is fully received
         eventSourceRef.current = null;
         setLoading(false);
         inputRef.current?.focus();
      });

       eventSource.addEventListener("stream.end", (event) => {
         console.log("SSE - Backend signaled stream end.");
         // This might be redundant if message.completed closes, but good for cleanup
         if (eventSourceRef.current) {
           eventSource.close();
           eventSourceRef.current = null;
         }
         setLoading(false);
         inputRef.current?.focus();
          // Ensure the last message is marked as not streaming if somehow missed
          setHistory((prev) =>
            prev.map((msg, index) =>
              index === prev.length - 1 && msg.isStreaming
                ? { ...msg, isStreaming: false }
                : msg
            )
          );
       });

       eventSource.addEventListener("stream.error", (event) => {
           console.error("SSE - Error from server stream:", event.data);
           const data = JSON.parse(event.data);
           setError(`Assistant Error: ${data.error || 'Unknown stream error'}`);
           // Remove the streaming placeholder message on error
           setHistory((prev) => prev.filter((msg, index) => index !== prev.length -1 || !msg.isStreaming));
           eventSource.close();
           eventSourceRef.current = null;
           setLoading(false);
           inputRef.current?.focus();
       });

      eventSource.onerror = (err) => {
        console.error("SSE - EventSource failed:", err);
        setError("Connection error with the assistant.");
        eventSource.close();
        eventSourceRef.current = null;
        setLoading(false);
         // Remove the streaming placeholder message on connection error
         setHistory((prev) => prev.filter((msg, index) => index !== prev.length -1 || !msg.isStreaming));
        inputRef.current?.focus();
      };

    } catch (err: any) {
      // This catch block might be less likely to trigger with EventSource
      // unless the initial connection setup fails immediately.
      console.error("Error initiating stream:", err);
      setError(`Error: ${err.message || "Failed to connect to the assistant."}`);
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  // Handle Enter key press in input
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !loading) {
      handleSend();
    }
  };

  // Function to handle clicking a starter prompt
  const handleStarterClick = (promptText: string) => {
      setMessage(promptText);
      // Use a timeout to allow state to update before sending
      setTimeout(() => { 
         // Trigger send after state update
         handleSend(); 
      }, 0);
  };

  return (
    // Main container using flex for sidebar + main content
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar 
        chatSessions={chatSessions}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteAllChats={handleDeleteAllChats}
      />

      {/* Main Chat Area */}
      <div className="flex flex-col flex-grow">
       

        {/* Message History Area OR Chat Starters */}
        <main className="flex-grow overflow-y-auto">
           <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col h-full"> {/* Added h-full */} 
             {/* Conditional Rendering: Show starters or history */} 
             {history.length === 0 && !loading ? (
                // Chat Starters View - Refined layout
                <div className="flex flex-col items-center justify-center flex-grow text-center px-4"> {/* Added flex-grow */} 
                    <h2 className="text-2xl font-semibold text-foreground mb-8">How can I help you today?</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg"> 
                        {starterPrompts.map((prompt, idx) => {
                            const Icon = prompt.icon; // Get icon component
                            return (
                                <Button
                                    key={idx}
                                    variant="outline"
                                    size="lg" // Larger button size
                                    className="h-auto text-left whitespace-normal justify-start border-border hover:bg-accent hover:text-accent-foreground p-4" // Added padding
                                    onClick={() => handleStarterClick(prompt.text)} // Pass only text
                                >
                                    <Icon className="w-5 h-5 mr-3 flex-shrink-0 text-muted-foreground" /> {/* Icon styling */} 
                                    <span>{prompt.text}</span>
                                </Button>
                            );
                        })}
                    </div>
                </div>
             ) : (
                // Message History View
                <div className="space-y-4">
                  {history.map((msg, idx) => (
                    <ChatMessage key={idx} message={msg} />
                  ))}
                  <div ref={chatEndRef} />
                </div>
             )}
          </div>
        </main>

        {/* Footer: Takes full width of this column */}
         <footer className="bg-background pb-1">
           <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-muted-foreground min-h-[24px]">
             {/* Show loading text OR streaming indicator, but not both? Maybe adjust. */}
             {loading && !history[history.length - 1]?.isStreaming && (
               <p className="italic text-center py-1">Assistant is connecting...</p>
             )}
             {error && <p className="text-red-400 font-medium text-center py-1">{error}</p>}
           </div>
         </footer>

        {/* Input Area: Use shadcn components */}
        <div className="sticky bottom-0 bg-gradient-to-t from-background via-background/95 to-background/0 pb-4 pt-2">
           <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="relative flex items-center gap-2 p-2 bg-card border border-border rounded-lg shadow-lg">
                  <Input
                     ref={inputRef}
                     type="text"
                     value={message}
                     onChange={(e) => setMessage(e.target.value)}
                     onKeyDown={handleKeyDown}
                     placeholder="Ask anything..."
                     disabled={loading || !activeChatId && history.length > 0}
                     className="flex-grow bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-muted-foreground pl-3 pr-10 h-10"
                   />
                   <Button
                     type="submit"
                     size="icon" 
                     onClick={handleSend}
                     disabled={loading || !message.trim() || (!activeChatId && history.length > 0)}
                     className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 shrink-0"
                     aria-label="Send message"
                   >
                     <SendIcon />
                   </Button>
              </div>
           </div>
        </div>
      </div> {/* End Main Chat Area Column */} 
    </div> // End Main Container Flex
  );
};

export default App;