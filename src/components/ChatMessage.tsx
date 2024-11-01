import { ChatMessage } from '@/lib/types';
import { format } from 'date-fns';

interface ChatMessageProps {
  message: ChatMessage;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.type === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-slide-in`}>
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          isUser ? 'bg-blue-500 text-white' : 'bg-chat-light border border-chat-border'
        }`}
      >
        <p className="text-sm">{message.content}</p>
        <span className={`text-xs mt-1 block ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
          {format(message.timestamp, 'HH:mm')}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;