import Pusher from "pusher";
import PusherClient from "pusher-js";

// Server-side Pusher instance
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID || "",
  key: process.env.PUSHER_KEY || "",
  secret: process.env.PUSHER_SECRET || "",
  cluster: process.env.PUSHER_CLUSTER || "us2",
  useTLS: true,
});

// Client-side Pusher instance factory
export function getPusherClient() {
  return new PusherClient(
    process.env.NEXT_PUBLIC_PUSHER_KEY || "",
    {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2",
      authEndpoint: "/api/pusher/auth",
    }
  );
}

// Event types
export const PUSHER_EVENTS = {
  NEW_MESSAGE: "new-message",
  TYPING_START: "typing-start",
  TYPING_STOP: "typing-stop",
  NOTIFICATION: "notification",
} as const;

// Helper function to get chat channel name
export function getChatChannel(chatId: string) {
  return `private-chat-${chatId}`;
}
