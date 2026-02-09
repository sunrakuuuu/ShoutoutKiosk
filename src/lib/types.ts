// src/lib/types.ts
export interface Shoutout {
  id: string;
  senderName: string;
  recipientName: string;
  message: string;
  createdAt: number; // Unix timestamp
  frame?: string; // Optional frame ID
}

export type ShoutoutFrame = {
  id: string;
  name: string;
  className: string;
};
