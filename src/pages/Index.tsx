import { useState } from "react";
import { ChatMessage } from "@/lib/types";
import ChatSection from "@/components/ChatSection";
import PDFPreview from "@/components/PDFPreview";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { sendChatMessage } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const EXAMPLE_PROMPTS = [
  "Create me an invoice for client ABC for the services provided",
  "Create me an employment contract for a new sales manager",
  "Create me a non-disclosure agreement between my company and a contractor",
  "Create me a legal notice for a breach of contract",
  "Create me a financial report for the first quarter of 2024",
  "Create me a meeting agenda for the project kickoff meeting",
  "Create me a business proposal for the XYZ project",
  "Create me a purchase order for 50 laptops",
  "Create me a formal letter to request a visa",
  "Create me a presentation on the company's annual performance"
];

const Index = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pdfContent, setPdfContent] = useState(null);
  const [showInitialModal, setShowInitialModal] = useState(true);
  const [initialDescription, setInitialDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  // Get 4 random examples
  const randomExamples = EXAMPLE_PROMPTS
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);

  const extractPDFContent = (response: string) => {
    try {
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1]);
      }
      return null;
    } catch (error) {
      console.error('Failed to parse PDF content:', error);
      return null;
    }
  };

  const handleNewMessage = async (content: string) => {
    const messageId = uuidv4();
    const userMessage: ChatMessage = {
      id: messageId,
      content,
      timestamp: new Date(),
      type: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage(content);
      
      const pdfDefinition = extractPDFContent(response.response);
      
      const apiMessage: ChatMessage = {
        id: uuidv4(),
        content: response.message || "Received PDF content",
        timestamp: new Date(),
        type: "system",
      };
      setMessages((prev) => [...prev, apiMessage]);
      
      if (pdfDefinition) {
        setPdfContent(pdfDefinition);
      }
    } catch (error: any) {
      let errorMessage = "Failed to send message. Please try again.";
      
      if (error.status === 429 || (error.body && error.body.includes("Credits exhausted"))) {
        errorMessage = "API credits have been exhausted. Please check your subscription.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      const errorChatMessage: ChatMessage = {
        id: uuidv4(),
        content: errorMessage,
        timestamp: new Date(),
        type: "system",
      };
      setMessages((prev) => [...prev, errorChatMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialDescription.trim()) {
      setShowInitialModal(false);
      handleNewMessage(initialDescription);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Dialog open={showInitialModal} onOpenChange={setShowInitialModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Welcome to PDFGen</DialogTitle>
            <DialogDescription className="text-lg pt-2">
              Describe the type of PDF document you would like to create
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInitialSubmit} className="space-y-6">
            <Textarea
              value={initialDescription}
              onChange={(e) => setInitialDescription(e.target.value)}
              placeholder="E.g., Create a professional resume template..."
              className="w-full min-h-[120px]"
            />
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Example prompts:</p>
              <div className="grid grid-cols-1 gap-3">
                {randomExamples.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start h-auto py-3 px-4 whitespace-normal text-left"
                    onClick={() => setInitialDescription(example)}
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full">
              Start Creating
            </Button>
          </form>
        </DialogContent>
      </Dialog>

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
          <ChatSection 
            messages={messages} 
            onNewMessage={handleNewMessage}
            isLoading={isLoading}
          />
        </div>
        <div className="flex-1 h-[50vh] md:h-auto">
          <PDFPreview pdfContent={pdfContent} />
        </div>
      </div>
    </div>
  );
};

export default Index;
