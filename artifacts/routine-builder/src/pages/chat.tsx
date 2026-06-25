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
  LucideZap, LucideMoon, LucideBed, LucideDumbbell, LucideRepeat2,
  LucideSun, LucideBrain, LucideFiles, LucidePalette, LucideCalendar,
  LucideCalculator, LucideLightbulb, LucideLayoutGrid, LucideGamepad2,
  LucideTarget, LucideVolume2, LucideHelpCircle, LucideClock, LucideHardDrive,
  LucideAward, LucideTerminal, LucideBookOpen, LucideLibrary, LucideSmartphone,
  LucidePenLine, LucideGitCompare, LucideAlarmClock, LucideDatabase,
  LucideSalad, LucideHeart, LucideListChecks, LucideLayoutDashboard,
  LucideMousePointerClick, LucideKey,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTheme, type ThemeId } from "@/hooks/use-theme";

type Citation = { filename: string; text?: string };
type Message = { id: string; role: "user" | "assistant"; content: string; citations?: Citation[] };
type UploadedFile = { fileId: string; filename: string };

const SUGGESTED_PROMPTS = [
  "What's a great morning routine for summer?",
  "How do I balance fun and productivity?",
  "Give me a schedule for a productive summer day",
  "How do I build healthy habits that actually stick?",
];

const SECRET_IDS = new Set(["secret_math", "secret_print", "secret_bot_clicks", "secret_word"]);

const ICON_MAP: Record<string, React.ReactNode> = {
  sparkles: <LucideSparkles className="w-5 h-5" />,
  "message-circle": <LucideMessageCircle className="w-5 h-5" />,
  trophy: <LucideTrophy className="w-5 h-5" />,
  "file-up": <LucideFileUp className="w-5 h-5" />,
  sunrise: <LucideSunrise className="w-5 h-5" />,
  flame: <LucideFlame className="w-5 h-5" />,
  zap: <LucideZap className="w-5 h-5" />,
  moon: <LucideMoon className="w-5 h-5" />,
  bed: <LucideBed className="w-5 h-5" />,
  dumbbell: <LucideDumbbell className="w-5 h-5" />,
  repeat: <LucideRepeat2 className="w-5 h-5" />,
  sun: <LucideSun className="w-5 h-5" />,
  brain: <LucideBrain className="w-5 h-5" />,
  files: <LucideFiles className="w-5 h-5" />,
  palette: <LucidePalette className="w-5 h-5" />,
  calendar: <LucideCalendar className="w-5 h-5" />,
  calculator: <LucideCalculator className="w-5 h-5" />,
  lightbulb: <LucideLightbulb className="w-5 h-5" />,
  "layout-grid": <LucideLayoutGrid className="w-5 h-5" />,
  gamepad: <LucideGamepad2 className="w-5 h-5" />,
  target: <LucideTarget className="w-5 h-5" />,
  "volume-2": <LucideVolume2 className="w-5 h-5" />,
  "help-circle": <LucideHelpCircle className="w-5 h-5" />,
  clock: <LucideClock className="w-5 h-5" />,
  "hard-drive": <LucideHardDrive className="w-5 h-5" />,
  award: <LucideAward className="w-5 h-5" />,
  terminal: <LucideTerminal className="w-5 h-5" />,
  "book-open": <LucideBookOpen className="w-5 h-5" />,
  library: <LucideLibrary className="w-5 h-5" />,
  "smartphone-off": <LucideSmartphone className="w-5 h-5" />,
  "pen-line": <LucidePenLine className="w-5 h-5" />,
  "git-compare": <LucideGitCompare className="w-5 h-5" />,
  "alarm-clock": <LucideAlarmClock className="w-5 h-5" />,
  database: <LucideDatabase className="w-5 h-5" />,
  salad: <LucideSalad className="w-5 h-5" />,
  heart: <LucideHeart className="w-5 h-5" />,
  "list-checks": <LucideListChecks className="w-5 h-5" />,
  "layout-dashboard": <LucideLayoutDashboard className="w-5 h-5" />,
  "mouse-pointer-click": <LucideMousePointerClick className="w-5 h-5" />,
  key: <LucideKey className="w-5 h-5" />,
};

function getProgress(): Record<string, number> {
  const daysRaw = localStorage.getItem("daysUsed");
  const days: string[] = daysRaw ? JSON.parse(daysRaw) : [];
  const triedRaw = localStorage.getItem("triedThemes");
  const triedThemes: string[] = triedRaw ? JSON.parse(triedRaw) : ["midnight"];
  const unlocked: string[] = JSON.parse(localStorage.getItem("unlockedAchievements") || "[]");
  const achievementsOpened = localStorage.getItem("achievementsMenuOpened") === "1";
  const settingsOpened = localStorage.getItem("settingsMenuOpened") === "1";
  return {
    messages_sent: parseInt(localStorage.getItem("messagesSent") || "0", 10),
    files_uploaded: parseInt(localStorage.getItem("filesUploaded") || "0", 10),
    morning_questions: parseInt(localStorage.getItem("morningQuestions") || "0", 10),
    night_questions: parseInt(localStorage.getItem("nightQuestions") || "0", 10),
    sleep_questions: parseInt(localStorage.getItem("sleepQuestions") || "0", 10),
    fitness_questions: parseInt(localStorage.getItem("fitnessQuestions") || "0", 10),
    habit_questions: parseInt(localStorage.getItem("habitQuestions") || "0", 10),
    weekend_questions: parseInt(localStorage.getItem("weekendQuestions") || "0", 10),
    hobby_questions: parseInt(localStorage.getItem("hobbyQuestions") || "0", 10),
    study_questions: parseInt(localStorage.getItem("studyQuestions") || "0", 10),
    reading_questions: parseInt(localStorage.getItem("readingQuestions") || "0", 10),
    screen_questions: parseInt(localStorage.getItem("screenQuestions") || "0", 10),
    writing_questions: parseInt(localStorage.getItem("writingQuestions") || "0", 10),
    balance_questions: parseInt(localStorage.getItem("balanceQuestions") || "0", 10),
    nutrition_questions: parseInt(localStorage.getItem("nutritionQuestions") || "0", 10),
    mindfulness_questions: parseInt(localStorage.getItem("mindfulnessQuestions") || "0", 10),
    productivity_questions: parseInt(localStorage.getItem("productivityQuestions") || "0", 10),
    goal_messages: parseInt(localStorage.getItem("goalMessages") || "0", 10),
    long_messages: parseInt(localStorage.getItem("longMessages") || "0", 10),
    all_caps_message: parseInt(localStorage.getItem("allCapsMessages") || "0", 10),
    questions_asked: parseInt(localStorage.getItem("questionsAsked") || "0", 10),
    night_sessions: parseInt(localStorage.getItem("nightSessions") || "0", 10),
    morning_sessions: parseInt(localStorage.getItem("morningSessions") || "0", 10),
    both_menus_opened: achievementsOpened && settingsOpened ? 1 : 0,
    bot_icon_clicks: parseInt(localStorage.getItem("botIconClicks") || "0", 10),
    math_questions: parseInt(localStorage.getItem("mathQuestions") || "0", 10),
    print_questions: parseInt(localStorage.getItem("printQuestions") || "0", 10),
    secret_word_messages: parseInt(localStorage.getItem("secretWordMessages") || "0", 10),
    themes_tried: parseInt(localStorage.getItem("themesSwitched") || "1", 10),
    all_themes_tried: triedThemes.length,
    used_prompt: parseInt(localStorage.getItem("usedPrompt") || "0", 10),
    days_used: days.length,
    achievements_unlocked: unlocked.length,
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

function inc(key: string) {
  localStorage.setItem(key, (parseInt(localStorage.getItem(key) || "0", 10) + 1).toString());
}

function analyzeMessage(text: string) {
  const lower = text.toLowerCase();
  const trim = text.trim();

  if (/morning|wake up|alarm|breakfast/.test(lower)) inc("morningQuestions");
  if (/evening|night|nighttime|before bed|wind down/.test(lower)) inc("nightQuestions");
  if (/sleep|rest|nap|bedtime/.test(lower)) inc("sleepQuestions");
  if (/exercise|workout|gym|fitness|run|jog|walk|sport/.test(lower)) inc("fitnessQuestions");
  if (/habit|routine|consistent|daily/.test(lower)) inc("habitQuestions");
  if (/weekend|saturday|sunday|days off/.test(lower)) inc("weekendQuestions");
  if (/hobby|hobbies|interest|passion|leisure|activity|activities/.test(lower)) inc("hobbyQuestions");
  if (/study|homework|school|class|exam|test|learn|assignment/.test(lower)) inc("studyQuestions");
  if (/\bread(ing|s|er)?\b|books?|novel|literature/.test(lower)) inc("readingQuestions");
  if (/social media|screen time|phone time|instagram|tiktok|youtube|scrolling|digital detox/.test(lower)) inc("screenQuestions");
  if (/writing|write|journal(ing)?|essay|creative writing/.test(lower)) inc("writingQuestions");
  if (/balanc(e|ing).{1,30}(and|with|between)|juggl|split.{1,20}time|divide.{1,20}time|manage both/.test(lower)) inc("balanceQuestions");
  if (/\b(food|eat|meal|diet|nutrition|calorie|protein|vegetable|fruit|cooking|snack)\b/.test(lower)) inc("nutritionQuestions");
  if (/\b(mental health|stress|anxiety|mindful|meditation|meditate|wellbeing|well-being|calm|overwhelm|burnout)\b/.test(lower)) inc("mindfulnessQuestions");
  if (/\b(productiv|time management|plann|schedul|priorit|focus|efficiency|deep work|pomodoro)\b/.test(lower)) inc("productivityQuestions");
  if (/\bgoal|target|objective|aim\b/.test(lower)) inc("goalMessages");
  if (trim.length > 150) inc("longMessages");
  if (trim.length >= 3 && /[A-Z]/.test(trim) && trim === trim.toUpperCase()) inc("allCapsMessages");
  if (trim.endsWith("?")) inc("questionsAsked");

  const hour = new Date().getHours();
  if (hour >= 22 || hour <= 3) inc("nightSessions");
  if (hour < 11) inc("morningSessions");

  if (/\d+.*[+\-*/=÷×]|[+\-*/=÷×].*\d+|\b(calculate|math|how much|add|subtract|multiply|divide|percent|sum|total|equals|times)\b/.test(lower)) {
    inc("mathQuestions");
  }
  if (/^print\(["'][\s\S]+["']\)$/.test(trim)) inc("printQuestions");
  if (/\bsecret\b/.test(lower)) inc("secretWordMessages");
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
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
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
      toast({ title: "Achievement Unlocked!", description: title });
    }
  }, [achievements, toast]);

  const handleBotIconClick = () => {
    inc("botIconClicks");
    checkAchievements(getProgress());
  };

  const handleAchievementsMenuOpen = (open: boolean) => {
    if (open) {
      localStorage.setItem("achievementsMenuOpened", "1");
      checkAchievements(getProgress());
    }
  };

  const handleSettingsMenuOpen = (open: boolean) => {
    if (open) {
      localStorage.setItem("settingsMenuOpened", "1");
      checkAchievements(getProgress());
    }
  };

  const trackTheme = (id: string) => {
    const raw = localStorage.getItem("triedThemes");
    const tried: string[] = raw ? JSON.parse(raw) : ["midnight"];
    if (!tried.includes(id)) {
      tried.push(id);
      localStorage.setItem("triedThemes", JSON.stringify(tried));
    }
    const switched = Math.max(parseInt(localStorage.getItem("themesSwitched") || "1", 10) + 1, 2);
    localStorage.setItem("themesSwitched", switched.toString());
  };

  const handleThemeChange = (id: ThemeId) => {
    trackTheme(id);
    changeTheme(id);
    checkAchievements(getProgress());
  };

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
      inc("filesUploaded");
      checkAchievements(getProgress());
    } catch {
      toast({ title: "Upload Failed", description: "Could not upload file.", variant: "destructive" });
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const sendMessage = async (text: string, fromPrompt = false) => {
    if (!text.trim() && !attachedFile) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsStreaming(true);

    const currentAttachedFile = attachedFile;
    setAttachedFile(null);

    inc("messagesSent");
    if (fromPrompt) localStorage.setItem("usedPrompt", "1");
    analyzeMessage(text);
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
          <button
            onClick={handleBotIconClick}
            className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary hover:bg-primary/30 transition-colors cursor-pointer focus:outline-none"
            aria-label="Routine AI logo"
          >
            <LucideBot className="w-6 h-6" />
          </button>
          <div>
            <h1 className="font-semibold text-lg leading-tight">(Ethan R.) Summer Routine Builder</h1>
            <p className="text-sm text-muted-foreground">Your personal coach for a great summer</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Drawer onOpenChange={handleAchievementsMenuOpen}>
            <DrawerTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 border-primary/20 hover:border-primary/50" data-testid="button-achievements">
                <LucideTrophy className="w-4 h-4 text-primary" />
                Achievements
              </Button>
            </DrawerTrigger>
            <DrawerContent className="bg-card border-border">
              <div className="max-w-md mx-auto w-full p-6 pb-8">
                <DrawerTitle className="text-xl font-bold mb-1 flex items-center gap-2">
                  <LucideTrophy className="w-5 h-5 text-primary" />
                  Your Progress
                </DrawerTitle>
                <p className="text-sm text-muted-foreground mb-5">
                  {unlockedIds.size} / {achievements?.length ?? 0} unlocked
                </p>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {achievements?.map(a => {
                    const unlocked = unlockedIds.has(a.id);
                    const isSecret = SECRET_IDS.has(a.id);
                    const progress = getProgress()[a.criteria] ?? 0;
                    const pct = Math.min(100, Math.round((progress / a.criteriaCount) * 100));

                    return (
                      <div
                        key={a.id}
                        data-testid={`achievement-${a.id}`}
                        className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                          unlocked
                            ? "border-primary/40 bg-primary/5"
                            : isSecret
                            ? "border-dashed border-muted-foreground/30 bg-background"
                            : "border-border bg-background"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          unlocked ? "bg-primary/20 text-primary" : isSecret ? "bg-muted/50 text-muted-foreground/50" : "bg-muted text-muted-foreground"
                        }`}>
                          {unlocked
                            ? (ICON_MAP[a.icon] ?? <LucideTrophy className="w-5 h-5" />)
                            : isSecret
                            ? <span className="text-lg font-bold opacity-40">?</span>
                            : <LucideLock className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium text-sm ${
                              unlocked ? "text-foreground" : isSecret ? "text-muted-foreground/60 italic" : "text-muted-foreground"
                            }`}>
                              {isSecret && !unlocked ? "???" : a.title}
                            </span>
                            {unlocked && <LucideCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                            {isSecret && !unlocked && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-muted-foreground/30 text-muted-foreground/50">secret</Badge>
                            )}
                          </div>
                          <div className={`text-xs mt-0.5 ${isSecret && !unlocked ? "text-muted-foreground/50 italic" : "text-muted-foreground"}`}>
                            {a.description}
                          </div>
                          {!unlocked && !isSecret && (
                            <div className="mt-2">
                              <div className="h-1 rounded-full bg-muted overflow-hidden">
                                <div className="h-full bg-primary/50 rounded-full transition-all" style={{ width: `${pct}%` }} />
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

          <Drawer onOpenChange={handleSettingsMenuOpen}>
            <DrawerTrigger asChild>
              <Button variant="outline" size="icon" className="border-border hover:border-primary/30" data-testid="button-settings">
                <LucideSettings className="w-4 h-4" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="bg-card border-border">
              <div className="max-w-md mx-auto w-full p-6 pb-8">
                <DrawerTitle className="text-xl font-bold mb-5 flex items-center gap-2">
                  <LucideSettings className="w-5 h-5 text-primary" />
                  Appearance
                </DrawerTitle>
                <p className="text-sm text-muted-foreground mb-3">Color theme</p>
                <div className="grid grid-cols-2 gap-3">
                  {themes.map(theme => (
                    <button
                      key={theme.id}
                      data-testid={`theme-${theme.id}`}
                      onClick={() => handleThemeChange(theme.id as ThemeId)}
                      className={`flex items-center gap-3 p-3 rounded-lg border text-sm transition-all ${
                        themeId === theme.id
                          ? "border-primary/60 bg-primary/10 text-foreground"
                          : "border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
                      }`}
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
                  onClick={() => sendMessage(prompt, true)}
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
                <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center mt-1 ${
                  msg.role === "user" ? "bg-secondary text-secondary-foreground" : "bg-primary/20 text-primary"
                }`}>
                  {msg.role === "user" ? <LucideUser className="w-4 h-4" /> : <LucideBot className="w-4 h-4" />}
                </div>
                <div className={`max-w-[80%] space-y-2 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`p-4 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-secondary text-secondary-foreground rounded-tr-sm"
                      : "bg-card border border-border text-card-foreground rounded-tl-sm shadow-sm"
                  }`}>
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
