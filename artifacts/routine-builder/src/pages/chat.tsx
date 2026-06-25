import React, { useState, useRef, useEffect, useCallback } from "react";
import { useGetAchievements } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import {
  LucideSend, LucidePaperclip, LucideTrophy, LucideBot, LucideUser,
  LucideFile, LucideX, LucideSettings, LucideSparkles, LucideMessageCircle,
  LucideFlame, LucideSunrise, LucideFileUp, LucideLock, LucideCheck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTheme, THEMES, type ThemeId } from "@/hooks/use-theme";

type Citation = { filename: string; text?: string };
type Message = { id: string; role: "user" | "assistant"; content: string; citations?: Citation[] };
type UploadedFile = { fileId: string; filename: string };

const SUGGESTED_PROMPTS = [
  "What's a great morning routine for summer?",
  "How do I balance fun and productivity?",
  "Give me a schedule for a productive summer day",
  "How do I build healthy habits that actually stick?",
];

const ICON_MAP: Record<string, React.ReactNode> = {
  sparkles: <LucideSparkles className="w-5 h-5" />,
  "message-circle": <LucideMessageCircle className="w-5 h-5" />,
  trophy: <LucideTrophy className="w-5 h-5" />,
  "file-up": <LucideFileUp className="w-5 h-5" />,
  sunrise: <LucideSunrise className="w-5 h-5" />,
  flame: <LucideFlame className="w-5 h-5" />,
};

function getProgress(): Record<string, number> {
  const daysRaw = localStorage.getItem("daysUsed");
  const days: string[] = daysRaw ? JSON.parse(daysRaw) : [];
  return {
    messages_sent: parseInt(localStorage.getItem("messagesSent") || "0", 10),
    files_uploaded: parseInt(localStorage.getItem("filesUploaded") || "0", 10),
    morning_questions: parseInt(localStorage.getItem("morningQuestions") || "0", 10),
    days_used: days.length,
  };
}

function recordDay() {
  const today = new Date().toISOString().split("T")[0];
  const daysRaw = localStorage.getItem("daysUsed");
  const days: string[] = daysRaw ? JSON.parse(daysRaw) : [];
  if (!days.includes(today)) {
    days.push(today);
    localStorage.setItem("daysUsed", JSON.stringify(days));
  }
}

export default function ChatPage() {
  const { data: achievements } = useGetAchievements();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [attachedFile, setAttachedFile] = useState<UploadedFile | null>(null);
  const [previousResponseId, setPreviousResponseId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(() => {
    const raw = localStorage.getItem("unlockedAchievements");
    return raw ? new Set(JSON.parse(raw)) : new Set();
  });

  const { toast } = useToast();
  const { themeId, changeTheme, themes } = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const checkAchievements = useCallback((progress: Record<string, number>) => {
    if (!achievements) return;
    const newlyUnlocked: string[] = [];

    setUnlockedIds(prev => {
      const next = new Set(prev);
      for (const a of achievements) {
        const current = progress[a.criteria] ?? 0;
        if (current >= a.criteriaCount && !next.has(a.id)) {
          next.add(a.id);
          newlyUnlocked.push(a.title);
        }
      }
      if (newlyUnlocked.length > 0) {
        localStorage.setItem("unlockedAchievements", JSON.stringify([...next]));
      }
      return next;
    });

    for (const title of newlyUnlocked) {
      toast({
        title: "Achievement Unlocked!",
        description: title,
      });
    }
  }, [achievements, toast]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/chat/files", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setAttachedFile(data);

      const count = parseInt(localStorage.getItem("filesUploaded") || "0", 10) + 1;
      localStorage.setItem("filesUploaded", count.toString());
      checkAchievements(getProgress());
    } catch {
      toast({ title: "Upload Failed", description: "Could not upload file.", variant: "destructive" });
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() && !attachedFile) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsStreaming(true);

    const currentAttachedFile = attachedFile;
    setAttachedFile(null);

    const msgCount = parseInt(localStorage.getItem("messagesSent") || "0", 10) + 1;
    localStorage.setItem("messagesSent", msgCount.toString());

    if (/morning/i.test(text)) {
      const mq = parseInt(localStorage.getItem("morningQuestions") || "0", 10) + 1;
      localStorage.setItem("morningQuestions", mq.toString());
    }

    recordDay();
    checkAchievements(getProgress());

    const asstMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: asstMsgId, role: "assistant", content: "", citations: [] }]);

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
        body: JSON.stringify({
          message: text,
          previousResponseId,
          uploadedFileId: currentAttachedFile?.fileId || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter(l => l.startsWith("data: "));
          for (const line of lines) {
            const dataStr = line.replace("data: ", "").trim();
            if (!dataStr) continue;
            try {
              const data = JSON.parse(dataStr);
              if (data.done) {
                setMessages(prev =>
                  prev.map(m => m.id === asstMsgId ? { ...m, citations: data.citations } : m)
                );
                if (data.responseId) setPreviousResponseId(data.responseId);
              } else if (data.content) {
                setMessages(prev =>
                  prev.map(m => m.id === asstMsgId ? { ...m, content: m.content + data.content } : m)
                );
              }
            } catch { /* ignore parse errors */ }
          }
        }
      }
    } catch {
      toast({ title: "Error", description: "Failed to get response", variant: "destructive" });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-background text-foreground overflow-hidden">
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <LucideBot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-semibold text-lg leading-tight">(Ethan R.) Summer Routine Builder</h1>
            <p className="text-sm text-muted-foreground">Your personal coach for a great summer</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 border-primary/20 hover:border-primary/50" data-testid="button-achievements">
                <LucideTrophy className="w-4 h-4 text-primary" />
                Achievements
              </Button>
            </DrawerTrigger>
            <DrawerContent className="bg-card border-border">
              <div className="max-w-md mx-auto w-full p-6">
                <DrawerTitle className="text-xl font-bold mb-4 flex items-center gap-2">
                  <LucideTrophy className="w-5 h-5 text-primary" />
                  Your Progress
                </DrawerTitle>
                <div className="space-y-3">
                  {achievements?.map(a => {
                    const unlocked = unlockedIds.has(a.id);
                    const progress = getProgress()[a.criteria] ?? 0;
                    const pct = Math.min(100, Math.round((progress / a.criteriaCount) * 100));
                    return (
                      <div
                        key={a.id}
                        data-testid={`achievement-${a.id}`}
                        className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${unlocked ? "border-primary/40 bg-primary/5" : "border-border bg-background"}`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${unlocked ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                          {unlocked ? (ICON_MAP[a.icon] ?? <LucideTrophy className="w-5 h-5" />) : <LucideLock className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium text-sm ${unlocked ? "text-foreground" : "text-muted-foreground"}`}>{a.title}</span>
                            {unlocked && <LucideCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">{a.description}</div>
                          {!unlocked && (
                            <div className="mt-2">
                              <div className="h-1 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full bg-primary/50 rounded-full transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">{progress} / {a.criteriaCount}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </DrawerContent>
          </Drawer>

          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline" size="icon" className="border-border hover:border-primary/30" data-testid="button-settings">
                <LucideSettings className="w-4 h-4" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="bg-card border-border">
              <div className="max-w-md mx-auto w-full p-6">
                <DrawerTitle className="text-xl font-bold mb-5 flex items-center gap-2">
                  <LucideSettings className="w-5 h-5 text-primary" />
                  Appearance
                </DrawerTitle>
                <div>
                  <p className="text-sm text-muted-foreground mb-3">Color theme</p>
                  <div className="grid grid-cols-2 gap-3">
                    {themes.map(theme => (
                      <button
                        key={theme.id}
                        data-testid={`theme-${theme.id}`}
                        onClick={() => changeTheme(theme.id as ThemeId)}
                        className={`flex items-center gap-3 p-3 rounded-lg border text-sm transition-all ${themeId === theme.id ? "border-primary/60 bg-primary/10 text-foreground" : "border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"}`}
                      >
                        <span
                          className="w-5 h-5 rounded-full flex-shrink-0 border-2"
                          style={{
                            background: `hsl(${theme.primary})`,
                            borderColor: themeId === theme.id ? `hsl(${theme.primary})` : "transparent",
                          }}
                        />
                        {theme.label}
                        {themeId === theme.id && <LucideCheck className="w-3.5 h-3.5 ml-auto text-primary" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {messages.length === 0 ? (
          <div className="max-w-2xl mx-auto h-full flex flex-col items-center justify-center text-center space-y-8 py-12">
            <h2 className="text-3xl font-bold tracking-tight">Ask me anything about Routines</h2>
            <p className="text-muted-foreground max-w-md">
              I can help you build a solid schedule, find the right balance, and actually stick to your goals this summer.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  data-testid={`button-prompt-${i}`}
                  className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-colors text-sm text-left shadow-sm"
                  onClick={() => sendMessage(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center mt-1 ${msg.role === "user" ? "bg-secondary text-secondary-foreground" : "bg-primary/20 text-primary"}`}>
                  {msg.role === "user" ? <LucideUser className="w-4 h-4" /> : <LucideBot className="w-4 h-4" />}
                </div>
                <div className={`max-w-[80%] space-y-2 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`p-4 rounded-2xl ${msg.role === "user" ? "bg-secondary text-secondary-foreground rounded-tr-sm" : "bg-card border border-border text-card-foreground rounded-tl-sm shadow-sm"}`}>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content || "..."}</div>
                  </div>

                  {msg.citations && msg.citations.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2 w-full max-w-sm">
                      <Accordion type="single" collapsible className="w-full">
                        {msg.citations.map((cite, i) => (
                          <AccordionItem value={`item-${i}`} key={i} className="border-border">
                            <AccordionTrigger className="text-xs py-2 text-muted-foreground hover:text-primary px-2">
                              <span className="flex items-center gap-2">
                                <LucideFile className="w-3 h-3" />
                                {cite.filename}
                              </span>
                            </AccordionTrigger>
                            <AccordionContent className="text-xs p-3 bg-muted rounded-md text-muted-foreground">
                              {cite.text || "No excerpt available."}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border bg-background">
        <div className="max-w-3xl mx-auto">
          {attachedFile && (
            <div className="mb-3 flex items-center gap-2">
              <Badge variant="secondary" className="gap-2 px-3 py-1 bg-card border-border">
                <LucideFile className="w-3 h-3 text-primary" />
                {attachedFile.filename}
                <button onClick={() => setAttachedFile(null)} className="ml-1 hover:text-destructive text-muted-foreground">
                  <LucideX className="w-3 h-3" />
                </button>
              </Badge>
            </div>
          )}
          <div className="relative flex items-center bg-card rounded-full border border-border p-1 shadow-sm focus-within:ring-1 focus-within:ring-primary/50 focus-within:border-primary/50 transition-all">
            <div className="pl-2">
              <label className="cursor-pointer text-muted-foreground hover:text-primary transition-colors p-2 flex items-center justify-center rounded-full">
                <LucidePaperclip className="w-5 h-5" />
                <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading || isStreaming} />
              </label>
            </div>
            <Input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(inputValue);
                }
              }}
              placeholder="Type your message..."
              className="flex-1 border-0 focus-visible:ring-0 shadow-none bg-transparent h-12"
              disabled={isStreaming}
              data-testid="input-message"
            />
            <div className="pr-1">
              <Button
                size="icon"
                onClick={() => sendMessage(inputValue)}
                disabled={(!inputValue.trim() && !attachedFile) || isStreaming}
                className="rounded-full h-10 w-10 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-send"
              >
                <LucideSend className="w-4 h-4 ml-0.5" />
              </Button>
            </div>
          </div>
          <div className="text-center mt-2 text-xs text-muted-foreground">
            AI can make mistakes. Focus on what feels right for you.
          </div>
        </div>
      </div>
    </div>
  );
}
