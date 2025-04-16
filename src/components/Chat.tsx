"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCwIcon, Send } from "lucide-react";

import type { Message } from "@/generated/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { saveGrammarImprovements, sendMessageToDB } from "@/utils/db";
import {
  continueConversation,
  findGrammarImprovements,
} from "@/utils/gemini-ai";

interface IChat {
  initialMessages: Message[];
  conversationId: string;
}

const Chat = ({ initialMessages, conversationId }: IChat) => {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && message.trim()) {
      sendMessage();
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || isProcessing) return;
    setIsProcessing(true);

    setIsTyping(true);

    const currentMessage = message.trim();
    setMessage("");

    try {
      const userMessage = {
        content: currentMessage,
        role: "user",
        id: `temp-${Date.now()}`,
        conversationId,
        createdAt: new Date(),
      } as Message;

      setMessages((prev) => [...prev, userMessage]);

      if (isTyping) {
        setMessages((prev) => [
          ...prev,
          {
            content: "...",
            role: "assistant",
            id: "typing-indicator",
            conversationId,
            createdAt: new Date(),
          } as Message,
        ]);
      }

      const [newMessage, correction] = await Promise.all([
        sendMessageToDB(currentMessage, conversationId, "user"),
        findGrammarImprovements(currentMessage),
      ]);

      if (!newMessage) return;

      if (
        correction &&
        newMessage &&
        newMessage.content !== "Nenhum erro gramatical encontrado"
      ) {
        await saveGrammarImprovements(newMessage.id, correction);
      }

      setMessages((prev) => {
        const filtered = prev.filter(
          (message) => message.id !== userMessage.id
        );
        return [...filtered, newMessage];
      });

      const aiResponse = await continueConversation(
        [...messages, newMessage],
        currentMessage
      );

      if (!aiResponse) return;

      const newAiMessage = await sendMessageToDB(
        aiResponse.content,
        conversationId,
        "assistant"
      );

      if (!newAiMessage) return;

      setMessages((prev) => {
        const filtered = prev.filter(
          (message) => message.id !== "typing-indicator"
        );
        return [...filtered, newAiMessage];
      });
    } catch (error) {
      console.error("Error sending message", error);
      setMessages((prev) =>
        prev.filter((message) => message.id !== "typing-indicator")
      );
    } finally {
      setIsProcessing(false);
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Badge variant={"default"} className="w-32 flex justify-center">
          Pratique Inglês
        </Badge>
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Quantas palavras você aprendeu hoje?
        </h1>
        <p className="text-muted-foreground">
          Pratique seu inglês com um assistente de IA particular.
        </p>
      </motion.div>
      <Card className="mb-4">
        <CardContent className="mb-6 p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 mb-6 min-h-[300px] max-h-[350px] overflow-y-auto"
          >
            <AnimatePresence>
              {messages.map((message, i) => (
                <motion.div
                  layout
                  key={i}
                  layoutId={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={cn(
                    "flex items-start gap-3",
                    message.role === "user" && "flex-row-reverse"
                  )}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={
                        message.role === "assistant"
                          ? "/ai-avatar.png"
                          : "/user-avatar.png"
                      }
                    />
                    <AvatarFallback>
                      {message.role === "assistant" ? "IA" : "EU"}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "rounded-lg p-3 max-2-[80%]",
                      message.role === "assistant"
                        ? "bg-accent/10 text-foreground"
                        : "bg-primary text-primary/foreground"
                    )}
                  >
                    <p>{message.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          <Separator className="my-4" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-3"
          >
            <div className="flex-1 flex gap-3">
              <Input
                placeholder={
                  isProcessing
                    ? "Aguardando resposta..."
                    : "Digite sua mensagem..."
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isProcessing}
                className="flex-1"
              />

              <Button
                className="shrink-0"
                onClick={sendMessage}
                disabled={!message.trim() || isProcessing}
              >
                {isProcessing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="h-5 w-5"
                  >
                    <RotateCwIcon />
                  </motion.div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
};

export { Chat };
