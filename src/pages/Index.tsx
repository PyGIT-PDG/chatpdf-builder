import { useState } from "react";
import { ChatMessage } from "@/lib/types";
import ChatSection from "@/components/ChatSection";
import PDFPreview from "@/components/PDFPreview";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const Index = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      content: "Welcome! Start typing to create your PDF.",
      timestamp: new Date(),
      type: "system",
    },
  ]);

  const { theme, setTheme } = useTheme();

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
    <div className="flex flex-col h-screen bg-background">
      <div className="flex justify-between items-center p-4 border-b border-chat-border dark:border-gray-700">
        <h1 className="text-xl md:text-2xl font-bold dark:text-white">PDFGen</h1>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-8 w-8 md:h-10 md:w-10"
        >
          <Sun className="h-4 w-4 md:h-5 md:w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 md:h-5 md:w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <div className="w-full md:w-[30%] md:min-w-[300px]">
          <ChatSection messages={messages} onNewMessage={handleNewMessage} />
        </div>
        <div className="flex-1 h-[50vh] md:h-auto">
          <PDFPreview messages={messages} />
        </div>
      </div>
    </div>
  );
};

export default Index;