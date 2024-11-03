import type { ChatMessage } from '@/lib/types';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessage;
  isLoading?: boolean;
}

const ChatMessage = ({ message, isLoading }: ChatMessageProps) => {
  const isUser = message.type === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-slide-in`}>
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          isUser 
            ? 'bg-blue-500 dark:bg-blue-600 text-white' 
            : 'bg-chat-light dark:bg-gray-800 border border-chat-border dark:border-gray-700'
        }`}
      >
        <div className="flex items-center gap-2">
          <p className="text-sm">{message.content}</p>
          {isUser && isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-blue-100" />
          )}
        </div>
        <span className={`text-xs mt-1 block ${isUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
          {format(message.timestamp, 'HH:mm')}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;