import { Router, type IRouter } from "express";
import { GetAchievementsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const ACHIEVEMENTS = [
  // --- Message milestones ---
  {
    id: "first_message",
    title: "First Step",
    description: "Send your very first message",
    icon: "sparkles",
    criteria: "messages_sent",
    criteriaCount: 1,
  },
  {
    id: "five_messages",
    title: "Getting Started",
    description: "Send 5 messages in total",
    icon: "message-circle",
    criteria: "messages_sent",
    criteriaCount: 5,
  },
  {
    id: "twenty_messages",
    title: "Routine Regular",
    description: "Send 20 messages — you're building a habit",
    icon: "trophy",
    criteria: "messages_sent",
    criteriaCount: 20,
  },
  {
    id: "fifty_messages",
    title: "Half Century",
    description: "Send 50 messages — truly committed",
    icon: "zap",
    criteria: "messages_sent",
    criteriaCount: 50,
  },
  // --- Topic-based ---
  {
    id: "morning_routine",
    title: "Early Riser",
    description: "Ask about a morning routine",
    icon: "sunrise",
    criteria: "morning_questions",
    criteriaCount: 1,
  },
  {
    id: "night_owl",
    title: "Night Owl",
    description: "Ask about an evening or night routine",
    icon: "moon",
    criteria: "night_questions",
    criteriaCount: 1,
  },
  {
    id: "sleep_expert",
    title: "Sleep Expert",
    description: "Ask about sleep or rest",
    icon: "bed",
    criteria: "sleep_questions",
    criteriaCount: 1,
  },
  {
    id: "fitness_focus",
    title: "Fitness Focus",
    description: "Ask about exercise or working out",
    icon: "dumbbell",
    criteria: "fitness_questions",
    criteriaCount: 1,
  },
  {
    id: "habit_hunter",
    title: "Habit Hunter",
    description: "Ask about habits 3 times",
    icon: "repeat",
    criteria: "habit_questions",
    criteriaCount: 3,
  },
  {
    id: "weekend_planner",
    title: "Weekend Ready",
    description: "Ask about weekend plans or activities",
    icon: "sun",
    criteria: "weekend_questions",
    criteriaCount: 1,
  },
  {
    id: "hobby_explorer",
    title: "Hobby Explorer",
    description: "Ask about fitting hobbies into your routine",
    icon: "gamepad",
    criteria: "hobby_questions",
    criteriaCount: 1,
  },
  {
    id: "study_buddy",
    title: "Study Buddy",
    description: "Ask about studying or schoolwork in your routine",
    icon: "book-open",
    criteria: "study_questions",
    criteriaCount: 1,
  },
  {
    id: "goal_setter",
    title: "Goal Setter",
    description: "Mention a personal goal or target in a message",
    icon: "target",
    criteria: "goal_messages",
    criteriaCount: 1,
  },
  // --- Message style / unique ---
  {
    id: "deep_thinker",
    title: "Deep Thinker",
    description: "Send a detailed message over 150 characters",
    icon: "brain",
    criteria: "long_messages",
    criteriaCount: 1,
  },
  {
    id: "loud_voice",
    title: "Loud Voice",
    description: "Send a message entirely in UPPERCASE",
    icon: "volume-2",
    criteria: "all_caps_message",
    criteriaCount: 1,
  },
  {
    id: "curious_mind",
    title: "Curious Mind",
    description: "Ask 5 questions in your conversations",
    icon: "help-circle",
    criteria: "questions_asked",
    criteriaCount: 5,
  },
  {
    id: "midnight_grind",
    title: "Midnight Grind",
    description: "Have a late-night routine session (after 10 PM)",
    icon: "clock",
    criteria: "night_sessions",
    criteriaCount: 1,
  },
  // --- Files ---
  {
    id: "file_shared",
    title: "Document Drop",
    description: "Upload a file to enhance your routine advice",
    icon: "file-up",
    criteria: "files_uploaded",
    criteriaCount: 1,
  },
  {
    id: "file_trio",
    title: "Triple Upload",
    description: "Upload 3 files across your conversations",
    icon: "files",
    criteria: "files_uploaded",
    criteriaCount: 3,
  },
  {
    id: "file_five",
    title: "Document Master",
    description: "Upload 5 files to your conversations",
    icon: "hard-drive",
    criteria: "files_uploaded",
    criteriaCount: 5,
  },
  // --- Theme / prompts ---
  {
    id: "theme_explorer",
    title: "Style Switcher",
    description: "Try out a different color theme",
    icon: "palette",
    criteria: "themes_tried",
    criteriaCount: 2,
  },
  {
    id: "theme_collector",
    title: "Theme Collector",
    description: "Use all 10 color themes at least once",
    icon: "layout-grid",
    criteria: "all_themes_tried",
    criteriaCount: 10,
  },
  {
    id: "prompt_user",
    title: "Inspired",
    description: "Use one of the suggested starter prompts",
    icon: "lightbulb",
    criteria: "used_prompt",
    criteriaCount: 1,
  },
  // --- Streaks ---
  {
    id: "streak_three",
    title: "Three Day Streak",
    description: "Chat on 3 different days",
    icon: "flame",
    criteria: "days_used",
    criteriaCount: 3,
  },
  {
    id: "streak_seven",
    title: "Week Warrior",
    description: "Chat on 7 different days",
    icon: "calendar",
    criteria: "days_used",
    criteriaCount: 7,
  },
  // --- Meta ---
  {
    id: "halfway_there",
    title: "Halfway There",
    description: "Unlock 14 of the 28 available achievements",
    icon: "award",
    criteria: "achievements_unlocked",
    criteriaCount: 14,
  },
  // --- SECRETS ---
  {
    id: "secret_math",
    title: "Math Wizard",
    description: "Hint: Numbers never lie... try asking the AI to crunch something for you.",
    icon: "calculator",
    criteria: "math_questions",
    criteriaCount: 1,
  },
  {
    id: "secret_print",
    title: "Code Whisperer",
    description: "Hint: Real devs don't just ask questions — they run them. Maybe try executing your prompt?",
    icon: "terminal",
    criteria: "print_questions",
    criteriaCount: 1,
  },
];

router.get("/achievements", async (_req, res): Promise<void> => {
  res.json(GetAchievementsResponse.parse(ACHIEVEMENTS));
});

export default router;
