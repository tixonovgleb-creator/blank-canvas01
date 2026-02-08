export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export interface BaseInfo {
  name: string;
  location: string;
  features: string[];
}
