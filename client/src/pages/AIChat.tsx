import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Bot, Plus, Send, Loader2, Trash2, MessageSquare, Code, Mail } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

type ChatMode = "general" | "email_extract" | "code_generate";

export default function AIChat() {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<ChatMode>("general");
  const bottomRef = useRef<HTMLDivElement>(null);

  const utils = trpc.useUtils();
  const { data: conversations } = trpc.ai.conversations.useQuery();
  const { data: messages } = trpc.ai.messages.useQuery(
    { conversationId: selectedConversation! },
    { enabled: !!selectedConversation }
  );
  const createConvMutation = trpc.ai.createConversation.useMutation({
    onSuccess: (data) => { utils.ai.conversations.invalidate(); setSelectedConversation(data.id); },
  });
  const deleteConvMutation = trpc.ai.deleteConversation.useMutation({
    onSuccess: () => { utils.ai.conversations.invalidate(); setSelectedConversation(null); },
  });
  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: () => { utils.ai.messages.invalidate(); },
  });

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, chatMutation.isPending]);

  function handleSend() {
    if (!message.trim()) return;
    if (!selectedConversation) {
      createConvMutation.mutate({ title: message.slice(0, 60) }, {
        onSuccess: (data) => {
          chatMutation.mutate({ conversationId: data.id, message, mode });
          setMessage("");
        },
      });
    } else {
      chatMutation.mutate({ conversationId: selectedConversation, message, mode });
      setMessage("");
    }
  }

  const modeIcons: Record<ChatMode, any> = { general: MessageSquare, email_extract: Mail, code_generate: Code };
  const modeLabels: Record<ChatMode, string> = { general: "General Assistant", email_extract: "Email Extractor", code_generate: "Code Generator" };

  return (
    <DashboardLayout>
      <div className="flex gap-4 h-[calc(100vh-8rem)]">
        {/* Sidebar */}
        <div className="w-64 shrink-0 flex flex-col">
          <Button onClick={() => { setSelectedConversation(null); }} size="sm" className="mb-3 w-full">
            <Plus className="h-4 w-4 mr-1" /> New Chat
          </Button>
          <ScrollArea className="flex-1">
            <div className="space-y-1">
              {conversations?.map((conv: any) => (
                <div
                  key={conv.id}
                  className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors group ${selectedConversation === conv.id ? "bg-accent" : "hover:bg-accent/50"}`}
                  onClick={() => setSelectedConversation(conv.id)}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{conv.title || "Untitled"}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(conv.updatedAt).toLocaleDateString()}</p>
                  </div>
                  <Button
                    variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
                    onClick={(e) => { e.stopPropagation(); deleteConvMutation.mutate({ id: conv.id }); }}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-card rounded-xl border border-border/50 overflow-hidden">
          {/* Mode selector */}
          <div className="flex items-center gap-3 p-3 border-b border-border/50">
            <Select value={mode} onValueChange={(v) => setMode(v as ChatMode)}>
              <SelectTrigger className="w-[200px] h-8 text-xs bg-accent/30 border-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">
                  <span className="flex items-center gap-2"><MessageSquare className="h-3 w-3" /> General Assistant</span>
                </SelectItem>
                <SelectItem value="email_extract">
                  <span className="flex items-center gap-2"><Mail className="h-3 w-3" /> Email Extractor</span>
                </SelectItem>
                <SelectItem value="code_generate">
                  <span className="flex items-center gap-2"><Code className="h-3 w-3" /> Code Generator</span>
                </SelectItem>
              </SelectContent>
            </Select>
            <span className="text-[10px] text-muted-foreground">
              {mode === "email_extract" ? "Paste emails to extract payment info, tracking numbers, and transaction details" :
               mode === "code_generate" ? "Describe what you need and get production-ready code" :
               "Ask anything about your business, get help with tasks, and more"}
            </span>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            {!selectedConversation && !messages?.length ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <Bot className="h-16 w-16 text-muted-foreground/20 mb-4" />
                <h3 className="text-lg font-semibold">NexusCommand AI</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  Your intelligent business assistant with memory retention. I can extract payment info from emails, generate code, and help manage your business.
                </p>
                <div className="grid grid-cols-3 gap-3 mt-6 max-w-lg">
                  {[
                    { icon: Mail, label: "Extract payment tracking numbers from this email...", mode: "email_extract" as ChatMode },
                    { icon: Code, label: "Build me a landing page with...", mode: "code_generate" as ChatMode },
                    { icon: MessageSquare, label: "What's my business revenue this month?", mode: "general" as ChatMode },
                  ].map((suggestion, i) => (
                    <button
                      key={i}
                      className="p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors text-left"
                      onClick={() => { setMode(suggestion.mode); setMessage(suggestion.label); }}
                    >
                      <suggestion.icon className="h-4 w-4 text-primary mb-2" />
                      <p className="text-[11px] text-muted-foreground line-clamp-3">{suggestion.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages?.map((msg: any) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                    {msg.role === "assistant" && (
                      <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-lg px-3 py-2 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-accent/50"}`}>
                      <div className="text-sm prose prose-invert prose-sm max-w-none">
                        <Streamdown>{msg.content}</Streamdown>
                      </div>
                    </div>
                  </div>
                ))}
                {chatMutation.isPending && (
                  <div className="flex gap-3">
                    <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-accent/50 rounded-lg px-3 py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t border-border/50">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={mode === "email_extract" ? "Paste email content to extract payment info..." : mode === "code_generate" ? "Describe the software you need..." : "Ask your AI assistant anything..."}
                className="bg-accent/30 border-0"
                disabled={chatMutation.isPending}
              />
              <Button onClick={handleSend} disabled={chatMutation.isPending || !message.trim()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
