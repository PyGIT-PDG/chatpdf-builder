export interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  type: 'user' | 'system';
}