import { useState } from "react";
import { ChatMessage as ChatMessageType } from "@/lib/types";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatSectionProps {
  onNewMessage: (content: string) => void;
  messages: ChatMessageType[];
}

const ChatSection = ({ messages, onNewMessage }: ChatSectionProps) => {
  return (
    <div className="flex flex-col h-full border-r border-chat-border dark:border-gray-700 dark:bg-gray-900">
      <div className="p-4 border-b border-chat-border dark:border-gray-700">
        <h2 className="text-lg font-semibold dark:text-white">Chat</h2>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>
      </ScrollArea>

      <ChatInput onSubmit={onNewMessage} />
    </div>
  );
};

export default ChatSection;