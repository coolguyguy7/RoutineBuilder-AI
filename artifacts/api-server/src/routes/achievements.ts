import { Router, type IRouter } from "express";
import { GetAchievementsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const ACHIEVEMENTS = [
  {
    id: "first_message",
    title: "First Step",
    description: "Send your very first message to Routine Man",
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
    description: "Send 20 messages — you're building a habit!",
    icon: "trophy",
    criteria: "messages_sent",
    criteriaCount: 20,
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
    id: "morning_routine",
    title: "Early Riser",
    description: "Ask about morning routines",
    icon: "sunrise",
    criteria: "morning_questions",
    criteriaCount: 1,
  },
  {
    id: "streak_three",
    title: "Three Day Streak",
    description: "Chat on 3 different days",
    icon: "flame",
    criteria: "days_used",
    criteriaCount: 3,
  },
];

router.get("/achievements", async (_req, res): Promise<void> => {
  res.json(GetAchievementsResponse.parse(ACHIEVEMENTS));
});

export default router;
