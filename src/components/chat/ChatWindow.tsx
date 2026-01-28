"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Send, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getPusherClient, getChatChannel, PUSHER_EVENTS } from "@/lib/pusher";
import type { Channel } from "pusher-js";
import { DateConfirmationCard } from "./DateConfirmationCard";
import { ChatMessageActions } from "./ChatMessageActions";
import { SafetyBanner } from "./SafetyBanner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: Date;
}

interface ChatWindowProps {
  chatId: string;
  requestId: string;
  currentUserId: string;
  otherUserId: string;
  isInvitee: boolean;
  requestApprovalStatus: string;
  initialMessages: Message[];
  otherUserName: string;
  otherUserVerified: boolean;
}

export function ChatWindow({
  chatId,
  requestId,
  currentUserId,
  otherUserId,
  isInvitee,
  requestApprovalStatus,
  initialMessages,
  otherUserName,
  otherUserVerified,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const channelRef = useRef<Channel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set up Pusher real-time connection
  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(getChatChannel(chatId));
    channelRef.current = channel;

    // Listen for new messages
    channel.bind(PUSHER_EVENTS.NEW_MESSAGE, (newMsg: Message) => {
      // Only add message if it's not from current user (they already see it locally)
      if (newMsg.senderId !== currentUserId) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m.id === newMsg.id)) {
            return prev;
          }
          return [...prev, newMsg];
        });
      }
    });

    // Listen for typing indicators
    channel.bind(PUSHER_EVENTS.TYPING_START, (data: { userId: string }) => {
      if (data.userId !== currentUserId) {
        setIsTyping(true);
      }
    });

    channel.bind(PUSHER_EVENTS.TYPING_STOP, (data: { userId: string }) => {
      if (data.userId !== currentUserId) {
        setIsTyping(false);
      }
    });

    // Cleanup on unmount
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(getChatChannel(chatId));
      pusher.disconnect();
    };
  }, [chatId, currentUserId]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const messageContent = newMessage.trim();
    setNewMessage("");
    setWarningMessage(null);

    try {
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: messageContent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      // Add the new message to the list
      setMessages((prev) => [...prev, data.message]);

      // Show warning if present
      if (data.warning) {
        setWarningMessage(data.warning);
        setTimeout(() => setWarningMessage(null), 5000);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Restore the message if it failed to send
      setNewMessage(messageContent);
      const errorMessage = error instanceof Error ? error.message : "Failed to send message. Please try again.";
      alert(errorMessage);
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  };

  // Handle typing indicators
  const handleTypingStart = () => {
    if (channelRef.current) {
      channelRef.current.trigger("client-typing-start", {
        userId: currentUserId,
      });

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        handleTypingStop();
      }, 3000);
    }
  };

  const handleTypingStop = () => {
    if (channelRef.current) {
      channelRef.current.trigger("client-typing-stop", {
        userId: currentUserId,
      });
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  // Handle text input change with typing indicator
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    if (e.target.value.trim()) {
      handleTypingStart();
    } else {
      handleTypingStop();
    }
  };

  // Handle Enter key to send (Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTypingStop();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with Actions */}
      <div className="border-b bg-background p-4">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{otherUserName}</h2>
            <p className="text-sm text-muted-foreground">
              {otherUserVerified ? "Verified User" : "Unverified User"}
            </p>
          </div>
          <ChatMessageActions
            otherUserId={otherUserId}
            otherUserName={otherUserName}
            chatId={chatId}
          />
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Safety Banner */}
        <div className="container mx-auto max-w-4xl">
          <SafetyBanner isVerified={otherUserVerified} otherUserName={otherUserName} />
        </div>

        {/* Warning Message */}
        {warningMessage && (
          <div className="container mx-auto max-w-4xl">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{warningMessage}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Date Confirmation Card - shown when request is approved */}
        {requestApprovalStatus === "approved" && (
          <div className="max-w-2xl mx-auto mb-6">
            <DateConfirmationCard
              requestId={requestId}
              isInvitee={isInvitee}
            />
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Card className="p-8 text-center max-w-md">
              <h3 className="text-lg font-semibold mb-2">
                Start the conversation
              </h3>
              <p className="text-muted-foreground">
                Send a message to {otherUserName} to get started!
              </p>
            </Card>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isCurrentUser = message.senderId === currentUserId;

              return (
                <div
                  key={message.id}
                  className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] ${
                      isCurrentUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    } rounded-lg p-4 shadow-sm`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    <p
                      className={`text-xs mt-2 ${
                        isCurrentUser
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {formatDistanceToNow(new Date(message.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-muted-foreground italic">
                    {otherUserName} is typing...
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t bg-background p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={newMessage}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="min-h-[60px] max-h-[200px] resize-none"
              disabled={isSending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isSending}
              size="icon"
              className="h-[60px] w-[60px] flex-shrink-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
