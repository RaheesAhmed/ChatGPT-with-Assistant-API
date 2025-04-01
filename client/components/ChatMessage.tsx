import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Define an interface for chat messages (can be shared)
interface Message {
  role: "user" | "assistant";
  content: string;
}

// Added interface for streaming message parts (can be shared)
interface StreamMessage extends Message {
  isStreaming?: boolean;
}

// --- Icon Components (Consider moving to a separate file) ---
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 rounded-full">
     <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

const AssistantIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 rounded-full">
     <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
);
// --- End Icon Components ---


interface ChatMessageProps {
  message: StreamMessage;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { role, content, isStreaming } = message;

  // Styling Definitions using theme variables
  const bubbleBaseClass = "max-w-[95%] rounded-xl px-4 py-2.5 text-sm leading-relaxed shadow";
  // User uses solid primary color
  const userBubbleClass = "bg-primary text-primary-foreground"; // Use solid primary background
  // Assistant uses card background
  const assistantBubbleClass = "bg-[--card] text-[--card-foreground] border border-border"; // Use card bg and text

  const isUser = role === 'user';

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Icon Column */} 
      {!isUser && (
          // Use secondary text/bg for assistant icon holder
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center mt-1">
             <AssistantIcon />
          </div>
      )}

      {/* Bubble Column */}
      <div
        className={`${bubbleBaseClass} ${
          isUser ? userBubbleClass : assistantBubbleClass
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          // Apply prose styles based on card foreground for better theme matching
          <div className="prose prose-sm prose-p:last-of-type:mb-0 prose-ul:list-disc prose-ul:list-inside prose-ol:list-decimal prose-ol:list-inside dark:prose-invert max-w-none" style={{ color: 'var(--card-foreground)' }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        )}
        {/* Blinking cursor - use foreground color */} 
        {isStreaming && role === 'assistant' && (
          <span style={{ backgroundColor: 'var(--card-foreground)' }} className="inline-block w-2 h-4 ml-1 animate-pulse opacity-70"></span>
        )}
      </div>

       {/* Icon Column */} 
       {isUser && (
           // Use primary bg/text for user icon holder
           <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center mt-1">
             <UserIcon />
           </div>
       )}
    </div>
  );
};

export default ChatMessage; 