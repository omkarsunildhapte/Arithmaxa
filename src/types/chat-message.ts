export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  /** Data URI of a photo attached via the Camera plugin, if any. */
  imageUrl?: string;
}
