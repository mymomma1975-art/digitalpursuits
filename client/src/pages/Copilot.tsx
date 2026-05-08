import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Lightbulb, MessageCircle, Zap } from "lucide-react";
import { Streamdown } from "streamdown";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: number;
  title: string;
  topic: string;
  messages: Message[];
}

export default function Copilot() {
  const { user } = useAuth();
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<"agent_building" | "website_creation" | "analytics" | "troubleshooting" | "general">("general");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.copilot.chat.useMutation();
  const suggestionsQuery = trpc.copilot.suggestions.useQuery();
  const markSuggestionMutation = trpc.copilot.markSuggestionDone.useMutation();

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user) return;

    setIsLoading(true);
    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    try {
      const response = await chatMutation.mutateAsync({
        conversationId: currentConversation?.id,
        message: inputValue,
        topic: selectedTopic,
        context: {
          currentPage: "copilot",
        },
      });

      setCurrentConversation((prev) => ({
        ...prev,
        id: response.conversationId,
        title: prev?.title || `Conversation - ${new Date().toLocaleDateString()}`,
        topic: selectedTopic,
        messages: [],
      }));

      const assistantMessage: Message = {
        id: response.messageId,
        role: "assistant",
        content: response.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Refetch suggestions after response
      suggestionsQuery.refetch();
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: Message = {
        id: Date.now(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkSuggestionDone = async (suggestionId: number) => {
    try {
      await markSuggestionMutation.mutateAsync({ suggestionId });
      suggestionsQuery.refetch();
    } catch (error) {
      console.error("Failed to mark suggestion as done:", error);
    }
  };

  const topicOptions = [
    { value: "agent_building" as const, label: "🤖 Agent Building", icon: "🤖" },
    { value: "website_creation" as const, label: "🌐 Website Creation", icon: "🌐" },
    { value: "analytics" as const, label: "📊 Analytics", icon: "📊" },
    { value: "troubleshooting" as const, label: "🔧 Troubleshooting", icon: "🔧" },
    { value: "general" as const, label: "💬 General", icon: "💬" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Copilot</h1>
          <p className="text-muted-foreground">Your intelligent assistant for building agents, creating websites, and optimizing your platform</p>
        </div>

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="chat">
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="suggestions">
              <Lightbulb className="w-4 h-4 mr-2" />
              Suggestions
            </TabsTrigger>
            <TabsTrigger value="help">
              <Zap className="w-4 h-4 mr-2" />
              Quick Help
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <div className="grid grid-cols-4 gap-6">
              {/* Main Chat Area */}
              <div className="col-span-3">
                <Card className="flex flex-col h-[600px] bg-card">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-center">
                        <div>
                          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground mb-2">No messages yet</p>
                          <p className="text-sm text-muted-foreground">Select a topic and start chatting with your AI assistant</p>
                        </div>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {msg.role === "assistant" ? (
                              <Streamdown>{msg.content}</Streamdown>
                            ) : (
                              <p>{msg.content}</p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-muted text-muted-foreground px-4 py-2 rounded-lg flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Thinking...
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="border-t p-4 space-y-3">
                    <div className="flex gap-2">
                      {topicOptions.map((option) => (
                        <Button
                          key={option.value}
                          variant={selectedTopic === option.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedTopic(option.value)}
                          className="text-xs"
                        >
                          {option.icon} {option.label.split(" ")[1]}
                        </Button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ask me anything about NexusCommand..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <Button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Sidebar - Quick Tips */}
              <div className="col-span-1 space-y-4">
                <Card className="p-4 bg-card">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Quick Tips
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>✓ Ask about building AI agents</li>
                    <li>✓ Get website creation guidance</li>
                    <li>✓ Optimize your analytics</li>
                    <li>✓ Troubleshoot issues</li>
                    <li>✓ Access platform documentation</li>
                  </ul>
                </Card>

                <Card className="p-4 bg-card">
                  <h3 className="font-semibold mb-3">Current Topic</h3>
                  <Badge className="w-full text-center justify-center">
                    {topicOptions.find((t) => t.value === selectedTopic)?.label}
                  </Badge>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestionsQuery.data && suggestionsQuery.data.length > 0 ? (
                suggestionsQuery.data.map((suggestion) => (
                  <Card key={suggestion.id} className="p-4 bg-card">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{suggestion.title}</h3>
                      <Badge variant={suggestion.priority === "high" ? "destructive" : "secondary"}>{suggestion.priority}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{suggestion.description}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkSuggestionDone(suggestion.id)}
                      disabled={markSuggestionMutation.isPending}
                    >
                      {markSuggestionMutation.isPending ? "Marking..." : "Mark as Done"}
                    </Button>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <Lightbulb className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No suggestions yet. Chat with the copilot to get personalized recommendations!</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Help Tab */}
          <TabsContent value="help">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Building AI Agents",
                  description: "Learn how to create custom AI agents trained on your business data",
                  topics: ["System prompts", "Training data", "Deployment", "Analytics"],
                },
                {
                  title: "Website Creation",
                  description: "Create professional websites with embedded AI chatbots",
                  topics: ["Page builder", "Domain setup", "Customization", "Publishing"],
                },
                {
                  title: "Analytics & Optimization",
                  description: "Monitor and optimize your agents and websites",
                  topics: ["Metrics", "Performance", "Improvements", "Reports"],
                },
                {
                  title: "Troubleshooting",
                  description: "Get help with common issues and problems",
                  topics: ["Agent issues", "Website problems", "Errors", "Support"],
                },
              ].map((section, idx) => (
                <Card key={idx} className="p-6 bg-card hover:bg-card/80 transition-colors cursor-pointer">
                  <h3 className="font-semibold mb-2">{section.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {section.topics.map((topic) => (
                      <Badge key={topic} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
