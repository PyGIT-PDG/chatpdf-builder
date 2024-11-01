import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSubmit: (message: string) => void;
}

const ChatInput = ({ onSubmit }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSubmit(message);
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t border-chat-border dark:border-gray-700 dark:bg-gray-900">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
      />
      <Button type="submit" size="icon" className="dark:bg-blue-600 dark:hover:bg-blue-700">
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};

export default ChatInput;