import { useState } from "react";
import { ChatMessage } from "@/lib/types";
import ChatSection from "@/components/ChatSection";
import PDFPreview from "@/components/PDFPreview";
import { v4 as uuidv4 } from "uuid";

const Index = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      content: "Welcome! Start typing to create your PDF.",
      timestamp: new Date(),
      type: "system",
    },
  ]);

  const handleNewMessage = (content: string) => {
    const newMessage: ChatMessage = {
      id: uuidv4(),
      content,
      timestamp: new Date(),
      type: "user",
    };
    
    setMessages((prev) => [...prev, newMessage]);
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="w-[30%] min-w-[300px]">
        <ChatSection messages={messages} onNewMessage={handleNewMessage} />
      </div>
      <div className="flex-1">
        <PDFPreview messages={messages} />
      </div>
    </div>
  );
};

export default Index;