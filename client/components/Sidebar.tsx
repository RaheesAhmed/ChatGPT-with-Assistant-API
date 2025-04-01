import React from 'react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

interface ChatSession {
  threadId: string;
  title: string;
  timestamp?: number; // Optional: For sorting later
}

interface SidebarProps {
  chatSessions: ChatSession[];
  activeChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (threadId: string) => void;
  onDeleteAllChats: () => void;
}

// Placeholder Icons (replace with actual icons)
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);
const ChatBubbleIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 flex-shrink-0">
  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3.076-3.076c-.806.132-1.664.195-2.57.195h-4.718c-2.572 0-4.658-2.086-4.658-4.66V9.608c0-2.572 2.086-4.658 4.658-4.658h.989c.631 0 1.252.096 1.844.27l.79.158v-1.971c0-.97.616-1.811 1.508-2.097M16.5 9.608v2.882M12 9.608v2.882" />
 </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);

const Sidebar: React.FC<SidebarProps> = ({ 
  chatSessions, 
  activeChatId, 
  onNewChat, 
  onSelectChat, 
  onDeleteAllChats
}) => {
  return (
    <div className="flex flex-col h-full w-64 bg-[--sidebar] text-[--sidebar-foreground] border-r border-[--sidebar-border]">
      {/* New Chat Button */}
      <div className="p-3 border-b border-[--sidebar-border]">
        <Button 
          variant="outline"
          size="sm" 
          className="w-full justify-center bg-black text-white text-center border-[--sidebar-border] hover:bg-[--sidebar-accent] hover:text-[--sidebar-accent-foreground]"
          onClick={onNewChat}
        >
          <PlusIcon />
          <span className="ml-2 text-center">New Chat</span>
        </Button>
      </div>

      {/* Chat History List with ScrollArea */}
      <ScrollArea className="flex-grow p-2">
        <h2 className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Chat History</h2>
        <nav className="space-y-1">
          {chatSessions.length === 0 && (
              <p className="px-2 py-1 text-sm text-muted-foreground italic">No past chats yet.</p>
          )}
          {chatSessions.map((session) => (
            <Button
              key={session.threadId}
              variant={session.threadId === activeChatId ? "secondary" : "ghost"}
              size="sm"
              className="w-full justify-start h-9"
              onClick={() => onSelectChat(session.threadId)}
            >
              <ChatBubbleIcon />
              <span className="truncate flex-grow text-left ml-1">{session.title || 'Untitled Chat'}</span>
            </Button>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer with Delete Button */}
       <div className="p-3 border-t border-[--sidebar-border] mt-auto">
         <Button 
           variant="destructive"
           size="sm"
           className="w-full justify-start"
           onClick={onDeleteAllChats}
           disabled={chatSessions.length === 0}
         >
           <TrashIcon />
           <span className="ml-2">Delete All Chats</span>
         </Button>
       </div>
    </div>
  );
};

export default Sidebar; 