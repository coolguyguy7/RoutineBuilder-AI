import { Router, type IRouter } from "express";
import { GetAchievementsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const ACHIEVEMENTS = [
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
    id: "deep_thinker",
    title: "Deep Thinker",
    description: "Send a detailed message over 150 characters",
    icon: "brain",
    criteria: "long_messages",
    criteriaCount: 1,
  },
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
    id: "theme_explorer",
    title: "Style Switcher",
    description: "Try out a different color theme",
    icon: "palette",
    criteria: "themes_tried",
    criteriaCount: 2,
  },
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
];

router.get("/achievements", async (_req, res): Promise<void> => {
  res.json(GetAchievementsResponse.parse(ACHIEVEMENTS));
});

export default router;
