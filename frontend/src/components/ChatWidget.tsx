"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { MessageCircle, X, Send, Loader2, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! How can I help you with logistics products, shipments, or business topics today? If you have a specific question or area of interest, let me know and I'll provide the information you need.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { getToken } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
    setMessages(prev => [...prev, { role: "user", content: userMessage, timestamp: now }]);
    setIsLoading(true);

    try {
      const token = await getToken();
      // Assuming FastAPI is running on port 8000. 
      // If deployed, this should use the correct backend URL.
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response");
      }

      const data = await response.json();
      const replyNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply, timestamp: replyNow }]);
    } catch (error) {
      console.error(error);
      const errNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "I'm having trouble connecting right now. Please try again later.", timestamp: errNow }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      {isOpen ? (
        <Card className="w-[400px] h-[600px] max-h-[85vh] max-w-[90vw] flex flex-col shadow-2xl animate-in slide-in-from-bottom-2 fade-in duration-300 border border-border rounded-2xl overflow-hidden bg-card">
          <CardHeader className="p-4 flex flex-row items-center justify-end space-y-0 bg-card border-b-0 pb-0">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-text-muted hover:text-text-primary" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 p-5 overflow-y-auto flex flex-col space-y-8 bg-card">
            <div className="text-center py-2 mb-2">
              <h2 className="text-[28px] font-bold text-text-primary tracking-tight leading-tight">
                What can <br /><span className="text-accent">LogisticsAI</span> do for you?
              </h2>
            </div>
            {messages.map((msg, index) => (
              <div key={index} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} w-full`}>
                {msg.role === "assistant" ? (
                  <div className="flex gap-4 max-w-[95%]">
                    <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex flex-col">
                      <div className="text-[15px] text-text-primary leading-relaxed max-w-none">
                        <ReactMarkdown
                          components={{
                            p: ({ node, ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-3" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-3" {...props} />,
                            li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                            strong: ({ node, ...props }) => <strong className="font-semibold text-text-primary" {...props} />,
                            a: ({ node, ...props }) => <a className="text-accent hover:underline" {...props} />
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                      <span className="text-[11px] text-text-muted mt-1.5 font-medium">LogisticsAI • {msg.timestamp}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-end max-w-[85%]">
                    <div className="px-4 py-2.5 rounded-2xl bg-surface border border-border text-text-primary text-[15px]">
                      {msg.content}
                    </div>
                    <span className="text-[11px] text-text-muted mt-1.5 font-medium">Sent: {msg.timestamp}</span>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4 max-w-[90%]">
                <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="h-5 w-5 text-accent" />
                </div>
                <div className="flex flex-col justify-center">
                  <div className="flex items-center text-[15px] text-text-primary pt-1">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Thinking...
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>
          <CardFooter className="p-4 bg-card border-t-0 pt-2 pb-6">
            <form onSubmit={handleSubmit} className="flex w-full items-center border-2 border-accent rounded-full bg-bg px-1.5 py-1.5 shadow-sm">
              <Input
                placeholder="Message AI Assistant"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent shadow-none px-4 text-[15px] placeholder:text-text-muted text-text-primary h-9"
              />
              <Button type="submit" variant="ghost" size="icon" disabled={!input.trim() || isLoading} className="rounded-full h-9 w-9 bg-transparent hover:bg-surface text-text-muted hover:text-accent">
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-accent hover:bg-accent-hover text-white"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
